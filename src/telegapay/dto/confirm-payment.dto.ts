import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'ID транзакции Telegapay для подтверждения оплаты',
    example: 'tx_12345abc',
  })
  @IsNotEmpty({ message: 'ID транзакции не должен быть пустым' })
  @IsString({ message: 'ID транзакции должен быть строкой' })
  transaction_id!: string;
}
