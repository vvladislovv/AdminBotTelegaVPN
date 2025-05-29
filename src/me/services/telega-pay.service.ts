import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { SubscriptionPlan } from '../dto/subscribe-billing.dto';

interface CreateInvoiceResponse {
    paymentLink: string;
    invoiceId: string;
    amount: number;
}

@Injectable()
export class TelegaPayService {
    private readonly logger = new Logger(TelegaPayService.name);
    private readonly apiToken: string;
    private readonly apiUrl: string;
    private readonly prices: Record<SubscriptionPlan, number> = {
        [SubscriptionPlan.FREE]: 0,
        [SubscriptionPlan.PREMIUM]: 299,
        [SubscriptionPlan.ENTERPRISE]: 999,
    };

    constructor(private readonly configService: ConfigService) {
        const apiUrl = this.configService.get<string>('TELEGAPAY_API_URL');
        const apiToken = this.configService.get<string>('TELEGAPAY_API_TOKEN');
        const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

        if (!isDevelopment && (!apiUrl || !apiToken)) {
            throw new Error(
                'TELEGAPAY_API_URL and TELEGAPAY_API_TOKEN must be defined in production',
            );
        }

        this.apiUrl = apiUrl || 'https://test-api.telegapay.com';
        this.apiToken = apiToken || 'test-token';
    }

    async createInvoice(
        userId: number,
        botId: number,
        plan: string,
    ): Promise<CreateInvoiceResponse> {
        try {
            // В режиме разработки возвращаем тестовые данные
            if (this.configService.get<string>('NODE_ENV') === 'development') {
                return {
                    paymentLink: 'https://test-payment-link.com',
                    invoiceId: `test-invoice-${Date.now()}`,
                    amount: this.prices[plan as SubscriptionPlan] || 0,
                };
            }

            const response = await axios.post(
                `${this.apiUrl}/invoices`,
                {
                    userId,
                    botId,
                    plan,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.apiToken}`,
                    },
                },
            );

            return {
                paymentLink: response.data.paymentLink,
                invoiceId: response.data.invoiceId,
                amount: response.data.amount,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(`Failed to create invoice: ${error.message}`);
            } else {
                this.logger.error('Failed to create invoice: Unknown error');
            }
            throw error;
        }
    }

    async checkInvoiceStatus(invoiceId: string) {
        try {
            // В режиме разработки возвращаем тестовый статус
            if (this.configService.get<string>('NODE_ENV') === 'development') {
                return {
                    status: 'PAID',
                };
            }

            const response = await axios.get(`${this.apiUrl}/invoices/${invoiceId}`, {
                headers: {
                    Authorization: `Bearer ${this.apiToken}`,
                },
            });

            return {
                status: response.data.status,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(`Failed to check invoice status: ${error.message}`);
            } else {
                this.logger.error('Failed to check invoice status: Unknown error');
            }
            throw error;
        }
    }

    getPlanPrice(plan: SubscriptionPlan): number {
        return this.prices[plan];
    }
}
