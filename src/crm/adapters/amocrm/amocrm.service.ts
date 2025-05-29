import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { ICrmService } from '../../interfaces/crm-service.interface';

@Injectable()
export class AmocrmService implements ICrmService {
    private readonly logger = new Logger(AmocrmService.name);
    private readonly baseUrl: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly isDevelopment: boolean;

    constructor(private readonly configService: ConfigService) {
        this.isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

        if (!this.isDevelopment) {
            const baseUrl = this.configService.get<string>('AMOCRM_BASE_URL');
            const clientId = this.configService.get<string>('AMOCRM_CLIENT_ID');
            const clientSecret = this.configService.get<string>('AMOCRM_CLIENT_SECRET');
            const redirectUri = this.configService.get<string>('AMOCRM_REDIRECT_URI');

            if (!baseUrl || !clientId || !clientSecret || !redirectUri) {
                throw new Error('Missing required AmoCRM configuration in production');
            }

            this.baseUrl = baseUrl;
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            this.redirectUri = redirectUri;
        } else {
            // Тестовые значения для разработки
            this.baseUrl = 'https://test.amocrm.ru';
            this.clientId = 'test-client-id';
            this.clientSecret = 'test-client-secret';
            this.redirectUri = 'http://localhost:3000/auth/amocrm/callback';
        }
    }

    private async makeRequest(method: string, endpoint: string, data?: any) {
        try {
            const response = await axios({
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    Authorization: `Bearer ${await this.getAccessToken()}`,
                    'Content-Type': 'application/json',
                },
                data,
            });
            return response.data;
        } catch (error) {
            await this.handleError(error);
            throw error;
        }
    }

    async handleError(error: unknown): Promise<void> {
        if (error instanceof Error) {
            this.logger.error(`AmoCRM API error: ${error.message}`, error.stack);
        } else {
            this.logger.error('Unknown AmoCRM API error:', error);
        }
    }

    async createContact(data: CreateUserDto): Promise<any> {
        const contactData = {
            name: data.name,
            custom_fields_values: [
                {
                    field_id: 123456, // ID поля email в AmoCRM
                    values: [{ value: data.email }],
                },
                {
                    field_id: 123457, // ID поля телефона в AmoCRM
                    values: [{ value: data.phone }],
                },
                {
                    field_id: 123458, // ID поля Telegram ID в AmoCRM
                    values: [{ value: data.telegramId }],
                },
                {
                    field_id: 123459, // ID поля Telegram Username в AmoCRM
                    values: [{ value: data.telegramUsername }],
                },
            ],
        };

        return this.makeRequest('POST', '/api/v4/contacts', [contactData]);
    }

    async getContactInfo(id: string): Promise<any> {
        return this.makeRequest('GET', `/api/v4/contacts/${id}`);
    }

    async updateContact(id: string, data: UpdateUserDto): Promise<any> {
        const contactData = {
            id,
            name: data.name,
            custom_fields_values: [
                {
                    field_id: 123456,
                    values: [{ value: data.email }],
                },
                {
                    field_id: 123457,
                    values: [{ value: data.phone }],
                },
                {
                    field_id: 123458,
                    values: [{ value: data.telegramId }],
                },
                {
                    field_id: 123459,
                    values: [{ value: data.telegramUsername }],
                },
            ],
        };

        return this.makeRequest('PATCH', `/api/v4/contacts/${id}`, contactData);
    }

    async deleteContact(id: string): Promise<void> {
        await this.makeRequest('DELETE', `/api/v4/contacts/${id}`);
    }

    async createSubscription(userId: string, planId: string): Promise<any> {
        const leadData = {
            name: `Subscription ${planId}`,
            price: 0,
            _embedded: {
                contacts: [{ id: userId }],
            },
            custom_fields_values: [
                {
                    field_id: 123460, // ID поля Plan ID в AmoCRM
                    values: [{ value: planId }],
                },
            ],
        };

        return this.makeRequest('POST', '/api/v4/leads', [leadData]);
    }

    async getSubscriptionInfo(id: string): Promise<any> {
        return this.makeRequest('GET', `/api/v4/leads/${id}`);
    }

    async updateSubscription(id: string, data: any): Promise<any> {
        const leadData = {
            id,
            custom_fields_values: [
                {
                    field_id: 123461, // ID поля статуса подписки в AmoCRM
                    values: [{ value: data.status }],
                },
            ],
        };

        return this.makeRequest('PATCH', `/api/v4/leads/${id}`, leadData);
    }

    async cancelSubscription(id: string): Promise<any> {
        const leadData = {
            id,
            status_id: 143, // ID статуса "Отменена" в AmoCRM
        };

        return this.makeRequest('PATCH', `/api/v4/leads/${id}`, leadData);
    }

    async createPayment(userId: string, amount: number, currency: string): Promise<any> {
        const paymentData = {
            name: `Payment ${amount} ${currency}`,
            price: amount,
            _embedded: {
                contacts: [{ id: userId }],
            },
            custom_fields_values: [
                {
                    field_id: 123462, // ID поля валюты в AmoCRM
                    values: [{ value: currency }],
                },
            ],
        };

        return this.makeRequest('POST', '/api/v4/leads', [paymentData]);
    }

    async getPaymentInfo(id: string): Promise<any> {
        return this.makeRequest('GET', `/api/v4/leads/${id}`);
    }

    async refundPayment(id: string, amount?: number): Promise<any> {
        const refundData = {
            id,
            status_id: 144, // ID статуса "Возврат" в AmoCRM
            price: amount,
        };

        return this.makeRequest('PATCH', `/api/v4/leads/${id}`, refundData);
    }

    async getServers(): Promise<any[]> {
        return this.makeRequest('GET', '/api/v4/catalogs/123463/elements'); // ID каталога серверов в AmoCRM
    }

    async getServerInfo(id: string): Promise<any> {
        return this.makeRequest('GET', `/api/v4/catalogs/123463/elements/${id}`);
    }

    async updateServerStatus(id: string, status: string): Promise<any> {
        const serverData = {
            id,
            custom_fields_values: [
                {
                    field_id: 123464, // ID поля статуса сервера в AmoCRM
                    values: [{ value: status }],
                },
            ],
        };

        return this.makeRequest('PATCH', `/api/v4/catalogs/123463/elements/${id}`, serverData);
    }

    async generateConfig(userId: string, serverId: string): Promise<any> {
        const configData = {
            name: `Config for user ${userId}`,
            _embedded: {
                contacts: [{ id: userId }],
            },
            custom_fields_values: [
                {
                    field_id: 123465, // ID поля Server ID в AmoCRM
                    values: [{ value: serverId }],
                },
            ],
        };

        return this.makeRequest('POST', '/api/v4/leads', [configData]);
    }

    async getConfigInfo(id: string): Promise<any> {
        return this.makeRequest('GET', `/api/v4/leads/${id}`);
    }

    async revokeConfig(id: string): Promise<any> {
        const configData = {
            id,
            status_id: 145, // ID статуса "Отозвана" в AmoCRM
        };

        return this.makeRequest('PATCH', `/api/v4/leads/${id}`, configData);
    }

    private async getAccessToken(): Promise<string> {
        if (this.isDevelopment) {
            return 'test-access-token';
        }

        try {
            const response = await axios.post(`${this.baseUrl}/oauth2/access_token`, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials',
                redirect_uri: this.redirectUri,
            });

            return response.data.access_token;
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(`Failed to get AmoCRM access token: ${error.message}`);
            } else {
                this.logger.error('Failed to get AmoCRM access token: Unknown error');
            }
            throw error;
        }
    }
}
