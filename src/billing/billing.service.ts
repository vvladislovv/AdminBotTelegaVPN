import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Prisma,
  Payment as PrismaPayment,
  Subscription,
  PaymentStatus,
  PaymentMethod,
  SubscriptionStatus,
  SubscriptionPlan,
} from '@prisma/client';

declare module '@prisma/client' {
  interface PrismaPayment {
    paymentUrl?: string | null;
  }
}

import { PrismaService } from '../prisma/prisma.service'
import { PaymentResponseDto } from './dto/payment-response.dto'
import { SUBSCRIPTION_PLANS } from './dto/subscription-plan.dto'
import { CreateSubscriptionDto } from './dto/subscription-request.dto'
import { SubscriptionResponseDto } from './dto/subscription-response.dto'; 
import { WebhookEventDto } from './dto/webhook-event.dto'
import { TelegramPayService } from './telegram-pay.service'
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { ClientCreatePaymentLinkDto } from './dto/client-create-payment-link.dto';
import { PaymentLinkResponseDto } from './dto/payment-link-response.dto';

// Augment Prisma's generated types
declare global {
  namespace PrismaJson {
    // Define types for JSON fields if you have them, e.g., for metadata
    type PaymentMetadata = { [key: string]: any };
  }
}

// Define a type that includes the subscription relation and uses the augmented Payment type.
type PaymentWithSubscription = PrismaPayment & {
  subscription: Subscription[] | null;
};

// Helper function to handle unknown errors
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

@Injectable()
export class BillingService {
  /**
   * Создать invoice через Telegram Pay и вернуть ссылку на оплату
   */
  async createTelegramPayInvoice(userId: number, clientDto: ClientCreatePaymentLinkDto): Promise<PaymentLinkResponseDto> {
    const plans = await this.getSubscriptionPlans();
    const plan = plans.find(p => p.id === clientDto.planId);

    if (!plan) {
      throw new NotFoundException(`Тариф с ID '${clientDto.planId}' не найден.`);
    }

    // TODO: Реализовать логику промокодов для коррекции amount
    const amount = plan.price; // Предполагаем, что цена в копейках/центах
    const description = `Оплата тарифа: ${plan.name}`;
    const currency = plan.currency || 'RUB'; // Валюта из тарифа или по умолчанию

    // Генерируем уникальный orderId, если он нужен для TelegramPayService
    // или если вы хотите его отслеживать. Можно использовать UUID.
    const orderId = `order_${userId}_${Date.now()}`;

    // Внутренний orderId для логов и отслеживания
    const internalOrderId = `order_${userId}_${Date.now()}_${clientDto.planId}`;
    this.logger.log(`Internal Order ID generated: ${internalOrderId}`);

    const createPaymentData: CreatePaymentLinkDto = {
      amount,
      description,
      currency,
      // orderId: internalOrderId, // Не отправляем order_id в Telegapay /create_paylink, если его нет в API
      payment_method: 'BANK_SBER', // TODO: Определить, как получать это значение (пока хардкод)
      userId: String(userId),      // Передаем userId, преобразованный в строку, если API ожидает строку
      return_url: this.configService.get('TELEGRAM_PAY_RETURN_URL') || 'https://example.com/payment_callback', // TODO: Настроить в .env
    };

    this.logger.log(`Creating payment link for user ${userId}, plan ${clientDto.planId}, amount ${amount}`);

    try {
      const paymentLinkResponse = await this.telegramPayService.createPaymentLink(createPaymentData);
      
      // Здесь можно сохранить информацию о созданном платеже в БД, если нужно
      // Например, сгенерировать paymentIntent и сохранить его до подтверждения оплаты
      // await this.prisma.payment.create(...);

      return paymentLinkResponse;
    } catch (error) {
      this.logger.error(`Failed to create payment link for user ${userId}: ${getErrorMessage(error)}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Не удалось создать ссылку на оплату.');
    }
  }
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly telegramPayService: TelegramPayService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans() {
    return Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
      id: id as SubscriptionPlan,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      durationDays: plan.durationDays,
      features: Object.entries(plan.features).map(([name, value]) => ({
        name,
        value: String(value),
        description: '' 
      }))
    }));
  }

  /**
   * Get user's active subscriptions
   */
  async getUserSubscriptions(userId: number): Promise<SubscriptionResponseDto[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        status: {
          in: [SubscriptionStatus.PAID, SubscriptionStatus.PENDING],
        },
      },
      include: {
        payment: true,
        bot: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subscriptions.map(sub => {
      const response: SubscriptionResponseDto = {
        id: sub.id,
        userId: sub.userId,
        plan: sub.plan as SubscriptionPlan,
        status: sub.status as keyof typeof SubscriptionStatus,
        startDate: sub.periodStart ?? new Date(0),
        endDate: sub.periodEnd ?? new Date(0),
        isActive: sub.status === SubscriptionStatus.PAID,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      };
      
      return response;
    });
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: number, userId: number): Promise<SubscriptionResponseDto> {
    try {
      // Get the subscription
      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
      });

      if (!subscription) {
        throw new NotFoundException(`Subscription with ID ${id} not found`);
      }

      // Check if the subscription belongs to the user
      if (subscription.userId !== userId) {
        throw new NotFoundException('Subscription not found');
      }

      // Get related bot
      const bot = await this.prisma.bot.findUnique({
        where: { id: subscription.botId },
        select: {
          id: true,
          name: true,
          token: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Get payment details with proper null handling
      const payment = await this.prisma.payment.findUnique({
        where: { id: subscription.paymentId ?? undefined },
        select: {
          id: true,
          status: true,
          amount: true,
          currency: true,
          externalId: true,
          orderId: true,
          description: true,
          metadata: true,
          method: true,
          createdAt: true,
          updatedAt: true,
        },
      }); 

      if (!payment) {
        throw new NotFoundException(`Payment not found for subscription ${subscription.id}`);
      }

      // Map to response DTO
      const response: SubscriptionResponseDto = {
        id: subscription.id,
        userId: subscription.userId,
        plan: subscription.plan as SubscriptionPlan,
        status: subscription.status as keyof typeof SubscriptionStatus,
        startDate: (subscription as any).startDate ?? subscription.periodStart ?? new Date(0),
        endDate: (subscription as any).endDate ?? subscription.periodEnd ?? null,
        isActive: subscription.status === SubscriptionStatus.PAID,
        periodStart: subscription.periodStart,
        periodEnd: subscription.periodEnd,
        bot: bot ? {
          id: bot.id,
          name: bot.name ?? '',
          token: '', 
          createdAt: bot.createdAt,
          updatedAt: bot.updatedAt,
        } : undefined,
        payment: payment ? {
          id: payment.id,
          status: payment.status as string,
          amount: payment.amount,
          currency: payment.currency,
          externalId: payment.externalId ?? undefined,
          orderId: payment.orderId ?? undefined,
          description: payment.description !== undefined ? String(payment.description) : null,
          metadata: payment.metadata ? JSON.parse(payment.metadata) : undefined,
          method: payment.method as string,
          paymentUrl: (payment as any).paymentUrl ?? undefined,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        } : null,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      };
      
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch subscription ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new InternalServerErrorException('Failed to fetch subscription');
    }
  }

  private getSubscriptionPlan(planId: string) {
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      throw new BadRequestException(`Subscription plan '${planId}' not found`);
    }
    return plan;
  }

  // Create a new subscription
  async createSubscription(
    userId: number, 
    createSubscriptionDto: CreateSubscriptionDto
  ): Promise<PaymentResponseDto> {
    const { plan: planId, botId } = createSubscriptionDto;

    try {
      // Get the plan details
      const plan = this.getSubscriptionPlan(planId);
      if (!plan) {
        throw new BadRequestException('Invalid subscription plan');
      }

      // Check if bot exists and belongs to user
      const bot = await this.prisma.bot.findUnique({
        where: { id: botId, userId },
      });

      if (!bot) {
        throw new NotFoundException(`Bot with ID ${botId} not found`);
      }

      // Create subscription in database
      const subscription = await this.prisma.subscription.create({
        data: {
          userId,
          botId,
          plan: planId,
          amount: plan.price,
          status: SubscriptionStatus.PENDING,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
        },
      });

      try {
        // Create payment metadata
        const metadata = {
          userId,
          botId,
          subscriptionId: subscription.id,
          plan: planId,
        };

        // Create payment link with metadata as string
        const paymentLink = await this.telegramPayService.createPaymentLink({ 
          amount: plan.price,
          currency: plan.currency,
          description: `Subscription for ${plan.name} plan`,
          metadata: JSON.stringify(metadata),
        } as any); 

        // Create payment record with type assertion
        const createdPayment: PrismaPayment = await this.prisma.payment.create({
          data: {
            userId,
            amount: plan.price,
            currency: plan.currency,
            status: PaymentStatus.PENDING,
            method: PaymentMethod.TELEGRAM_PAY,
            externalId: paymentLink.paymentId,
            orderId: paymentLink.orderId,
            description: `Subscription for ${plan.name} plan`,
            metadata: JSON.stringify(metadata),
          } as any, 
        });

        (createdPayment as any).paymentUrl = paymentLink.paymentUrl;

        // Map to PaymentResponseDto
        const response: PaymentResponseDto = {
          id: createdPayment.id,
          userId: createdPayment.userId,
          amount: createdPayment.amount,
          currency: createdPayment.currency,
          status: createdPayment.status,
          method: createdPayment.method,
          paymentUrl: (createdPayment as any).paymentUrl ?? undefined,
          externalId: createdPayment.externalId || undefined,
          orderId: createdPayment.orderId || undefined,
          description: createdPayment.description || undefined,
          metadata: createdPayment.metadata ? JSON.parse(createdPayment.metadata) : undefined,
          createdAt: createdPayment.createdAt,
          updatedAt: createdPayment.updatedAt,
        };
        
        return response;
      } catch (error) {
        // Clean up subscription if payment creation fails
        await this.prisma.subscription.delete({
          where: { id: subscription.id },
        }).catch(e => this.logger.error('Failed to clean up subscription after payment error', e));
        throw error;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      this.logger.error(`Failed to create subscription: ${errorMessage}`, errorStack);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  /**
   * Handle successful payment
   */
  public async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    this.logger.log('Verifying webhook signature (stubbed)');
    // Implement actual signature verification logic here with TelegramPayService
    // For now, returning true for testing purposes
    return this.telegramPayService.verifyWebhookSignature(signature, payload); 
  }

  public async processWebhookEvent(event: WebhookEventDto): Promise<void> {
    this.logger.log(`Processing webhook event (stubbed): ${event.type}`);
    // Implement actual event processing logic here
    // For now, just logging
    if (event.type === 'payment_paid') {
      await this.handlePaymentPaid(event);
    } else if (event.type === 'payment_failed') {
      await this.handlePaymentFailed(event);
    } else if (event.type === 'payment_refunded') {
      await this.handlePaymentRefunded(event);
    } else {
      this.logger.warn(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handlePaymentPaid(event: WebhookEventDto): Promise<void> {
    const { paymentId, metadata } = event;
    
    try {
      // Find the payment in our database with subscription
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: { subscription: true },
      }); 

      if (!payment) {
        this.logger.warn(`Payment not found: ${paymentId}`);
        return;
      }

      // Skip if already processed
      if (payment.status === PaymentStatus.PAID) {
        this.logger.log(`Payment already processed: ${paymentId}`);
        return;
      }

      // Update payment status
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.PAID,
            externalId: paymentId,
            metadata: metadata ? JSON.stringify(metadata) : null,
            updatedAt: new Date(),
          },
        });

        // If this payment is for a subscription, update the subscription
        if (payment.subscription) {
          const now = new Date();
          const periodEnd = new Date();
          periodEnd.setDate(now.getDate() + 30); 

          // Update the subscription status
          let subscriptionId: number | undefined;
          
          if (Array.isArray(payment.subscription) && payment.subscription.length > 0) {
            subscriptionId = payment.subscription[0]?.id;
          } else if (payment.subscription && typeof payment.subscription === 'object' && 'id' in payment.subscription) {
            subscriptionId = (payment.subscription as { id: number }).id;
          }
          
          if (!subscriptionId) {
            throw new Error('Subscription ID not found in payment data');
          }
          
          await tx.subscription.update({
            where: { id: subscriptionId },
            data: {
              status: SubscriptionStatus.PAID,
              periodStart: now,
              periodEnd,
              paymentId: payment.id,
              updatedAt: new Date(),
            },
          });
        }
      });

      this.logger.log(`Payment processed successfully: ${paymentId}`);
    } catch (error) {
      this.logger.error(`Error processing payment ${paymentId}:`, error);
      throw new InternalServerErrorException('Failed to process payment');
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(event: WebhookEventDto): Promise<void> {
    const { paymentId } = event;
    
    try {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { 
          status: PaymentStatus.FAILED,
          updatedAt: new Date() 
        },
      });
      this.logger.log(`Payment marked as failed: ${paymentId}`);
    } catch (error) {
      this.logger.error(`Failed to update payment status to failed for ${paymentId}:`, error);
      throw new InternalServerErrorException('Failed to update payment status');
    }

    // Update associated subscription if exists
    await this.prisma.subscription.updateMany({
      where: { paymentId },
      data: { status: SubscriptionStatus.CANCELLED },
    });

    this.logger.log(`Payment failed: ${paymentId}`);
  }

  /**
   * Handle payment refund
   */
  private async handlePaymentRefunded(event: WebhookEventDto): Promise<void> {
    const { paymentId } = event;
    
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.REFUNDED },
    });

    // Update associated subscription if exists
    await this.prisma.subscription.updateMany({
      where: { paymentId },
      data: { status: SubscriptionStatus.CANCELLED },
    });

    this.logger.log(`Payment refunded: ${paymentId}`);
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponseDto> {
    try {
      // First check our database
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          subscription: {
            select: {
              id: true,
              plan: true,
              userId: true,
              botId: true,
              status: true,
              amount: true,
              periodStart: true,
              periodEnd: true,
              createdAt: true,
              updatedAt: true,
            }
          }
        },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Get the subscription ID from the payment record
      let subscriptionId: number | undefined;
      
      if (Array.isArray(payment.subscription) && payment.subscription.length > 0) {
        subscriptionId = payment.subscription[0].id;
      } else if (payment.subscription && typeof payment.subscription === 'object' && 'id' in payment.subscription) {
        subscriptionId = (payment.subscription as { id: number }).id;
      }
      
      if (!subscriptionId) {
        throw new NotFoundException('Subscription ID not found for this payment');
      }

      // If payment is already in a final state, return it
      const finalStatuses = [
        'PAID',
        'FAILED',
        'REFUNDED',
        'EXPIRED',
      ] as const;
      
      if (finalStatuses.includes(payment.status as any)) {
        return payment as unknown as PaymentResponseDto;
      }

      // Otherwise, check with payment provider
      const status = await this.telegramPayService.getPaymentStatus(paymentId);
      
      // Update our database with the latest status
      const updatedPayment: PrismaPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: status as any },
        include: {
          subscription: {
            select: {
              id: true,
              plan: true,
              userId: true,
              botId: true,
              status: true,
              amount: true,
              periodStart: true,
              periodEnd: true,
              createdAt: true,
              updatedAt: true,
            }
          }
        }
      });

      // Ensure createdPayment, which is Payment, is compatible with PaymentWithSubscription
      // It will be if its subscription property is handled correctly or is null.
      // If createdPayment doesn't have a subscription relation loaded, it might need casting
      // or the DTO mapping needs to handle potentially missing subscription.
      // For now, assuming it's compatible or subscription is null initially.
      return this.mapPaymentToResponseDto(updatedPayment as PaymentWithSubscription);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to get payment status';
      
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string, userId: number): Promise<PaymentResponseDto | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId, userId },
      include: { subscription: true }, 
    });

    if (!payment) {
      return null;
    }
    // Ensure subscription is loaded if needed for mapPaymentToResponseDto
    // The type cast (payment as PaymentWithSubscription) implies subscription should be present.
    return this.mapPaymentToResponseDto(payment); // payment is already PaymentWithSubscription | null
  }

  // Helper method to map Prisma Payment to PaymentResponseDto
  // Helper method to map a Payment object (which includes subscription and augmented paymentUrl)
// to a PaymentResponseDto.
  private mapPaymentToResponseDto(payment: PaymentWithSubscription): PaymentResponseDto {
    if (!payment) {
      throw new NotFoundException('Payment data is null or undefined in mapPaymentToResponseDto');
    }
    return {
      id: payment.id,
      userId: payment.userId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      description: payment.description ?? undefined,
      externalId: payment.externalId ?? undefined,
      orderId: payment.orderId ?? undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      paymentUrl: (payment as any).paymentUrl ?? undefined,
      metadata: payment.metadata ? JSON.parse(payment.metadata) : undefined,
      subscriptionId: payment.subscription && payment.subscription.length > 0 ? payment.subscription[0].id : undefined,
    };
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(userId: number): Promise<PaymentResponseDto[]> {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return payments as unknown as PaymentResponseDto[];
  }
}
