import { CrmConnection } from '@prisma/client';

export interface ICrmService {
    /**
     * Создает нового пользователя в CRM.
     * @param data Данные пользователя.
     * @param connection Данные CRM подключения пользователя.
     * @returns Идентификатор пользователя в CRM.
     */
    createContact(connection: CrmConnection, data: any): Promise<any>;

    /**
     * Получает информацию о пользователе из CRM по его идентификатору.
     * @param crmUserId Идентификатор пользователя в CRM (может потребоваться ваш внутренний ID или другой идентификатор в зависимости от реализации).
     * @param connection Данные CRM подключения пользователя.
     * @returns Данные пользователя из CRM.
     */
    getContactInfo(connection: CrmConnection, contactId: string): Promise<any>;

    /**
     * Обновляет информацию о пользователе в CRM.
     * @param crmUserId Идентификатор пользователя в CRM.
     * @param data Данные для обновления.
     * @param connection Данные CRM подключения пользователя.
     */
    updateContact(connection: CrmConnection, contactId: string, data: any): Promise<any>;

    /**
     * Удаляет пользователя из CRM.
     * @param connection Данные CRM подключения пользователя.
     * @param contactId Идентификатор пользователя в CRM.
     */
    deleteContact(connection: CrmConnection, contactId: string): Promise<void>;

    /**
     * Создает подписку для пользователя.
     * @param userId Идентификатор пользователя (ваш внутренний или CRM).
     * @param planId Идентификатор плана подписки.
     * @param connection Данные CRM подключения пользователя.
     * @returns Информация о созданной подписке.
     */
    createSubscription(userId: string, planId: string, connection: CrmConnection): Promise<any>;

    /**
     * Получает информацию о подписке пользователя.
     * @param id Идентификатор подписки в CRM.
     * @param connection Данные CRM подключения пользователя.
     * @returns Информация о подписке.
     */
    getSubscriptionInfo(id: string, connection: CrmConnection): Promise<any>;

    /**
     * Обновляет информацию о подписке пользователя.
     * @param id Идентификатор подписки в CRM.
     * @param data Данные для обновления.
     * @param connection Данные CRM подключения пользователя.
     * @returns Обновленная информация о подписке.
     */
    updateSubscription(id: string, data: any, connection: CrmConnection): Promise<any>;

    /**
     * Отменяет подписку пользователя.
     * @param id Идентификатор подписки в CRM.
     * @param connection Данные CRM подключения пользователя.
     * @returns Информация о отмененной подписке.
     */
    cancelSubscription(id: string, connection: CrmConnection): Promise<any>;

    /**
     * Создает платеж для пользователя.
     * @param userId Идентификатор пользователя (ваш внутренний или CRM).
     * @param amount Сумма платежа.
     * @param currency Валюта платежа.
     * @param connection Данные CRM подключения пользователя.
     * @returns Информация о созданном платеже.
     */
    createPayment(
        userId: string,
        amount: number,
        currency: string,
        connection: CrmConnection,
    ): Promise<any>;

    /**
     * Получает информацию о платеже пользователя.
     * @param id Идентификатор платежа в CRM.
     * @param connection Данные CRM подключения пользователя.
     * @returns Информация о платеже.
     */
    getPaymentInfo(id: string, connection: CrmConnection): Promise<any>;

    /**
     * Возвращает платеж пользователю.
     * @param id Идентификатор платежа в CRM.
     * @param amount Сумма возврата (опционально).
     * @param connection Данные CRM подключения пользователя.
     * @returns Информация о возвращенном платеже.
     */
    refundPayment(id: string, connection: CrmConnection, amount?: number): Promise<any>;

    /**
     * Получает список серверов (если применимо к данной CRM).
     * @param connection Данные CRM подключения пользователя.
     * @returns Список серверов.
     */
    getServers(connection: CrmConnection): Promise<any[]>;

    /**
     * Получает информацию о сервере (если применимо к данной CRM).
     * @param id Идентификатор сервера в CRM.
     * @param connection Данные CRM подключения пользователя.
     * @returns Информация о сервере.
     */
    getServerInfo(id: string, connection: CrmConnection): Promise<any>;

    /**
     * Обновляет статус сервера (если применимо к данной CRM).
     * @param id Идентификатор сервера в CRM.
     * @param status Новый статус сервера.
     * @param connection Данные CRM подключения пользователя.
     * @returns Обновленная информация о сервере.
     */
    updateServerStatus(id: string, status: string, connection: CrmConnection): Promise<any>;

    /**
     * Генерирует конфигурацию для пользователя (если применимо к данной CRM).
     * @param userId Идентификатор пользователя (ваш внутренний или CRM).
     * @param serverId Идентификатор сервера в CRM.
     * @param connection Данные CRM подключения пользователя.
     * @returns Сгенерированная конфигурация.
     */
    generateConfig(userId: string, serverId: string, connection: CrmConnection): Promise<any>;

    /**
     * Получает информацию о конфигурации (если применимо к данной CRM).
     * @param id Идентификатор конфигурации в CRM.
     * @param connection Данные CRM подключения пользователя.
     * @returns Информация о конфигурации.
     */
    getConfigInfo(id: string, connection: CrmConnection): Promise<any>;

    /**
     * Аннулирует конфигурацию (если применимо к данной CRM).
     * @param id Идентификатор конфигурации в CRM.
     * @param connection Данные CRM подключения пользователя.
     * @returns Аннулированная конфигурация.
     */
    revokeConfig(id: string, connection: CrmConnection): Promise<any>;

    /**
     * Получает все основные данные для пользователя из CRM.
     * Этот метод агрегирует вызовы других методов адаптера.
     * @param userId Идентификатор пользователя (ваш внутренний).
     * @param connection Данные CRM подключения пользователя.
     * @returns Объект со всеми данными пользователя из CRM (контакт, сделки, задачи и т.д.).
     */
    getAllUserDataFromCrm(userId: string, connection: CrmConnection): Promise<any>;

    getRelatedData(connection: CrmConnection, entityId: string, entityType: string): Promise<any>;
    createDeal(connection: CrmConnection, data: any): Promise<any>;
    updateDeal(connection: CrmConnection, dealId: string, data: any): Promise<any>;
    createTask(connection: CrmConnection, data: any): Promise<any>;
    updateTask(connection: CrmConnection, taskId: string, data: any): Promise<any>;
    createNote(connection: CrmConnection, data: any): Promise<any>;
    updateNote(connection: CrmConnection, noteId: string, data: any): Promise<any>;
    createCompany(connection: CrmConnection, data: any): Promise<any>;
    updateCompany(connection: CrmConnection, companyId: string, data: any): Promise<any>;
    createLead(connection: CrmConnection, data: any): Promise<any>;
    updateLead(connection: CrmConnection, leadId: string, data: any): Promise<any>;

    // Добавьте другие методы по мере необходимости (например, создание сделки, добавление заметки и т.д.)
}
