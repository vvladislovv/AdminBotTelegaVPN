export interface ITelegaVpnService {
    // Методы для работы с пользователями
    createUser(userData: any): Promise<string>;
    getUserInfo(userId: string): Promise<any>;
    updateUser(userId: string, updateData: any): Promise<void>;

    // Методы для работы с подписками
    createSubscription(userId: string, planId: string): Promise<string>;
    getSubscriptionInfo(subscriptionId: string): Promise<any>;
    updateSubscription(subscriptionId: string, updateData: any): Promise<void>;

    // Методы для работы с платежами
    createPayment(userId: string, amount: number, currency: string): Promise<string>;
    getPaymentInfo(paymentId: string): Promise<any>;

    // Методы для работы с серверами
    getServers(): Promise<any[]>;
    getServerInfo(serverId: string): Promise<any>;

    // Методы для работы с конфигурациями
    generateConfig(userId: string, serverId: string): Promise<string>;
    getConfigInfo(configId: string): Promise<any>;
}
