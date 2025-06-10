import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidatePaymentMethodDto {
  @ApiProperty({ description: 'Сумма платежа', example: 1000 })
  @IsNotEmpty({ message: 'Сумма не должна быть пустой' })
  @IsNumber({}, { message: 'Сумма должна быть числом' })
  amount!: number;

  @ApiProperty({ description: 'Код валюты (например, RUB)', example: 'RUB' })
  @IsNotEmpty({ message: 'Код валюты не должен быть пустым' })
  @IsString({ message: 'Код валюты должен быть строкой' })
  currency!: string;

  @ApiProperty({ description: 'Метод оплаты для проверки', example: 'BANK_SBER' })
  @IsNotEmpty({ message: 'Метод оплаты не должен быть пустым' })
  @IsString({ message: 'Метод оплаты должен быть строкой' })
  payment_method!: string;
}