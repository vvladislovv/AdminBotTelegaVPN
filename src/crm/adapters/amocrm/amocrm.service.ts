import { ICrmService } from '@/crm/interfaces/crm-service.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { CrmConnection } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AmocrmService implements ICrmService {
    private readonly logger = new Logger(AmocrmService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly prisma: PrismaService,
    ) {}

    private async makeRequest(
        connection: CrmConnection,
        endpoint: string,
        method: string = 'GET',
        data?: any,
    ) {
        try {
            const url = `${connection.domain}${endpoint}`;
            const headers = {
                Authorization: `Bearer ${connection.accessToken}`,
                'Content-Type': 'application/json',
            };

            const response = await firstValueFrom(
                this.httpService.request({
                    method,
                    url,
                    headers,
                    data,
                }),
            );

            return response.data;
        } catch (error: any) {
            this.logger.error(`AmoCRM API request failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getContactInfo(connection: CrmConnection, contactId: string) {
        return this.makeRequest(connection, `/api/v4/contacts/${contactId}`);
    }

    async getRelatedData(connection: CrmConnection, entityId: string, entityType: string) {
        return this.makeRequest(connection, `/api/v4/${entityType}/${entityId}`);
    }

    async createContact(connection: CrmConnection, data: any) {
        const amocrmResponse = await this.makeRequest(connection, '/api/v4/contacts', 'POST', data);

        // TODO: Map AmoCRM response to CrmUser fields and save to local database
        // Need to get botId here. Assuming data contains telegramId and other user info.
        if (amocrmResponse && amocrmResponse._embedded && amocrmResponse._embedded.contacts) {
            const amocrmContact = amocrmResponse._embedded.contacts[0];
            // Replace with actual botId and more accurate mapping
            const botId = 1; // <--- THIS NEEDS TO BE REPLACED WITH ACTUAL botId

            if (data.telegramId) {
                try {
                    const crmUser = await this.prisma.crmUser.upsert({
                        where: { telegramId: data.telegramId },
                        update: {
                            username: data.telegramUsername || data.name,
                            firstName: data.firstName || data.name,
                            lastName: data.lastName,
                            botId: botId, // Use the determined botId
                        },
                        create: {
                            telegramId: data.telegramId,
                            username: data.telegramUsername || data.name,
                            firstName: data.firstName || data.name,
                            lastName: data.lastName,
                            botId: botId, // Use the determined botId
                        },
                    });
                    this.logger.log(`CrmUser created/updated in local DB: ${crmUser.id}`);
                } catch (dbError: any) {
                    this.logger.error(
                        `Failed to save CrmUser to local DB: ${dbError.message}`,
                        dbError.stack,
                    );
                    // Do not rethrow, as AmoCRM contact creation was successful
                }
            }
        }

        return amocrmResponse;
    }

    async updateContact(connection: CrmConnection, contactId: string, data: any) {
        return this.makeRequest(connection, `/api/v4/contacts/${contactId}`, 'PATCH', data);
    }

    async createDeal(connection: CrmConnection, data: any) {
        return this.makeRequest(connection, '/api/v4/leads', 'POST', data);
    }

    async updateDeal(connection: CrmConnection, dealId: string, data: any) {
        return this.makeRequest(connection, `/api/v4/leads/${dealId}`, 'PATCH', data);
    }

    async createTask(connection: CrmConnection, data: any) {
        return this.makeRequest(connection, '/api/v4/tasks', 'POST', data);
    }

    async updateTask(connection: CrmConnection, taskId: string, data: any) {
        return this.makeRequest(connection, `/api/v4/tasks/${taskId}`, 'PATCH', data);
    }

    async createNote(connection: CrmConnection, data: any) {
        return this.makeRequest(connection, '/api/v4/notes', 'POST', data);
    }

    async updateNote(connection: CrmConnection, noteId: string, data: any) {
        return this.makeRequest(connection, `/api/v4/notes/${noteId}`, 'PATCH', data);
    }

    async createCompany(connection: CrmConnection, data: any) {
        return this.makeRequest(connection, '/api/v4/companies', 'POST', data);
    }

    async updateCompany(connection: CrmConnection, companyId: string, data: any) {
        return this.makeRequest(connection, `/api/v4/companies/${companyId}`, 'PATCH', data);
    }

    async createLead(connection: CrmConnection, data: any) {
        return this.makeRequest(connection, '/api/v4/leads', 'POST', data);
    }

    async updateLead(connection: CrmConnection, leadId: string, data: any) {
        return this.makeRequest(connection, `/api/v4/leads/${leadId}`, 'PATCH', data);
    }

    async handleError(error: unknown): Promise<void> {
        if (error instanceof Error) {
            this.logger.error(`AmoCRM API error: ${error.message}`, error.stack);
        } else {
            this.logger.error('Unknown AmoCRM API error:', error);
        }
    }

    async createSubscription(
        userId: string,
        planId: string,
        connection: CrmConnection,
    ): Promise<any> {
        this.logger.log(`AmocrmService: createSubscription for User ID: ${userId}`);
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

        return this.makeRequest(connection, '/api/v4/leads', 'POST', [leadData]);
    }

    async getSubscriptionInfo(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`AmocrmService: getSubscriptionInfo for ID: ${id}`);
        return this.makeRequest(connection, `/api/v4/leads/${id}`);
    }

    async updateSubscription(id: string, data: any, connection: CrmConnection): Promise<any> {
        this.logger.log(`AmocrmService: updateSubscription for ID: ${id}`);
        const leadData = {
            id,
            custom_fields_values: [
                {
                    field_id: 123461, // ID поля статуса подписки в AmoCRM
                    values: [{ value: data.status }],
                },
            ],
        };

        return this.makeRequest(connection, `/api/v4/leads/${id}`, 'PATCH', leadData);
    }

    async cancelSubscription(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`AmocrmService: cancelSubscription for ID: ${id}`);
        const leadData = {
            id,
            status_id: 143, // ID статуса "Отменена" в AmoCRM
        };

        return this.makeRequest(connection, `/api/v4/leads/${id}`, 'PATCH', leadData);
    }

    async createPayment(
        userId: string,
        amount: number,
        currency: string,
        connection: CrmConnection,
    ): Promise<any> {
        this.logger.log(`AmocrmService: createPayment for User ID: ${userId}`);
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

        return this.makeRequest(connection, '/api/v4/leads', 'POST', [paymentData]);
    }

    async getPaymentInfo(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`AmocrmService: getPaymentInfo for ID: ${id}`);
        return this.makeRequest(connection, `/api/v4/leads/${id}`);
    }

    async refundPayment(id: string, connection: CrmConnection, amount?: number): Promise<any> {
        this.logger.log(`AmocrmService: refundPayment for ID: ${id}`);
        const refundData = {
            id,
            status_id: 144, // ID статуса "Возврат" в AmoCRM
            price: amount,
        };

        return this.makeRequest(connection, `/api/v4/leads/${id}`, 'PATCH', refundData);
    }

    async getServers(connection: CrmConnection): Promise<any[]> {
        this.logger.log('AmocrmService: getServers');
        return this.makeRequest(connection, '/api/v4/catalogs/123463/elements'); // ID каталога серверов в AmoCRM
    }

    async getServerInfo(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`AmocrmService: getServerInfo for ID: ${id}`);
        return this.makeRequest(connection, `/api/v4/catalogs/123463/elements/${id}`);
    }

    async updateServerStatus(id: string, status: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`AmocrmService: updateServerStatus for ID: ${id}`);
        const serverData = {
            id,
            custom_fields_values: [
                {
                    field_id: 123464, // ID поля статуса сервера в AmoCRM
                    values: [{ value: status }],
                },
            ],
        };

        return this.makeRequest(
            connection,
            `/api/v4/catalogs/123463/elements/${id}`,
            'PATCH',
            serverData,
        );
    }

    async generateConfig(
        userId: string,
        serverId: string,
        connection: CrmConnection,
    ): Promise<any> {
        this.logger.log(`AmocrmService: generateConfig for User ID: ${userId}`);
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

        return this.makeRequest(connection, '/api/v4/leads', 'POST', [configData]);
    }

    async getConfigInfo(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`AmocrmService: getConfigInfo for ID: ${id}`);
        return this.makeRequest(connection, `/api/v4/leads/${id}`);
    }

    async revokeConfig(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`AmocrmService: revokeConfig for ID: ${id}`);
        const configData = {
            id,
            status_id: 145, // ID статуса "Отозвана" в AmoCRM
        };

        return this.makeRequest(connection, `/api/v4/leads/${id}`, 'PATCH', configData);
    }

    async getAllUserDataFromCrm(userId: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`AmocrmService: getAllUserDataFromCrm for User ID: ${userId}`);
        const userData: any = {};

        try {
            userData.contact = await this.getContactInfo(connection, userId);
        } catch (error: any) {
            this.logger.error(`Failed to get contact info: ${error.message}`);
            userData.contact = null;
        }

        try {
            // Add other data fetching as needed
            userData.subscriptions = await this.getSubscriptionInfo(userId, connection);
            userData.payments = await this.getPaymentInfo(userId, connection);
        } catch (error: any) {
            this.logger.error(`Failed to get related data: ${error.message}`);
        }

        return userData;
    }

    async deleteContact(connection: CrmConnection, contactId: string): Promise<void> {
        // TODO: Реализовать удаление контакта через AmoCRM API
        return;
    }
}
