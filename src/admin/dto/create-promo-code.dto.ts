import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const CreatePromoCodeSchema = extendApi(
    z.object({
        code: z.string().min(3).max(50).describe('Промокод'),
        discount: z.number().positive().describe('Размер скидки'),
        type: z.enum(['PERCENTAGE', 'FIXED']).describe('Тип скидки (процент или фиксированная сумма)'),
        maxUses: z.number().int().positive().optional().describe('Максимальное количество использований'),
        expiresAt: z.string().datetime().optional().describe('Дата истечения срока действия'),
    }),
    { description: 'DTO для создания промокода' },
);

export class CreatePromoCodeDto extends createZodDto(CreatePromoCodeSchema) {} 