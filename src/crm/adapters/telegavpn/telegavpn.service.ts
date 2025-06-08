import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CrmConnection } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';
import { CreateUserDto } from './../../dto/create-user.dto';
import { UpdateUserDto } from './../../dto/update-user.dto';
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
    async createContact(data: CreateUserDto, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log('TelegaVpnService: createContact');
            const response = await this.client.post('/users', data);
            // Assuming the response contains the created contact object
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to create contact in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getContactInfo(id: string, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: getContactInfo for ID: ${id}`);
            const response = await this.client.get(`/users/${id}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get contact info from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async updateContact(id: string, data: UpdateUserDto, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: updateContact for ID: ${id}`);
            const response = await this.client.patch(`/users/${id}`, data);
            // Assuming the response contains the updated contact object
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to update contact in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async deleteContact(id: string, connection: CrmConnection): Promise<void> {
        try {
            this.logger.log(`TelegaVpnService: deleteContact for ID: ${id}`);
            await this.client.delete(`/users/${id}`);
        } catch (error: any) {
            this.logger.error(`Failed to delete contact in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    // Методы для работы с подписками
    async createSubscription(
        userId: string,
        planId: string,
        connection: CrmConnection,
    ): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: createSubscription for User ID: ${userId}`);
            const response = await this.client.post('/subscriptions', {
                userId,
                planId,
            });
            // Assuming the response contains the created subscription object
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to create subscription in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getSubscriptionInfo(id: string, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: getSubscriptionInfo for ID: ${id}`);
            const response = await this.client.get(`/subscriptions/${id}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get subscription info from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async updateSubscription(id: string, data: any, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: updateSubscription for ID: ${id}`);
            const response = await this.client.patch(`/subscriptions/${id}`, data);
            // Assuming the response contains the updated subscription object
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to update subscription in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async cancelSubscription(id: string, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: cancelSubscription for ID: ${id}`);
            const response = await this.client.patch(`/subscriptions/${id}/cancel`); // Assuming there is a cancel endpoint
            // Assuming the response contains the cancelled subscription object
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to cancel subscription in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    // Методы для работы с платежами
    async createPayment(
        userId: string,
        amount: number,
        currency: string,
        connection: CrmConnection,
    ): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: createPayment for User ID: ${userId}`);
            const response = await this.client.post('/payments', {
                userId,
                amount,
                currency,
            });
            // Assuming the response contains the created payment object
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to create payment in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getPaymentInfo(id: string, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: getPaymentInfo for ID: ${id}`);
            const response = await this.client.get(`/payments/${id}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get payment info from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async refundPayment(id: string, connection: CrmConnection, amount?: number): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: refundPayment for ID: ${id}`);
            const response = await this.client.post(`/payments/${id}/refund`, { amount }); // Assuming there is a refund endpoint
            // Assuming the response contains the refunded payment object
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to refund payment in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    // Методы для работы с серверами
    async getServers(connection: CrmConnection): Promise<any[]> {
        try {
            this.logger.log('TelegaVpnService: getServers');
            const response = await this.client.get('/servers');
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get servers from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getServerInfo(id: string, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: getServerInfo for ID: ${id}`);
            const response = await this.client.get(`/servers/${id}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get server info from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async updateServerStatus(id: string, status: string, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: updateServerStatus for ID: ${id}`);
            const response = await this.client.patch(`/servers/${id}/status`, { status }); // Assuming there is a status update endpoint
            // Assuming the response contains the updated server object
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to update server status in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    // Методы для работы с конфигурациями
    async generateConfig(
        userId: string,
        serverId: string,
        connection: CrmConnection,
    ): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: generateConfig for User ID: ${userId}`);
            const response = await this.client.post('/configs', {
                userId,
                serverId,
            });
            // Assuming the response contains the generated config object
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to generate config in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getConfigInfo(id: string, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: getConfigInfo for ID: ${id}`);
            const response = await this.client.get(`/configs/${id}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get config info from TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async revokeConfig(id: string, connection: CrmConnection): Promise<any> {
        try {
            this.logger.log(`TelegaVpnService: revokeConfig for ID: ${id}`);
            const response = await this.client.patch(`/configs/${id}/revoke`); // Assuming there is a revoke endpoint
            // Assuming the response contains the revoked config object
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to revoke config in TelegaVPN: ${error.message}`);
            throw error;
        }
    }

    async getAllUserDataFromCrm(userId: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`TelegaVpnService: getAllUserDataFromCrm for User ID: ${userId}`);
        let userData: any = {};

        try {
            // Assuming TelegaVPN API has an endpoint to get all user data by user ID
            // Or you might need to call multiple endpoints here to gather data
            const response = await this.client.get(`/users/${userId}/all-data`);
            userData = response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get all user data from TelegaVPN: ${error.message}`);
            // Depending on requirements, you might want to throw or return partial data
            throw error; // Throwing for now as per typical error handling
        }

        return userData;
    }

    // Removed methods not defined in ITelegaVpnService
    // createServer, getServerStatus
}
