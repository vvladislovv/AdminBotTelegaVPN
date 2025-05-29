import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmocrmService } from './adapters/amocrm/amocrm.service';
import { ITelegaVpnService } from './adapters/telegavpn/interfaces/telegavpn-service.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ICrmService } from './interfaces/crm-service.interface';

@Injectable()
export class CrmService {
    private readonly logger = new Logger(CrmService.name);
    private crmProvider: string;

    constructor(
        private readonly configService: ConfigService,
        @Inject('CRM_SERVICE')
        private readonly crmService: ICrmService,
        @Inject('TELEGAVPN_SERVICE') private readonly telegavpnService: ITelegaVpnService,
        private readonly amocrmService: AmocrmService,
    ) {
        this.crmProvider = this.configService.get<string>('CRM_PROVIDER', 'amocrm');
    }

    private getActiveService(): ICrmService | ITelegaVpnService {
        switch (this.crmProvider.toLowerCase()) {
            case 'amocrm':
                return this.crmService;
            case 'telegavpn':
                return this.telegavpnService;
            default:
                this.logger.warn(
                    `Unknown CRM provider: ${this.crmProvider}, using AmoCRM as default`,
                );
                return this.crmService;
        }
    }

    // User/Contact methods
    async createUser(createUserDto: CreateUserDto) {
        return this.amocrmService.createContact(createUserDto);
    }

    async getUser(id: string) {
        return this.amocrmService.getContactInfo(id);
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto) {
        return this.amocrmService.updateContact(id, updateUserDto);
    }

    async deleteUser(id: string) {
        return this.amocrmService.deleteContact(id);
    }

    // Subscription methods
    async createSubscription(userId: string, planId: string) {
        return this.crmService.createSubscription(userId, planId);
    }

    async getSubscriptionInfo(id: string) {
        return this.crmService.getSubscriptionInfo(id);
    }

    async updateSubscription(id: string, data: any) {
        return this.crmService.updateSubscription(id, data);
    }

    async cancelSubscription(id: string) {
        return this.crmService.cancelSubscription(id);
    }

    // Payment methods
    async createPayment(userId: string, amount: number, currency: string) {
        return this.crmService.createPayment(userId, amount, currency);
    }

    async getPaymentInfo(id: string) {
        return this.crmService.getPaymentInfo(id);
    }

    async refundPayment(id: string, amount?: number) {
        return this.crmService.refundPayment(id, amount);
    }

    // Server methods
    async getServers() {
        return this.crmService.getServers();
    }

    async getServerInfo(id: string) {
        return this.crmService.getServerInfo(id);
    }

    async updateServerStatus(id: string, status: string) {
        return this.crmService.updateServerStatus(id, status);
    }

    // Config methods
    async generateConfig(userId: string, serverId: string) {
        return this.crmService.generateConfig(userId, serverId);
    }

    async getConfigInfo(id: string) {
        return this.crmService.getConfigInfo(id);
    }

    async revokeConfig(id: string) {
        return this.crmService.revokeConfig(id);
    }
}
