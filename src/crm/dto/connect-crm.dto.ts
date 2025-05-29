import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const ConnectCrmSchema = extendApi(
    z.object({
        apiKey: z.string().trim().min(1, 'API ключ не может быть пустым').describe('API ключ CRM'),
        crmUrl: z.string().url('Неверный формат URL CRM').describe('URL CRM'),
    }),
    { description: 'DTO для подключения к CRM' },
);

export class ConnectCrmDto extends createZodDto(ConnectCrmSchema) {}
