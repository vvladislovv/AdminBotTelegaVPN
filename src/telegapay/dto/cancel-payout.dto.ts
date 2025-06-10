import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelPayoutDto {
  @ApiProperty({
    description: 'ID выплаты для отмены',
    example: 'payout_12345',
    type: String,
  })
  @IsNotEmpty({ message: 'ID выплаты не должен быть пустым' })
  @IsString({ message: 'ID выплаты должен быть строкой' })
  payout_id!: string;
}