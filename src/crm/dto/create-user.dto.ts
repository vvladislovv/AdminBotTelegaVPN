import { z } from 'zod';

export const CreateUserSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    telegramId: z.string().optional(),
    telegramUsername: z.string().optional(),
    notes: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
