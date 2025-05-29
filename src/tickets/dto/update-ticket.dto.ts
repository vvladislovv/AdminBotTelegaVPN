import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { TicketStatus } from '@prisma/client';
import { z } from 'zod';

const UpdateTicketSchema = extendApi(
    z.object({
        status: z.nativeEnum(TicketStatus).optional().describe('Статус тикета'),
        comment: z.string().trim().optional().describe('Комментарий к тикету'),
    }),
    { description: 'DTO для обновления тикета' },
);

export class UpdateTicketDto extends createZodDto(UpdateTicketSchema) {}
