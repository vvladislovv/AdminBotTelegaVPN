import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const LoginSchema = extendApi(
    z.object({
        email: z.string().email('Неверный формат email').describe('Email пользователя'),
        password: z.string().min(1, 'Пароль не может быть пустым').describe('Пароль пользователя'), // Учитывая, что пароль уже хеширован, минимальная длина может быть меньше, но не 0
    }),
    { description: 'DTO для входа пользователя' },
);

export class LoginDto extends createZodDto(LoginSchema) {}
