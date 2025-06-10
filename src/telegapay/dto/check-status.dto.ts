import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckStatusDto {
  @ApiProperty({
    description: 'ID транзакции в Telegapay',
    example: 'tx_12345',
  })
  @IsNotEmpty({ message: 'transaction_id не должен быть пустым' })
  @IsString({ message: 'transaction_id должен быть строкой' })
  transaction_id!: string;
}
