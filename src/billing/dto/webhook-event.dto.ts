import { ApiProperty } from '@nestjs/swagger'

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export class WebhookEventDto {
  @ApiProperty({ description: 'Event ID', example: 'evt_123456789' })
  id?: string;

  @ApiProperty({ 
    description: 'Event type', 
    example: 'payment.paid',
    enum: ['payment.paid', 'payment.failed', 'payment.refunded'] 
  })
  type?: string;

  @ApiProperty({ description: 'Payment ID', example: 'pay_123456789' })
  paymentId?: string;

  @ApiProperty({ description: 'Order ID', example: 'order_123' })
  orderId?: string;

  @ApiProperty({ description: 'Amount in kopeks/cents', example: 1000 })
  amount?: number;

  @ApiProperty({ description: 'Currency code', example: 'RUB' })
  currency?: string;

  @ApiProperty({ 
    description: 'Payment status', 
    enum: PaymentStatus,
    example: PaymentStatus.PAID 
  })
  status?: PaymentStatus;

  @ApiProperty({ 
    description: 'Payment metadata', 
    example: { userId: '123', plan: 'premium' },
    required: false 
  })
  metadata?: Record<string, any>;

  @ApiProperty({ 
    description: 'Timestamp when the event was created', 
    example: '2023-01-01T12:00:00.000Z' 
  })
  createdAt?: string;
}
