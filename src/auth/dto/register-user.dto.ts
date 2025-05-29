import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';

const RegisterUserSchema = extendApi(
  z.object({
    email: z.string().email('Неверный формат email').describe('Email пользователя'),
    password: z.string().min(6, 'Пароль должен быть минимум 6 символов').describe('Пароль пользователя'),
    name: z.string().optional().describe('Имя пользователя (опционально)'),
  }),
  { description: 'DTO для регистрации нового пользователя' },
);

export class RegisterUserDto extends createZodDto(RegisterUserSchema) {}
