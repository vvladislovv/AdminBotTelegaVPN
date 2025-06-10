import { IsNotEmpty, IsNumber, IsString, IsPositive, IsCurrency } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Если используете Swagger

export class GetMethodsDto {
  @ApiProperty({
    description: 'Сумма платежа',
    example: 1000.0,
    type: Number,
  })
  @IsNotEmpty({ message: 'Сумма не должна быть пустой' })
  @IsNumber({}, { message: 'Сумма должна быть числом' })
  @IsPositive({ message: 'Сумма должна быть положительным числом' })
  amount!: number;

  @ApiProperty({
    description: 'Код валюты (например, RUB, USD)',
    example: 'RUB',
    type: String,
  })
  @IsNotEmpty({ message: 'Код валюты не должен быть пустым' })
  @IsString({ message: 'Код валюты должен быть строкой' })
  // @IsCurrency({}, { message: 'Неверный формат кода валюты' }) // Можно раскомментировать для более строгой проверки
  currency!: string;
}
