import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const CreateTicketMessageSchema = extendApi(
    z.object({
        message: z
            .string()
            .trim()
            .min(1, 'Сообщение не может быть пустым')
            .describe('Сообщение тикета'),
    }),
    { description: 'DTO для создания нового сообщения тикета' },
);

export class CreateTicketMessageDto extends createZodDto(CreateTicketMessageSchema) {}
