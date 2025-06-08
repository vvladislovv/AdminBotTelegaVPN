import { CrmConnection } from '@prisma/client';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { UpdateUserDto } from '../../../dto/update-user.dto';

export interface ITelegaVpnService {
    // Методы для работы с пользователями
    createContact(data: CreateUserDto, connection: CrmConnection): Promise<any>;
    getContactInfo(id: string, connection: CrmConnection): Promise<any>;
    updateContact(id: string, data: UpdateUserDto, connection: CrmConnection): Promise<any>;
    deleteContact(id: string, connection: CrmConnection): Promise<void>;

    // Методы для работы с подписками
    createSubscription(userId: string, planId: string, connection: CrmConnection): Promise<any>;
    getSubscriptionInfo(id: string, connection: CrmConnection): Promise<any>;
    updateSubscription(id: string, data: any, connection: CrmConnection): Promise<any>;
    cancelSubscription(id: string, connection: CrmConnection): Promise<any>;

    // Методы для работы с платежами
    createPayment(
        userId: string,
        amount: number,
        currency: string,
        connection: CrmConnection,
    ): Promise<any>;
    getPaymentInfo(id: string, connection: CrmConnection): Promise<any>;
    refundPayment(id: string, connection: CrmConnection, amount?: number): Promise<any>;

    // Методы для работы с серверами
    getServers(connection: CrmConnection): Promise<any[]>;
    getServerInfo(id: string, connection: CrmConnection): Promise<any>;
    updateServerStatus(id: string, status: string, connection: CrmConnection): Promise<any>;

    // Методы для работы с конфигурациями
    generateConfig(userId: string, serverId: string, connection: CrmConnection): Promise<any>;
    getConfigInfo(id: string, connection: CrmConnection): Promise<any>;
    revokeConfig(id: string, connection: CrmConnection): Promise<any>;

    /**
     * Получает все данные пользователя из TelegaVPN.
     */
    getAllUserDataFromCrm(userId: string, connection: CrmConnection): Promise<any>;
}
