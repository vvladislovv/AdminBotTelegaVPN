import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TelegapayValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(TelegapayValidationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata) {
    // Если нет метатипа или это примитивный тип, пропускаем валидацию
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Логируем входящие данные для отладки
    this.logger.debug(`🔍 Validating input data: ${JSON.stringify(value)}`);

    // Обрабатываем случай, когда value не является объектом
    if (typeof value !== 'object' || value === null) {
      this.logger.debug(`❌ Invalid input type: expected object, got ${typeof value}`);
      throw new BadRequestException('Invalid input: expected JSON object');
    }

    // Преобразуем входные данные в экземпляр класса DTO
    let object;
    try {
      object = plainToClass(metatype, value);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.debug(`❌ Failed to transform input data: ${error.message}`);
      } else {
        this.logger.debug('❌ Failed to transform input data: Unknown error');
      }
      throw new BadRequestException('Invalid input format');
    }

    // Валидируем объект
    const errors = await validate(object, {
      whitelist: true, // Удаляет свойства, которых нет в DTO
      forbidNonWhitelisted: true, // Выбрасывает ошибку для неизвестных свойств
      transform: true, // Автоматически преобразует типы
      validateCustomDecorators: true,
    });

    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        const constraints = error.constraints;
        return constraints ? Object.values(constraints).join(', ') : 'Validation error';
      });
      
      this.logger.debug(`❌ Validation failed: ${errorMessages.join('; ')}`);
      throw new BadRequestException(`Validation failed: ${errorMessages.join('; ')}`);
    }

    this.logger.debug(`✅ Validation successful for ${metatype.name}`);
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}