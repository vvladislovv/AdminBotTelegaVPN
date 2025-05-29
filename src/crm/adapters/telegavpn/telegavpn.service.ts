import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { ITelegaVpnService } from './interfaces/telegavpn-service.interface';

@Injectable()
export class TelegaVpnService implements ITelegaVpnService {
    private readonly logger = new Logger(TelegaVpnService.name);
    private readonly apiUrl: string;
    private readonly isDevelopment: boolean;
    private client: AxiosInstance;

    constructor(private readonly configService: ConfigService) {
        this.isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

        if (!this.isDevelopment) {
            const apiUrl = this.configService.get<string>('TELEGAVPN_API_URL');
            if (!apiUrl) {
                throw new Error('TELEGAVPN_API_URL must be defined in production');
            }
            this.apiUrl = apiUrl;
        } else {
            // Тестовые значения для разработки
            this.apiUrl = 'https://test-api.telegavpn.com';
        }

        this.client = axios.create({
            baseURL: this.apiUrl,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.configService.get<string>('TELEGAVPN_API_TOKEN')}`,
            },
        });
    }

    // Методы для работы с пользователями
    async createUser(userData: any): Promise<string> {
        try {
            const response = await this.client.post('/users', userData);
            return response.data.id;
        } catch (error: any) {
            this.logger.error(`Failed to create user in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getUserInfo(userId: string): Promise<any> {
        try {
            const response = await this.client.get(`/users/${userId}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get user info from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async updateUser(userId: string, updateData: any): Promise<void> {
        try {
            await this.client.patch(`/users/${userId}`, updateData);
        } catch (error: any) {
            this.logger.error(`Failed to update user in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    // Методы для работы с подписками
    async createSubscription(userId: string, planId: string): Promise<string> {
        try {
            const response = await this.client.post('/subscriptions', {
                userId,
                planId,
            });
            return response.data.id;
        } catch (error: any) {
            this.logger.error(`Failed to create subscription in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getSubscriptionInfo(subscriptionId: string): Promise<any> {
        try {
            const response = await this.client.get(`/subscriptions/${subscriptionId}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get subscription info from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async updateSubscription(subscriptionId: string, updateData: any): Promise<void> {
        try {
            await this.client.patch(`/subscriptions/${subscriptionId}`, updateData);
        } catch (error: any) {
            this.logger.error(`Failed to update subscription in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    // Методы для работы с платежами
    async createPayment(userId: string, amount: number, currency: string): Promise<string> {
        try {
            const response = await this.client.post('/payments', {
                userId,
                amount,
                currency,
            });
            return response.data.id;
        } catch (error: any) {
            this.logger.error(`Failed to create payment in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getPaymentInfo(paymentId: string): Promise<any> {
        try {
            const response = await this.client.get(`/payments/${paymentId}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get payment info from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    // Методы для работы с серверами
    async getServers(): Promise<any[]> {
        try {
            const response = await this.client.get('/servers');
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get servers from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getServerInfo(serverId: string): Promise<any> {
        try {
            const response = await this.client.get(`/servers/${serverId}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get server info from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    // Методы для работы с конфигурациями
    async generateConfig(userId: string, serverId: string): Promise<string> {
        try {
            if (this.isDevelopment) {
                this.logger.debug('Development mode: Mocking config generation', {
                    serverId,
                    userId,
                });
                return `test-config-${Date.now()}`;
            }

            const response = await this.client.post('/configs', {
                userId,
                serverId,
            });
            return response.data.config;
        } catch (error: any) {
            this.logger.error(`Failed to generate config in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getConfigInfo(configId: string): Promise<any> {
        try {
            const response = await this.client.get(`/configs/${configId}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get config info from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async createServer(data: any) {
        try {
            if (this.isDevelopment) {
                this.logger.debug('Development mode: Mocking server creation', data);
                return {
                    id: `test-server-${Date.now()}`,
                    ...data,
                    status: 'active',
                };
            }

            const response = await this.client.post('/servers', data);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(`Failed to create server: ${error.message}`);
            } else {
                this.logger.error('Failed to create server: Unknown error');
            }
            throw error;
        }
    }

    async getServerStatus(serverId: string) {
        try {
            if (this.isDevelopment) {
                this.logger.debug('Development mode: Mocking server status check', { serverId });
                return {
                    status: 'active',
                    uptime: '99.9%',
                    load: '25%',
                };
            }

            const response = await this.client.get(`/servers/${serverId}/status`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(`Failed to get server status: ${error.message}`);
            } else {
                this.logger.error('Failed to get server status: Unknown error');
            }
            throw error;
        }
    }

    async revokeConfig(configId: string) {
        try {
            if (this.isDevelopment) {
                this.logger.debug('Development mode: Mocking config revocation', { configId });
                return {
                    success: true,
                    configId,
                };
            }

            const response = await this.client.delete(`/configs/${configId}`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(`Failed to revoke config: ${error.message}`);
            } else {
                this.logger.error('Failed to revoke config: Unknown error');
            }
            throw error;
        }
    }
}
