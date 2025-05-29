import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}

    transform(value: unknown, metadata: ArgumentMetadata) {
        try {
            const result = this.schema.parse(value);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new BadRequestException({
                    message: 'Validation failed',
                    errors: error.message,
                });
            }
            throw new BadRequestException('Validation failed');
        }
    }
}
