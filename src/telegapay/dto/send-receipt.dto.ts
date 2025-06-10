import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendReceiptDto {
  @ApiProperty({
    description: 'ID транзакции',
    example: 'tx_12345',
    type: String,
  })
  @IsNotEmpty({ message: 'ID транзакции не должен быть пустым' })
  @IsString({ message: 'ID транзакции должен быть строкой' })
  transaction_id!: string;

  @ApiProperty({
    description: 'URL файла чека',
    example: 'https://example.com/receipt.jpg',
    type: String,
  })
  @IsNotEmpty({ message: 'URL чека не должен быть пустым' })
  @IsString({ message: 'URL чека должен быть строкой' })
  @IsUrl({}, { message: 'Некорректный формат URL чека' })
  receipt_url!: string;
}