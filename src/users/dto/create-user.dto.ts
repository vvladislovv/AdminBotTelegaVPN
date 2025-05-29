import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';

const CreateUserSchema = extendApi(
  z.object({
    email: z.string().email('Неверный формат email').describe('Email пользователя'),
    name: z.string().optional().describe('Имя пользователя (опционально)'),
    password: z.string().min(6, 'Пароль должен быть минимум 6 символов').describe('Пароль пользователя'), // Добавляем валидацию пароля, если он используется при создании
  }),
  { description: 'DTO для создания нового пользователя' },
);

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
