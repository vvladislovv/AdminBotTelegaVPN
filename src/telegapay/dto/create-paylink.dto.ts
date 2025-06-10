import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaylinkDto {
  @ApiProperty({ description: 'Сумма платежа', example: 1000 })
  @IsNotEmpty({ message: 'Сумма не должна быть пустой' })
  @IsNumber({}, { message: 'Сумма должна быть числом' })
  amount!: number;

  @ApiProperty({ description: 'Код валюты (например, RUB)', example: 'RUB' })
  @IsNotEmpty({ message: 'Код валюты не должен быть пустым' })
  @IsString({ message: 'Код валюты должен быть строкой' })
  currency!: string;

  @ApiProperty({ description: 'Метод оплаты', example: 'BANK_SBER' })
  @IsNotEmpty({ message: 'Метод оплаты не должен быть пустым' })
  @IsString({ message: 'Метод оплаты должен быть строкой' })
  payment_method!: string;

  @ApiPropertyOptional({ description: 'Описание платежа', example: 'Оплата заказа №123' })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'URL для возврата после оплаты', example: 'https://example.com/success' })
  @IsOptional()
  @IsUrl({}, { message: 'Неверный формат URL' })
  return_url?: string;

  @ApiPropertyOptional({ description: 'ID пользователя', example: 'user_12345' })
  @IsOptional()
  @IsString({ message: 'ID пользователя должен быть строкой' })
  user_id?: string;
}
