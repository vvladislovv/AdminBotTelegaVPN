import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { PaymentLinkResponseDto } from './dto/payment-link-response.dto';
import { WebhookEventDto, PaymentStatus } from './dto/webhook-event.dto';

@Injectable()
export class TelegramPayService {
  private readonly logger = new Logger(TelegramPayService.name);
  private readonly apiUrl = 'https://secure.telegapay.link/api/v1'; // HTTP, not HTTPS as per curl
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.getOrThrow('TELEGRAM_PAY_API_KEY');
  }

  /**
   * Create a payment link
   */
  async createPaymentLink(params: CreatePaymentLinkDto): Promise<PaymentLinkResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/create_paylink`, // Endpoint for creating payment link
          {
            amount: params.amount,
            currency: params.currency || 'RUB',
            payment_method: params.payment_method, // Используем payment_method из параметров
            description: params.description,
            return_url: params.return_url,         // Используем return_url из параметров
            user_id: params.userId,                // Используем userId из параметров
            // order_id не отправляем, если его нет в API /create_paylink
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log('Response from /create_paylink:', JSON.stringify(response.data, null, 2));

      // TODO: Адаптировать этот маппинг под РЕАЛЬНУЮ структуру ответа от /create_paylink
      // Ожидаем что-то вроде { success: true, transaction_id: "...", payment_url: "..." }
      return {
        paymentUrl: response.data.payment_url || response.data.link, // Общие имена для ссылки
        paymentId: response.data.transaction_id || response.data.id || response.data.invoice_id || 'unknown_transaction_id',
        status: response.data.status || (response.data.success ? 'PENDING' : 'ERROR'),
        amount: response.data.amount || params.amount,
        currency: response.data.currency || params.currency,
        description: response.data.description || params.description,
        orderId: params.orderId, // Возвращаем наш внутренний orderId, если он был в params (хотя CreatePaymentLinkDto его не имеет)
                                 // Лучше его не возвращать здесь, если он не пришел от API и не является частью CreatePaymentLinkDto
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : error && typeof error === 'object' && 'message' in error 
          ? String(error.message) 
          : 'Unknown error';
      
      const errorData = error && 
        typeof error === 'object' && 
        'response' in error && 
        error.response && 
        typeof error.response === 'object' && 
        'data' in error.response
          ? (error.response as { data: any }).data
          : null;
      
      this.logger.error('Error creating payment link', { error: errorMessage, data: errorData });
      throw new Error(`Failed to create payment link: ${errorMessage}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(signature: string, payload: any): boolean {
    // Implementation depends on Telegram Pay's webhook signature verification
    // This is a placeholder - you'll need to implement the actual verification
    // based on Telegram Pay's documentation
    return true;
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: WebhookEventDto): Promise<void> {
    try {
      switch (event.type) {
        case 'payment.paid':
          await this.handlePaymentPaid(event);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(event);
          break;
        case 'payment.refunded':
          await this.handlePaymentRefunded(event);
          break;
        default:
          this.logger.warn(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing webhook event: ${errorMessage}`, { error });
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentPaid(event: WebhookEventDto): Promise<void> {
    this.logger.log(`Payment ${event.paymentId} for order ${event.orderId} was successful`);
    
    // TODO: Implement your business logic here
    // - Update order status in your database
    // - Grant access to the service
    // - Send confirmation email/notification
    
    // Example:
    // await this.ordersService.markAsPaid(event.orderId, event.paymentId);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(event: WebhookEventDto): Promise<void> {
    this.logger.warn(`Payment ${event.paymentId} for order ${event.orderId} failed`);
    
    // TODO: Implement your business logic here
    // - Update order status to failed
    // - Notify user/admin about the failure
  }

  /**
   * Handle payment refund
   */
  private async handlePaymentRefunded(event: WebhookEventDto): Promise<void> {
    this.logger.log(`Payment ${event.paymentId} for order ${event.orderId} was refunded`);
    
    // TODO: Implement your business logic here
    // - Revoke access to the service
    // - Update order status to refunded
    // - Notify user/admin about the refund
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.apiUrl}/payments/${paymentId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
            },
          },
        ),
      );

      return response.data.status;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get payment status';
      this.logger.error(`Error getting payment status: ${errorMessage}`, { error });
      throw new Error(`Failed to get payment status: ${errorMessage}`);
    }
  }
}
