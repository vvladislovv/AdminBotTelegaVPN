import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsIn,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';

// Определите поддерживаемые валюты и типы реквизитов здесь
const SUPPORTED_CURRENCIES = ['RUB', 'USD', 'EUR']; // Пример
const SUPPORTED_REQUISITE_TYPES = ['CARD', 'BANK_ACCOUNT', 'EWALLET']; // Пример

export class CreatePayoutDto {
  @ApiProperty({
    description: 'Сумма выплаты',
    example: 1000.0,
    type: Number,
  })
  @IsNumber({}, { message: 'Сумма должна быть числом' })
  @Min(1, { message: 'Сумма должна быть не менее 1' })
  amount!: number;

  @ApiProperty({
    description: 'Валюта выплаты',
    example: 'RUB',
    enum: SUPPORTED_CURRENCIES,
  })
  @IsString({ message: 'Валюта должна быть строкой' })
  @IsIn(SUPPORTED_CURRENCIES, { message: 'Неподдерживаемая валюта' })
  currency!: string;

  @ApiProperty({
    description: 'Тип реквизита для выплаты',
    example: 'CARD',
    enum: SUPPORTED_REQUISITE_TYPES,
  })
  @IsString({ message: 'Тип реквизита должен быть строкой' })
  @IsIn(SUPPORTED_REQUISITE_TYPES, { message: 'Неподдерживаемый тип реквизита' })
  requisite_type!: string;

  @ApiProperty({
    description: 'Значение реквизита (номер карты, счета и т.д.)',
    example: '2200123456789012',
  })
  @IsString({ message: 'Значение реквизита должно быть строкой' })
  @IsNotEmpty({ message: 'Значение реквизита не должно быть пустым' })
  requisite_value!: string;

  @ApiPropertyOptional({
    description: 'Имя держателя (если применимо)',
    example: 'IVAN IVANOV',
  })
  @IsOptional()
  @IsString({ message: 'Имя держателя должно быть строкой' })
  holder_name?: string;

  @ApiPropertyOptional({
    description: 'Название банка (если применимо)',
    example: 'SBER',
  })
  @IsOptional()
  @IsString({ message: 'Название банка должно быть строкой' })
  bank_name?: string;

  @ApiProperty({
    description: 'Внешний ID для отслеживания выплаты в вашей системе (должен быть уникальным для выплат)',
    example: 'payout_local_12345',
  })
  @IsString({ message: 'Внешний ID должен быть строкой' })
  @IsNotEmpty({ message: 'Внешний ID не должен быть пустым' })
  @MaxLength(255) // Пример ограничения длины, если нужно
  external_id!: string;

  @ApiPropertyOptional({
    description: 'ID пользователя в вашей системе, которому производится выплата (если применимо)',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'ID пользователя должен быть целым числом' })
  userId?: number;
}
