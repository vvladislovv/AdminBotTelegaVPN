import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetRequisitesDto {
  @ApiProperty({
    description: 'Сумма платежа',
    example: 1000,
    type: Number,
  })
  @IsNotEmpty({ message: 'amount не должен быть пустым' })
  @IsNumber({}, { message: 'amount должен быть числом' })
  amount!: number;

  @ApiProperty({
    description: 'Валюта',
    example: 'RUB',
    type: String,
  })
  @IsNotEmpty({ message: 'currency не должна быть пустой' })
  @IsString({ message: 'currency должна быть строкой' })
  currency!: string;

  @ApiProperty({
    description: 'Метод оплаты',
    example: 'BANK_SBER',
    type: String,
  })
  @IsNotEmpty({ message: 'method не должен быть пустым' })
  @IsString({ message: 'method должен быть строкой' })
  method!: string;

  @ApiProperty({
    description: 'ID заказа',
    example: 'order_12345',
    type: String,
  })
  @IsNotEmpty({ message: 'order_id не должен быть пустым' })
  @IsString({ message: 'order_id должен быть строкой' })
  order_id!: string;

  @ApiProperty({
    description: 'ID пользователя',
    example: 'user_12345',
    type: String,
  })
  @IsNotEmpty({ message: 'user_id не должен быть пустым' })
  @IsString({ message: 'user_id должен быть строкой' })
  user_id!: string;
}
