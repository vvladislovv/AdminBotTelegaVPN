import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface ICrmService {
    /**
     * Создает нового пользователя в CRM.
     * @param userData Данные пользователя.
     * @returns Идентификатор пользователя в CRM.
     */
    createContact(data: CreateUserDto): Promise<any>;

    /**
     * Получает информацию о пользователе из CRM по его идентификатору.
     * @param crmUserId Идентификатор пользователя в CRM.
     * @returns Данные пользователя из CRM.
     */
    getContactInfo(id: string): Promise<any>;

    /**
     * Обновляет информацию о пользователе в CRM.
     * @param crmUserId Идентификатор пользователя в CRM.
     * @param updateData Данные для обновления.
     */
    updateContact(id: string, data: UpdateUserDto): Promise<any>;

    /**
     * Удаляет пользователя из CRM.
     * @param id Идентификатор пользователя в CRM.
     */
    deleteContact(id: string): Promise<void>;

    /**
     * Создает подписку для пользователя.
     * @param userId Идентификатор пользователя.
     * @param planId Идентификатор плана подписки.
     * @returns Информация о созданной подписке.
     */
    createSubscription(userId: string, planId: string): Promise<any>;

    /**
     * Получает информацию о подписке пользователя.
     * @param id Идентификатор подписки.
     * @returns Информация о подписке.
     */
    getSubscriptionInfo(id: string): Promise<any>;

    /**
     * Обновляет информацию о подписке пользователя.
     * @param id Идентификатор подписки.
     * @param data Данные для обновления.
     * @returns Обновленная информация о подписке.
     */
    updateSubscription(id: string, data: any): Promise<any>;

    /**
     * Отменяет подписку пользователя.
     * @param id Идентификатор подписки.
     * @returns Информация о отмененной подписке.
     */
    cancelSubscription(id: string): Promise<any>;

    /**
     * Создает платеж для пользователя.
     * @param userId Идентификатор пользователя.
     * @param amount Сумма платежа.
     * @param currency Валюта платежа.
     * @returns Информация о созданном платеже.
     */
    createPayment(userId: string, amount: number, currency: string): Promise<any>;

    /**
     * Получает информацию о платеже пользователя.
     * @param id Идентификатор платежа.
     * @returns Информация о платеже.
     */
    getPaymentInfo(id: string): Promise<any>;

    /**
     * Возвращает платеж пользователю.
     * @param id Идентификатор платежа.
     * @param amount Сумма возврата (опционально).
     * @returns Информация о возвращенном платеже.
     */
    refundPayment(id: string, amount?: number): Promise<any>;

    /**
     * Получает список серверов.
     * @returns Список серверов.
     */
    getServers(): Promise<any[]>;

    /**
     * Получает информацию о сервере.
     * @param id Идентификатор сервера.
     * @returns Информация о сервере.
     */
    getServerInfo(id: string): Promise<any>;

    /**
     * Обновляет статус сервера.
     * @param id Идентификатор сервера.
     * @param status Новый статус сервера.
     * @returns Обновленная информация о сервере.
     */
    updateServerStatus(id: string, status: string): Promise<any>;

    /**
     * Генерирует конфигурацию для пользователя.
     * @param userId Идентификатор пользователя.
     * @param serverId Идентификатор сервера.
     * @returns Сгенерированная конфигурация.
     */
    generateConfig(userId: string, serverId: string): Promise<any>;

    /**
     * Получает информацию о конфигурации.
     * @param id Идентификатор конфигурации.
     * @returns Информация о конфигурации.
     */
    getConfigInfo(id: string): Promise<any>;

    /**
     * Аннулирует конфигурацию.
     * @param id Идентификатор конфигурации.
     * @returns Аннулированная конфигурация.
     */
    revokeConfig(id: string): Promise<any>;

    // Добавьте другие методы по мере необходимости (например, создание сделки, добавление заметки и т.д.)
}
