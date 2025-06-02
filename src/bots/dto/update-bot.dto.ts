import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const UpdateBotSchema = extendApi(
    z.object({
        token: z
            .string()
            .trim()
            .regex(/^\d+:[A-Za-z0-9_-]{35}$/, 'Неверный формат токена бота Telegram')
            .optional()
            .describe('Токен Telegram бота'),
        username: z
            .string()
            .trim()
            .min(5, 'Имя пользователя должно быть минимум 5 символов')
            .regex(
                /^@[a-zA-Z0-9_]+$/,
                'Имя пользователя должно начинаться с @ и может содержать только буквы, цифры и подчеркивания',
            )
            .optional()
            .describe('Имя пользователя бота'),
        name: z.string().trim().optional().describe('Название бота'),
        isActive: z.boolean().optional().describe('Активен ли бот'),
    }),
    { description: 'DTO для обновления бота' },
);

export class UpdateBotDto extends createZodDto(UpdateBotSchema) {}
