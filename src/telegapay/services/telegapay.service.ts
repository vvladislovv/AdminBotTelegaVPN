import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaymentMethod, PaymentStatus, Prisma, TelegapayTransactionType } from '@prisma/client'
import { AxiosError, AxiosRequestConfig } from 'axios'
import { firstValueFrom } from 'rxjs'
import { PrismaService } from '../../prisma/prisma.service'

import { CheckStatusDto, ConfirmPaymentDto, CreatePaylinkDto, CreatePayoutDto, GetMethodsDto, GetRequisitesDto, CancelPaymentDto, CancelPayoutDto, SendReceiptDto, TelegapayWebhookDto } from '../dto';

@Injectable()
export class TelegapayService {
  private readonly logger = new Logger(TelegapayService.name);
  private readonly telegapayApiKey: string;
  private readonly telegapayBaseUrl: string;
  

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {
    this.telegapayApiKey = this.configService.get<string>('TELEGA_PAY_API_KEY')!;
    this.telegapayBaseUrl = this.configService.get<string>('TELEGA_PAY_BASE_URL')!;

    if (!this.telegapayApiKey || !this.telegapayBaseUrl) {
      this.logger.error('TELEGA_PAY_API_KEY or TELEGA_PAY_BASE_URL is not configured.');
      throw new InternalServerErrorException('Telegapay service is not configured.');
    }
  }

  private async _request<T>(
    endpoint: string,
    data: Record<string, any>,
    method: 'POST' | 'GET' = 'POST'
  ): Promise<T> {
    const url = `${this.telegapayBaseUrl}${endpoint}`;
    
    const headers = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': this.telegapayApiKey,
    };

    const config: AxiosRequestConfig = {
      method,
      url,
      headers,
      data: method === 'POST' ? data : undefined,
      params: method === 'GET' ? data : undefined,
      validateStatus: () => true,
    };

    this.logger.debug(`Requesting Telegapay API: ${method} ${url} with data: ${JSON.stringify(data)}`);

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      
      if (response.status >= 200 && response.status < 300) {
        this.logger.log(`✅ Telegapay API Success for ${url}: ${JSON.stringify(response.data)}`);
        return response.data as T;
      } else {
        this.logger.debug(`❌ Telegapay API Error for ${url}: ${JSON.stringify(response.data)}`);
        this.logger.debug(`Full response status: ${response.status} ${response.statusText}`);
        this.logger.debug(`Response headers: ${JSON.stringify(response.headers)}`);
        
        // Handle specific HTTP status codes
        const errorMessage = response.data?.error || response.data?.details || response.statusText;
        
        if (response.status === 400) {
          this.logger.error(`Telegapay API returned status 400: BAD REQUEST`);
          this.logger.error(`Error calling Telegapay API ${url}: ${errorMessage}`);
          throw new BadRequestException(errorMessage);
        } else if (response.status === 404) {
          this.logger.error(`Telegapay API returned status 404: NOT FOUND`);
          this.logger.error(`Error calling Telegapay API ${url}: ${errorMessage}`);
          throw new NotFoundException(errorMessage);
        } else {
          this.logger.error(`Telegapay API returned status ${response.status}: ${response.statusText}`);
          this.logger.error(`Error calling Telegapay API ${url}: ${errorMessage}`);
          throw new InternalServerErrorException(errorMessage);
        }
      }
      
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      const axiosError = error as AxiosError;
      this.logger.error(`Error calling Telegapay API ${url}: ${axiosError.message}`, axiosError.stack);
      
      if (axiosError.response) {
        const errorData = axiosError.response.data as any;
        this.logger.error(`Telegapay API Error Response Data: ${JSON.stringify(errorData)}`);
        throw new InternalServerErrorException(
          `Telegapay API request failed: ${axiosError.message}`
        );
      }
      
      throw new InternalServerErrorException('Failed to connect to Telegapay API');
    }
  }

  async getPaymentMethods(dto: GetMethodsDto): Promise<any> {
    this.logger.log(`Getting payment methods for amount: ${dto.amount} ${dto.currency}`);
    try {
      const response = await this._request<any>('/get_methods', dto, 'POST');
      return {
        message: 'Payment methods retrieved successfully',
        data: response,
      };
    } catch (error) {
      throw error;
    }
  }

  async getRequisites(dto: GetRequisitesDto): Promise<any> {
    this.logger.log(`Getting requisites for method_id: ${dto.method}`);
    try {
      const response = await this._request<any>('/get_requisites', dto);
      return {
        message: 'Requisites retrieved successfully',
        data: response,
      };
    } catch (error) {
      throw error;
    }
  }

  async createPaylink(dto: CreatePaylinkDto): Promise<any> {
    this.logger.log(`Attempting to create paylink for user_id: ${dto.user_id}, amount: ${dto.amount} ${dto.currency}, payment_method: ${dto.payment_method}`);
  
    // Validate user_id
    if (!dto.user_id) {
      throw new BadRequestException('user_id is required to create a payment.');
    }
    const userId = Number(dto.user_id);
    if (isNaN(userId)) {
      throw new BadRequestException('user_id must be a valid number.');
    }

    // Validate payment method availability before creating payment record
    try {
      this.logger.debug(`Checking available payment methods for amount: ${dto.amount} ${dto.currency}`);
      const methodsResponse = await this.getPaymentMethods({ 
        amount: dto.amount, 
        currency: dto.currency 
      });
      
      // Check if the requested payment method is available
      const availableMethods = methodsResponse.data?.methods || [];
      const isMethodAvailable = availableMethods.some((method: any) => 
        method.method === dto.payment_method || method.id === dto.payment_method
      );
      
      if (!isMethodAvailable) {
        this.logger.warn(`Payment method ${dto.payment_method} is not available for amount ${dto.amount} ${dto.currency}`);
        throw new BadRequestException(`Payment method ${dto.payment_method} is not available for the specified amount and currency. Available methods: ${availableMethods.map((m: any) => m.method || m.id).join(', ')}`);
      }
      
      // Check requisites for the payment method
      this.logger.debug(`Checking requisites for payment method: ${dto.payment_method}`);
      const requisitesResponse = await this.getRequisites({ 
        method: dto.payment_method,
        amount: dto.amount,
        currency: dto.currency,
        order_id: `check_${Date.now()}`,
        user_id: dto.user_id
      });
      
      if (!requisitesResponse.data?.requisites || requisitesResponse.data.requisites.length === 0) {
        this.logger.warn(`No requisites available for payment method ${dto.payment_method}`);
        throw new BadRequestException(`No requisites available for payment method ${dto.payment_method}. Please try a different payment method.`);
      }
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.warn(`Could not validate payment method availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Continue with payment creation even if validation fails
    }

    // Generate orderId for database
    const orderId = 'paylink_' + Date.now();
  
    let paymentRecord;
    try {
      const paymentCreateData: Prisma.PaymentUncheckedCreateInput = {
        amount: dto.amount,
        currency: dto.currency,
        status: PaymentStatus.PENDING,
        method: 'TELEGRAM_PAY',
        orderId: orderId,
        description: dto.description,
        telegapayTransactionType: TelegapayTransactionType.PAYIN,
        userId: userId,
        metadata: JSON.stringify({
          payment_method: dto.payment_method,
          return_url: dto.return_url
        }),
      };
      
      paymentRecord = await this.prismaService.payment.create({
        data: paymentCreateData,
      });
      this.logger.log(`Initial payment record created with id: ${paymentRecord.id} for user_id: ${dto.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to create initial payment record for user_id: ${dto.user_id}: ${error}`);
      throw new InternalServerErrorException('Failed to initialize payment.');
    }
  
    try {
      // Call Telegapay API
      const response = await this._request<any>('/create_paylink', dto, 'POST');
      
      // Update payment record with success
      await this.prismaService.payment.update({
        where: { id: paymentRecord.id },
        data: {
          externalId: response.data?.transaction_id?.toString() || undefined,
          telegapayStatus: response.data?.status || 'link_created',
          metadata: JSON.stringify({
            ...(JSON.parse(paymentRecord.metadata || '{}')),
            telegapayResponse: response.data
          }),
        },
      });
    
      this.logger.log(`Paylink created and payment record ${paymentRecord.id} updated for user_id: ${dto.user_id}. Link: ${response.data?.link}`);
      return {
        message: 'Paylink created successfully',
        payment_id: paymentRecord.id,
        telegapay_transaction_id: response.data?.transaction_id,
        paylink: response.data?.link,
        telegapay_response: response.data,
      };
    } catch (error) {
      // Update payment record with failure
      await this.prismaService.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: PaymentStatus.FAILED,
          telegapayStatus: error instanceof Error ? error.message : 'Telegapay link creation failed',
        },
      });
      
      // Re-throw the error to be handled by the exception filter
      throw error;
    }
  }

  async checkPaymentStatus(dto: CheckStatusDto): Promise<any> {
    this.logger.log(`Checking status for transaction_id: ${dto.transaction_id}`);
    
    try {
      const response = await this._request<any>('/check_status', dto, 'POST');
      
      // Update local payment record if found
      const paymentRecord = await this.prismaService.payment.findFirst({
        where: { 
          externalId: dto.transaction_id,
          telegapayTransactionType: TelegapayTransactionType.PAYIN 
        },
      });

      if (paymentRecord && response.data) {
        // Map Telegapay status to our internal status
        let newStatus = paymentRecord.status;
        const telegapayStatus = response.data.status?.toLowerCase();
        
        if (['completed', 'paid', 'success'].includes(telegapayStatus)) {
          newStatus = PaymentStatus.PAID;
        } else if (['failed', 'rejected', 'error', 'cancelled'].includes(telegapayStatus)) {
          newStatus = PaymentStatus.FAILED;
        } else if (['pending', 'processing', 'hold'].includes(telegapayStatus)) {
          newStatus = PaymentStatus.PENDING;
        }

        await this.prismaService.payment.update({
          where: { id: paymentRecord.id },
          data: {
            status: newStatus,
            telegapayStatus: response.data.status,
            metadata: JSON.stringify({
              ...(JSON.parse(paymentRecord.metadata || '{}')),
              lastStatusCheck: new Date().toISOString(),
              telegapayStatusResponse: response.data
            }),
          },
        });
      }

      return {
        message: 'Payment status retrieved successfully',
        transaction_id: dto.transaction_id,
        telegapay_response: response.data || response,
      };
    } catch (error) {
      throw error;
    }
  }

  async confirmPayment(dto: ConfirmPaymentDto): Promise<any> {
    this.logger.log(`Confirming payment for Telegapay transaction_id: ${dto.transaction_id}`);

    const paymentRecord = await this.prismaService.payment.findFirst({
      where: { externalId: dto.transaction_id, telegapayTransactionType: TelegapayTransactionType.PAYIN },
    });

    if (!paymentRecord) {
      this.logger.warn(`PAYIN Payment with externalId ${dto.transaction_id} not found.`);
      throw new NotFoundException(`PAYIN Payment with externalId ${dto.transaction_id} not found.`);
    }

    const telegapayPayload = { transaction_id: dto.transaction_id };

    try {
      const response = await this._request<any>('/confirm_payment', telegapayPayload);

      const telegapayData = response.data;

      // Update payment record metadata or status if needed
      const updatedPaymentRecord = await this.prismaService.payment.update({
        where: { id: paymentRecord.id },
        data: {
          metadata: JSON.stringify({
            ...(JSON.parse(paymentRecord.metadata || '{}')),
            telegapayConfirmations: [
              ...(JSON.parse(paymentRecord.metadata || '{}').telegapayConfirmations || []),
              { confirmedAt: new Date().toISOString(), request: dto, responseData: telegapayData || {} },
            ],
          }),
        },
      });

      this.logger.log(
        `Payment confirmed for Telegapay transaction_id ${dto.transaction_id}. Payment ID: ${paymentRecord.id}`,
      );

      return {
        message: 'Payment confirmed successfully with Telegapay',
        payment_id: updatedPaymentRecord.id,
        telegapay_transaction_id: dto.transaction_id,
        telegapay_response: telegapayData || { success: true },
      };
    } catch (error) {
      this.logger.error(
        `Error during Telegapay payment confirmation for transaction_id: ${dto.transaction_id}: ${error}`,
      );
      throw error;
    }
  }

  async createPayout(dto: CreatePayoutDto): Promise<any> {
    this.logger.log(`Creating payout for external_id: ${dto.external_id}`);

    if (!dto.userId) {
        this.logger.warn(`Creating payout without a specific userId for external_id: ${dto.external_id}`);
    }

    let paymentRecord;
    try {
      paymentRecord = await this.prismaService.payment.create({
        data: {
          userId: dto.userId || 0,
          amount: dto.amount,
          currency: dto.currency,
          status: PaymentStatus.PENDING,
          method: PaymentMethod.OTHER,
          telegapayTransactionType: TelegapayTransactionType.PAYOUT,
          orderId: dto.external_id,
          description: `Payout for order_id: ${dto.external_id}`,
          metadata: JSON.stringify({
            requisite_type: dto.requisite_type,
            requisite_value: dto.requisite_value,
            holder_name: dto.holder_name,
            bank_name: dto.bank_name,
            payout_request: dto,
          }),
        },
      });
    } catch (dbError: any) {
      this.logger.error(`DB error creating initial payout record for external_id: ${dto.external_id}: ${dbError.message}`);
      throw new InternalServerErrorException('Failed to create initial payout record.');
    }

    const telegapayPayload = {
      amount: dto.amount,
      currency: dto.currency,
      requisite_type: dto.requisite_type,
      requisite_value: dto.requisite_value,
      holder_name: dto.holder_name,
      bank_name: dto.bank_name,
      external_id: dto.external_id,
    };

    try {
      const response = await this._request<any>('/create_payout', telegapayPayload);

      const telegapayData = response.data;
      const telegapayTransactionId = telegapayData.transaction_id;
      const telegapayPayoutStatus = telegapayData.status;

      // Map Telegapay status to our PaymentStatus
      let newPaymentStatus: PaymentStatus = PaymentStatus.PENDING;
      if (telegapayPayoutStatus === 'completed' || telegapayPayoutStatus === 'paid') {
        newPaymentStatus = PaymentStatus.PAID;
      } else if (telegapayPayoutStatus === 'rejected' || telegapayPayoutStatus === 'failed' || telegapayPayoutStatus === 'error') {
        newPaymentStatus = PaymentStatus.FAILED;
      }

      const updatedPaymentRecord = await this.prismaService.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: newPaymentStatus,
          externalId: telegapayTransactionId,
          telegapayStatus: telegapayPayoutStatus,
          metadata: JSON.stringify({
            ...(JSON.parse(paymentRecord.metadata || '{}')),
            telegapay_response: telegapayData,
          }),
        },
      });

      this.logger.log(
        `Payout created successfully with Telegapay for external_id: ${dto.external_id}. Telegapay TX ID: ${telegapayTransactionId}`,
      );
      return {
        message: 'Payout created successfully',
        payment_id: updatedPaymentRecord.id,
        external_id: dto.external_id,
        telegapay_transaction_id: telegapayTransactionId,
        status: updatedPaymentRecord.status,
        telegapay_status: updatedPaymentRecord.telegapayStatus,
        telegapay_response: telegapayData,
      };
    } catch (error) {
      this.logger.error(`Error during Telegapay payout creation for external_id: ${dto.external_id}: ${error}`);
      if (paymentRecord && paymentRecord.status !== PaymentStatus.FAILED) {
        try {
            await this.prismaService.payment.update({
                where: { id: paymentRecord.id },
                data: { status: PaymentStatus.FAILED, telegapayStatus: error instanceof Error ? error.message : 'Payout processing error' },
            });
        } catch (updateError: any) {
            this.logger.error(`Failed to update payout record to FAILED for external_id: ${dto.external_id}: ${updateError.message}`);
        }
      }
      throw error;
    }
  }

  async handleWebhook(dto: TelegapayWebhookDto, headers: Record<string, string>): Promise<any> {
    this.logger.log(`Received Telegapay webhook for transaction_id: ${dto.transaction_id}, type: ${dto.type}, status: ${dto.status}`);
    this.logger.debug(`Webhook DTO: ${JSON.stringify(dto)}`);
    this.logger.debug(`Webhook Headers: ${JSON.stringify(headers)}`);

    this.logger.warn('Webhook signature verification is not implemented yet!');

    const transactionType = dto.type === 'payin' ? TelegapayTransactionType.PAYIN : TelegapayTransactionType.PAYOUT;

    const paymentRecord = await this.prismaService.payment.findFirst({
      where: {
        externalId: dto.transaction_id,
        telegapayTransactionType: transactionType,
      },
    });

    if (!paymentRecord) {
      this.logger.error(
        `Webhook: Payment record not found for Telegapay transaction_id: ${dto.transaction_id} and type: ${dto.type}`,
      );
      return { message: 'Payment record not found, but webhook acknowledged.' };
    }

    this.logger.log(`Found payment record ID: ${paymentRecord.id} for webhook processing.`);

    let newPaymentStatus: PaymentStatus = paymentRecord.status;
    const telegapayStatus = dto.status.toLowerCase();

    if (transactionType === TelegapayTransactionType.PAYIN) {
      if (['completed', 'paid', 'success'].includes(telegapayStatus)) {
        newPaymentStatus = PaymentStatus.PAID;
      } else if (['failed', 'rejected', 'error', 'cancelled'].includes(telegapayStatus)) {
        newPaymentStatus = PaymentStatus.FAILED;
      } else if (['pending', 'processing', 'hold'].includes(telegapayStatus)) {
        newPaymentStatus = PaymentStatus.PENDING;
      }
    } else if (transactionType === TelegapayTransactionType.PAYOUT) {
      if (['completed', 'paid', 'sent', 'success'].includes(telegapayStatus)) {
        newPaymentStatus = PaymentStatus.PAID;
      } else if (['failed', 'rejected', 'error', 'returned', 'cancelled'].includes(telegapayStatus)) {
        newPaymentStatus = PaymentStatus.FAILED;
      } else if (['pending', 'processing', 'created'].includes(telegapayStatus)) {
        newPaymentStatus = PaymentStatus.PENDING;
      }
    }

    try {
      const updatedPaymentRecord = await this.prismaService.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: newPaymentStatus,
          telegapayStatus: dto.status,
          metadata: JSON.stringify({
            ...(JSON.parse(paymentRecord.metadata || '{}')),
            webhook_payload: dto,
            last_webhook_at: new Date().toISOString(),
          }),
        },
      });

      this.logger.log(
        `Payment record ID: ${updatedPaymentRecord.id} updated via webhook. New status: ${updatedPaymentRecord.status}, Telegapay status: ${dto.status}`,
      );

      if (newPaymentStatus === PaymentStatus.PAID) {
        if (transactionType === TelegapayTransactionType.PAYIN) {
          this.logger.log(`PAYIN successful for payment ID: ${updatedPaymentRecord.id}. Triggering post-payment actions.`);
        } else if (transactionType === TelegapayTransactionType.PAYOUT) {
          this.logger.log(`PAYOUT successful for payment ID: ${updatedPaymentRecord.id}. Triggering post-payout actions.`);
        }
      }

      return { message: 'Webhook processed successfully' };
    } catch (error: any) {
      this.logger.error(
        `Error updating payment record ID: ${paymentRecord.id} via webhook: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to update payment record from webhook.');
    }
  }

  async cancelPayment(dto: CancelPaymentDto): Promise<any> {
    this.logger.log(`Cancelling payment for transaction_id: ${dto.transaction_id}`);

    const paymentRecord = await this.prismaService.payment.findFirst({
      where: { externalId: dto.transaction_id, telegapayTransactionType: TelegapayTransactionType.PAYIN },
    });

    if (!paymentRecord) {
      this.logger.warn(`PAYIN Payment with externalId ${dto.transaction_id} not found.`);
      throw new NotFoundException(`PAYIN Payment with externalId ${dto.transaction_id} not found.`);
    }

    try {
      const response = await this._request<any>('/cancel_payment', dto);

      const updatedPaymentRecord = await this.prismaService.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: PaymentStatus.FAILED,
          telegapayStatus: 'cancelled',
          metadata: JSON.stringify({
            ...(JSON.parse(paymentRecord.metadata || '{}')),
            cancellation: {
              cancelledAt: new Date().toISOString(),
              request: dto,
              responseData: response.data || {},
            },
          }),
        },
      });

      this.logger.log(
        `Payment cancelled for Telegapay transaction_id ${dto.transaction_id}. Payment ID: ${paymentRecord.id}`,
      );

      return {
        message: 'Payment cancelled successfully',
        payment_id: updatedPaymentRecord.id,
        telegapay_transaction_id: dto.transaction_id,
        status: updatedPaymentRecord.status,
        telegapay_response: response.data || { success: true },
      };
    } catch (error) {
      this.logger.error(
        `Error during Telegapay payment cancellation for transaction_id: ${dto.transaction_id}: ${error}`,
      );
      throw error;
    }
  }

  async cancelPayout(dto: CancelPayoutDto): Promise<any> {
    this.logger.log(`Cancelling payout for payout_id: ${dto.payout_id}`);

    const paymentRecord = await this.prismaService.payment.findFirst({
      where: { externalId: dto.payout_id, telegapayTransactionType: TelegapayTransactionType.PAYOUT },
    });

    if (!paymentRecord) {
      this.logger.warn(`PAYOUT Payment with externalId ${dto.payout_id} not found.`);
      throw new NotFoundException(`PAYOUT Payment with externalId ${dto.payout_id} not found.`);
    }

    try {
      const response = await this._request<any>('/cancel_payout', dto);

      const updatedPaymentRecord = await this.prismaService.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: PaymentStatus.FAILED,
          telegapayStatus: 'cancelled',
          metadata: JSON.stringify({
            ...(JSON.parse(paymentRecord.metadata || '{}')),
            cancellation: {
              cancelledAt: new Date().toISOString(),
              request: dto,
              responseData: response.data || {},
            },
          }),
        },
      });

      this.logger.log(
        `Payout cancelled for Telegapay payout_id ${dto.payout_id}. Payment ID: ${paymentRecord.id}`,
      );

      return {
        message: 'Payout cancelled successfully',
        payment_id: updatedPaymentRecord.id,
        telegapay_payout_id: dto.payout_id,
        status: updatedPaymentRecord.status,
        telegapay_response: response.data || { success: true },
      };
    } catch (error) {
      this.logger.error(
        `Error during Telegapay payout cancellation for payout_id: ${dto.payout_id}: ${error}`,
      );
      throw error;
    }
  }

  async sendReceipt(dto: SendReceiptDto): Promise<any> {
    this.logger.log(`Sending receipt for transaction_id: ${dto.transaction_id}`);

    const paymentRecord = await this.prismaService.payment.findFirst({
      where: { externalId: dto.transaction_id, telegapayTransactionType: TelegapayTransactionType.PAYIN },
    });

    if (!paymentRecord) {
      this.logger.warn(`PAYIN Payment with externalId ${dto.transaction_id} not found.`);
      throw new NotFoundException(`PAYIN Payment with externalId ${dto.transaction_id} not found.`);
    }

    try {
      const response = await this._request<any>('/send_receipt', dto);

      const updatedPaymentRecord = await this.prismaService.payment.update({
        where: { id: paymentRecord.id },
        data: {
          metadata: JSON.stringify({
            ...(JSON.parse(paymentRecord.metadata || '{}')),
            receipt: {
              sentAt: new Date().toISOString(),
              receipt_url: dto.receipt_url,
              request: dto,
              responseData: response.data || {},
            },
          }),
        },
      });

      this.logger.log(
        `Receipt sent for Telegapay transaction_id ${dto.transaction_id}. Payment ID: ${paymentRecord.id}`,
      );

      return {
        message: 'Receipt sent successfully',
        payment_id: updatedPaymentRecord.id,
        telegapay_transaction_id: dto.transaction_id,
        filename: response.data?.filename,
        telegapay_response: response.data || { success: true },
      };
    } catch (error) {
      this.logger.error(
        `Error during Telegapay receipt sending for transaction_id: ${dto.transaction_id}: ${error}`,
      );
      throw error;
    }
  }
}