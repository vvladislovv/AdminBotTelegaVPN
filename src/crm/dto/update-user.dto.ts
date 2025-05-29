import { z } from 'zod';

export const UpdateUserSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    telegramId: z.string().optional(),
    telegramUsername: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['active', 'inactive', 'blocked']).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
