import { ICrmService } from '@/crm/interfaces/crm-service.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { CrmConnection } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Bitrix24Service implements ICrmService {
    private readonly logger = new Logger(Bitrix24Service.name);

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
            const url = connection.domain ? `${connection.domain}${endpoint}` : endpoint;
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
            this.logger.error(`Bitrix24 API request failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getContactInfo(connection: CrmConnection, contactId: string) {
        return this.makeRequest(connection, `/rest/crm.contact.get?id=${contactId}`);
    }

    async getRelatedData(connection: CrmConnection, entityId: string, entityType: string) {
        return this.makeRequest(connection, `/rest/crm.${entityType}.get?id=${entityId}`);
    }

    async createContact(connection: CrmConnection, data: any) {
        const bitrix24Response = await this.makeRequest(
            connection,
            '/rest/crm.contact.add',
            'POST',
            { fields: data },
        );

        // TODO: Map Bitrix24 response to CrmUser fields and save to local database
        // Need to get botId here. Assuming data contains telegramId and other user info.
        if (bitrix24Response && bitrix24Response.result) {
            const bitrix24ContactId = bitrix24Response.result;
            // Replace with actual botId and more accurate mapping
            const botId = 1; // <--- THIS NEEDS TO BE REPLACED WITH ACTUAL botId

            if (data.telegramId) {
                try {
                    const crmUser = await this.prisma.crmUser.upsert({
                        where: { telegramId: data.telegramId },
                        update: {
                            username: data.LAST_NAME || data.NAME,
                            firstName: data.NAME,
                            lastName: data.LAST_NAME,
                            botId: botId, // Use the determined botId
                        },
                        create: {
                            telegramId: data.telegramId,
                            username: data.LAST_NAME || data.NAME,
                            firstName: data.NAME,
                            lastName: data.LAST_NAME,
                            botId: botId, // Use the determined botId
                        },
                    });
                    this.logger.log(`CrmUser created/updated in local DB: ${crmUser.id}`);
                } catch (dbError: any) {
                    this.logger.error(
                        `Failed to save CrmUser to local DB: ${dbError.message}`,
                        dbError.stack,
                    );
                    // Do not rethrow, as Bitrix24 contact creation was successful
                }
            }
        }

        return bitrix24Response;
    }

    async updateContact(connection: CrmConnection, contactId: string, data: any) {
        return this.makeRequest(connection, '/rest/crm.contact.update', 'POST', {
            id: contactId,
            fields: data,
        });
    }

    async createDeal(connection: CrmConnection, data: any) {
        return this.makeRequest(connection, '/rest/crm.deal.add', 'POST', { fields: data });
    }

    async updateDeal(connection: CrmConnection, dealId: string, data: any) {
        return this.makeRequest(connection, '/rest/crm.deal.update', 'POST', {
            id: dealId,
            fields: data,
        });
    }

    async createTask(connection: CrmConnection, data: any) {
        return this.makeRequest(connection, '/rest/tasks.task.add', 'POST', { fields: data });
    }

    async updateTask(connection: CrmConnection, taskId: string, data: any) {
        return this.makeRequest(connection, '/rest/tasks.task.update', 'POST', {
            taskId,
            fields: data,
        });
    }

    async createNote(connection: CrmConnection, data: any) {
        return this.makeRequest(connection, '/rest/crm.timeline.comment.add', 'POST', data);
    }

    async updateNote(connection: CrmConnection, noteId: string, data: any) {
        return this.makeRequest(connection, '/rest/crm.timeline.comment.update', 'POST', {
            id: noteId,
            fields: data,
        });
    }

    async createCompany(connection: CrmConnection, data: any) {
        return this.makeRequest(connection, '/rest/crm.company.add', 'POST', { fields: data });
    }

    async updateCompany(connection: CrmConnection, companyId: string, data: any) {
        return this.makeRequest(connection, '/rest/crm.company.update', 'POST', {
            id: companyId,
            fields: data,
        });
    }

    async createLead(connection: CrmConnection, data: any) {
        return this.makeRequest(connection, '/rest/crm.lead.add', 'POST', { fields: data });
    }

    async updateLead(connection: CrmConnection, leadId: string, data: any) {
        return this.makeRequest(connection, '/rest/crm.lead.update', 'POST', {
            id: leadId,
            fields: data,
        });
    }

    async deleteContact(connection: CrmConnection, contactId: string): Promise<void> {
        // TODO: Реализовать удаление контакта через Bitrix24 API
        return;
    }

    async createSubscription(
        userId: string,
        planId: string,
        connection: CrmConnection,
    ): Promise<any> {
        this.logger.log(`Bitrix24Service: createSubscription for User ID: ${userId}`);
        return this.makeRequest(connection, '/rest/crm.deal.add', 'POST', {
            fields: { TITLE: `Subscription ${planId}`, CONTACT_ID: userId },
        });
    }

    async getSubscriptionInfo(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`Bitrix24Service: getSubscriptionInfo for ID: ${id}`);
        return this.makeRequest(connection, '/rest/crm.deal.get', 'GET', { id });
    }

    async updateSubscription(id: string, data: any, connection: CrmConnection): Promise<any> {
        this.logger.log(`Bitrix24Service: updateSubscription for ID: ${id}`);
        return this.makeRequest(connection, '/rest/crm.deal.update', 'POST', {
            id,
            fields: data,
        });
    }

    async cancelSubscription(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`Bitrix24Service: cancelSubscription for ID: ${id}`);
        return this.makeRequest(connection, '/rest/crm.deal.update', 'POST', {
            id,
            fields: { STAGE_ID: 'C4:LOSE' },
        });
    }

    async createPayment(
        userId: string,
        amount: number,
        currency: string,
        connection: CrmConnection,
    ): Promise<any> {
        this.logger.log(`Bitrix24Service: createPayment for User ID: ${userId}`);
        return this.makeRequest(connection, '/rest/crm.invoice.add', 'POST', {
            fields: { UF_CONTACT_ID: userId, PRICE: amount, CURRENCY: currency },
        });
    }

    async getPaymentInfo(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`Bitrix24Service: getPaymentInfo for ID: ${id}`);
        return this.makeRequest(connection, '/rest/crm.invoice.get', 'GET', { id });
    }

    async refundPayment(id: string, connection: CrmConnection, amount?: number): Promise<any> {
        this.logger.log(`Bitrix24Service: refundPayment for ID: ${id}`);
        return this.makeRequest(connection, '/rest/crm.invoice.update', 'POST', {
            id,
            fields: { STATUS_ID: 'D' },
        });
    }

    async getServers(connection: CrmConnection): Promise<any[]> {
        this.logger.log('Bitrix24Service: getServers');
        return this.makeRequest(connection, '/rest/lists.element.get', 'GET', { IBLOCK_ID: 123 });
    }

    async getServerInfo(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`Bitrix24Service: getServerInfo for ID: ${id}`);
        return this.makeRequest(connection, '/rest/lists.element.get', 'GET', {
            IBLOCK_ID: 123,
            ID: id,
        });
    }

    async updateServerStatus(id: string, status: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`Bitrix24Service: updateServerStatus for ID: ${id}`);
        return this.makeRequest(connection, '/rest/lists.element.update', 'POST', {
            IBLOCK_ID: 123,
            ID: id,
            FIELDS: { STATUS: status },
        });
    }

    async generateConfig(
        userId: string,
        serverId: string,
        connection: CrmConnection,
    ): Promise<any> {
        this.logger.log(`Bitrix24Service: generateConfig for User ID: ${userId}`);
        return this.makeRequest(connection, '/rest/tasks.task.add', 'POST', {
            fields: {
                TITLE: `Generate config for ${userId}`,
                RESPONSIBLE_ID: userId,
                DESCRIPTION: `Server ID: ${serverId}`,
            },
        });
    }

    async getConfigInfo(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`Bitrix24Service: getConfigInfo for ID: ${id}`);
        return this.makeRequest(connection, '/rest/tasks.task.get', 'GET', { id });
    }

    async revokeConfig(id: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`Bitrix24Service: revokeConfig for ID: ${id}`);
        return this.makeRequest(connection, '/rest/tasks.task.update', 'POST', {
            id,
            fields: { STATUS: 5 },
        });
    }

    async getAllUserDataFromCrm(userId: string, connection: CrmConnection): Promise<any> {
        this.logger.log(`Bitrix24Service: getAllUserDataFromCrm for User ID: ${userId}`);
        const userData: any = {};

        try {
            userData.contact = await this.getContactInfo(connection, userId);
        } catch (error: any) {
            this.logger.error(`Failed to get contact info: ${error.message}`);
            userData.contact = null;
        }

        try {
            const deals = await this.makeRequest(connection, '/rest/crm.deal.list', 'GET', {
                filter: { CONTACT_ID: userId },
            });
            userData.deals = deals;

            const tasks = await this.makeRequest(connection, '/rest/tasks.task.list', 'GET', {
                filter: { RESPONSIBLE_ID: userId },
            });
            userData.tasks = tasks;

            userData.subscriptions = await this.getSubscriptionInfo(userId, connection);
            userData.payments = await this.getPaymentInfo(userId, connection);
        } catch (error: any) {
            this.logger.error(`Failed to get related data: ${error.message}`);
        }

        return userData;
    }
}
