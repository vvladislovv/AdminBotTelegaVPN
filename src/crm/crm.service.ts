import { Injectable, Logger } from '@nestjs/common';
import { CrmConnection, CrmProvider } from '@prisma/client';
import { AmocrmService } from './adapters/amocrm/amocrm.service';
import { Bitrix24Service } from './adapters/bitrix24/bitrix24.service';

@Injectable()
export class CrmService {
    private readonly logger = new Logger(CrmService.name);

    constructor(
        private readonly amocrmService: AmocrmService,
        private readonly bitrix24Service: Bitrix24Service,
    ) {}

    private getAdapter(connection: CrmConnection) {
        switch (connection.provider) {
            case CrmProvider.AMOCRM:
                return this.amocrmService;
            case CrmProvider.BITRIX24:
                return this.bitrix24Service;
            case CrmProvider.TELEGA_VPN:
                this.logger.warn('TelegaVPN provider not implemented yet');
                return null;
            default:
                this.logger.warn(`Unknown CRM provider in connection: ${connection.provider}`);
                return null;
        }
    }

    async getContactInfo(connection: CrmConnection, contactId: string) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }

        try {
            return await adapter.getContactInfo(connection, contactId);
        } catch (error: any) {
            this.logger.error(
                `Failed to get contact info from ${connection.provider}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    async getRelatedData(connection: CrmConnection, entityId: string, entityType: string) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }

        try {
            return await adapter.getRelatedData(connection, entityId, entityType);
        } catch (error: any) {
            this.logger.error(
                `Failed to get related data from ${connection.provider}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    async createContact(connection: CrmConnection, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.createContact(connection, data);
    }

    async updateContact(connection: CrmConnection, contactId: string, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.updateContact(connection, contactId, data);
    }

    async createDeal(connection: CrmConnection, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.createDeal(connection, data);
    }

    async updateDeal(connection: CrmConnection, dealId: string, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.updateDeal(connection, dealId, data);
    }

    async createTask(connection: CrmConnection, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.createTask(connection, data);
    }

    async updateTask(connection: CrmConnection, taskId: string, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.updateTask(connection, taskId, data);
    }

    async createNote(connection: CrmConnection, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.createNote(connection, data);
    }

    async updateNote(connection: CrmConnection, noteId: string, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.updateNote(connection, noteId, data);
    }

    async createCompany(connection: CrmConnection, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.createCompany(connection, data);
    }

    async updateCompany(connection: CrmConnection, companyId: string, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.updateCompany(connection, companyId, data);
    }

    async createLead(connection: CrmConnection, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.createLead(connection, data);
    }

    async updateLead(connection: CrmConnection, leadId: string, data: any) {
        const adapter = this.getAdapter(connection);
        if (!adapter) {
            throw new Error(`No CRM adapter found for provider: ${connection.provider}`);
        }
        return await adapter.updateLead(connection, leadId, data);
    }
}
