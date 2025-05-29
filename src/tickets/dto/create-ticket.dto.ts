import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const CreateTicketSchema = extendApi(
    z.object({
        botId: z
            .number()
            .int()
            .positive('ID бота должен быть положительным числом')
            .describe('ID бота'),
        telegramId: z
            .number()
            .int()
            .positive('Telegram ID должен быть положительным числом')
            .describe('Telegram ID пользователя'),
        subject: z.string().trim().min(1, 'Тема не может быть пустой').describe('Тема тикета'),
        message: z
            .string()
            .trim()
            .min(1, 'Сообщение не может быть пустым')
            .describe('Сообщение тикета'),
    }),
    { description: 'DTO для создания нового тикета' },
);

export class CreateTicketDto extends createZodDto(CreateTicketSchema) {}
