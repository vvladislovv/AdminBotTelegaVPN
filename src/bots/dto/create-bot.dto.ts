import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const CreateBotSchema = extendApi(
  z.object({
        token: z
            .string()
      .trim()
      .min(1, 'Токен не может быть пустым')
      .regex(/^\d+:[A-Za-z0-9_-]{35}$/, 'Неверный формат токена бота Telegram')
      .describe('Токен бота Telegram'),
        username: z
            .string()
      .trim()
      .min(5, 'Имя пользователя должно быть минимум 5 символов')
            .regex(
                /^@[a-zA-Z0-9_]+$/,
                'Имя пользователя должно начинаться с @ и может содержать только буквы, цифры и подчеркивания',
            )
      .describe('Имя пользователя бота'),
    name: z.string().trim().min(1, 'Название не может быть пустым').describe('Название бота'),
  }),
  { description: 'DTO для создания нового бота' },
);

export class CreateBotDto extends createZodDto(CreateBotSchema) {}
