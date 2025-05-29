import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const UpdateUserSchema = extendApi(
    z.object({
        email: z.string().email('Неверный формат email').optional().describe('Email пользователя'),
        name: z.string().optional().describe('Имя пользователя (опционально)'),
        password: z
            .string()
            .min(6, 'Пароль должен быть минимум 6 символов')
            .optional()
            .describe('Новый пароль'),
    }),
    { description: 'DTO для обновления пользователя' },
);

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
