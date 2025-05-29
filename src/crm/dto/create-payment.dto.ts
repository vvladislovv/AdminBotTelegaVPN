import { z } from 'zod';

export const CreatePaymentSchema = z.object({
    userId: z.string(),
    amount: z.number().positive(),
    currency: z.enum(['USD', 'EUR', 'RUB', 'USDT']),
    description: z.string().optional(),
    paymentMethod: z.enum(['card', 'crypto', 'telegram']),
    metadata: z.record(z.any()).optional(),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
