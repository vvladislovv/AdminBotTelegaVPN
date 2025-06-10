import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelPaymentDto {
  @ApiProperty({
    description: 'ID транзакции для отмены',
    example: 'tx_12345',
    type: String,
  })
  @IsNotEmpty({ message: 'ID транзакции не должен быть пустым' })
  @IsString({ message: 'ID транзакции должен быть строкой' })
  transaction_id!: string;
}