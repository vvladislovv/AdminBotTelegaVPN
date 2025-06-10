import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsIn,
  IsOptional,
  IsDate,
  ValidateIf,
} from 'class-validator';

const TRANSACTION_TYPES = ['payin', 'payout'];

export class TelegapayWebhookDto {
  @ApiProperty({ description: 'ID транзакции в системе Telegapay', example: 'tx_12345' })
  @IsString()
  @IsNotEmpty()
  transaction_id!: string;

  @ApiProperty({ description: 'Статус транзакции от Telegapay', example: 'completed' })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty({ description: 'Тип транзакции', example: 'payin', enum: TRANSACTION_TYPES })
  @IsString()
  @IsIn(TRANSACTION_TYPES)
  type!: 'payin' | 'payout';

  @ApiProperty({ description: 'Сумма транзакции', example: 1000 })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ description: 'Сумма транзакции в USDT', example: 10.5 })
  @IsOptional()
  @IsNumber()
  amount_usdt?: number;

  @ApiProperty({ description: 'Валюта транзакции', example: 'RUB' })
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @ApiProperty({ description: 'Время создания транзакции', example: '2025-06-08T18:12:44.418Z', type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  created_at!: Date;

  @ApiPropertyOptional({ description: 'Время завершения транзакции', example: '2025-06-08T18:12:44.418Z', type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ValidateIf(o => o.status === 'completed' || o.status === 'paid') // Завершено, если статус соответствующий
  completed_at?: Date;

  @ApiPropertyOptional({ description: 'Время отмены транзакции', example: '2025-06-08T18:12:44.418Z', type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ValidateIf(o => o.status === 'cancelled' || o.status === 'rejected') // Отменено, если статус соответствующий
  cancelled_at?: Date;

  @ApiPropertyOptional({ description: 'Кем обработана транзакция', example: 'system' })
  @IsOptional()
  @IsString()
  processed_by?: string;

  @ApiPropertyOptional({ description: 'Причина отмены', example: 'timeout' })
  @IsOptional()
  @IsString()
  cancellation_reason?: string;

  // Telegapay может присылать и другие поля, их можно добавить сюда как @IsOptional()
  // Например, order_id, если он передавался при создании и возвращается в вебхуке
  @ApiPropertyOptional({ description: 'Внутренний ID заказа (если передавался и возвращается)', example: 'my_order_123' })
  @IsOptional()
  @IsString()
  order_id?: string; 
}
