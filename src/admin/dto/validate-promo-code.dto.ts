import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const ValidatePromoCodeSchema = extendApi(
    z.object({
        code: z.string().min(3).max(50).describe('Промокод для проверки'),
        amount: z.number().positive().describe('Сумма, к которой применяется скидка'),
    }),
    { description: 'DTO для проверки промокода' },
);

export class ValidatePromoCodeDto extends createZodDto(ValidatePromoCodeSchema) {}
