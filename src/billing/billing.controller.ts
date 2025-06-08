import { Request as ExpressRequest } from 'express';
interface RequestWithUser extends ExpressRequest { user: { id: number } }

import {
    BadRequestException,
    UnauthorizedException,
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
    Req
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { SubscriptionPlanDto } from './dto/subscription-plan.dto';
import { ClientCreatePaymentLinkDto } from './dto/client-create-payment-link.dto';
import { PaymentLinkResponseDto } from './dto/payment-link-response.dto';
import { CreateSubscriptionDto } from './dto/subscription-request.dto';
import { WebhookEventDto } from './dto/webhook-event.dto';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 500, description: 'Internal Server Error' })
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiOkResponse({ 
    description: 'Returns available subscription plans',
    type: [SubscriptionPlanDto]
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to fetch subscription plans' })
  async getSubscriptionPlans(): Promise<SubscriptionPlanDto[]> {
    try {
      return await this.billingService.getSubscriptionPlans();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Failed to fetch subscription plans');
    }
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get user\'s active subscriptions' })
  @ApiOkResponse({ 
    description: 'Returns user\'s active subscriptions',
    type: [SubscriptionPlanDto]
  })
  async getUserSubscriptions(@Req() req: RequestWithUser) {
    if (!req.user) throw new UnauthorizedException();
    return this.billingService.getUserSubscriptions(req.user.id);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Create Telegram Pay invoice and return payment link' })
  @ApiBody({ type: ClientCreatePaymentLinkDto })
  @ApiOkResponse({ description: 'Payment link created', type: PaymentLinkResponseDto })
  async createPaymentLink(
    @Body() clientCreatePaymentLinkDto: ClientCreatePaymentLinkDto,
    @Req() req: RequestWithUser
  ) {
    if (!req.user) throw new UnauthorizedException();
    return this.billingService.createTelegramPayInvoice(req.user.id, clientCreatePaymentLinkDto);
  }

  @Post('webhook/telegram-pay')
  @ApiOperation({ summary: 'Telegram Pay webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async handleWebhook(
    @Body() webhookEvent: WebhookEventDto,
    @Req() req: ExpressRequest
  ) {
    try {
      const signature = req.headers['telegram-signature'] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(webhookEvent);
      if (!await this.billingService.verifyWebhookSignature(rawBody, signature)) {
        throw new BadRequestException('Invalid webhook signature');
      }

      // Process the webhook event
      await this.billingService.processWebhookEvent(webhookEvent);
      
      return { status: 'success' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process webhook');
    }
  }
}
