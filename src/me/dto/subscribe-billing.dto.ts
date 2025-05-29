import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

export enum SubscriptionPlan {
    FREE = 'FREE',
    PREMIUM = 'PREMIUM',
    ENTERPRISE = 'ENTERPRISE',
}

const SubscribeBillingSchema = extendApi(
    z.object({
        plan: z.nativeEnum(SubscriptionPlan).describe('Тип подписки'),
        botId: z
            .number()
            .int()
            .positive('ID бота должен быть положительным числом')
            .describe('ID бота, для которого оформляется подписка'),
    }),
    { description: 'DTO для оформления подписки' },
);

export class SubscribeBillingDto extends createZodDto(SubscribeBillingSchema) {}
