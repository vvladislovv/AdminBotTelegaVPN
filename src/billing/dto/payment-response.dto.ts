import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

type PaymentStatusType = keyof typeof PaymentStatus;
type PaymentMethodType = keyof typeof PaymentMethod;

export class PaymentResponseDto {
  @ApiProperty({ 
    description: 'Payment ID',
    required: false,
  })
  id?: string;

  @ApiProperty({ 
    description: 'User ID',
    required: false,
  })
  userId?: number;

  @ApiProperty({ 
    description: 'Payment amount',
    required: false,
  })
  amount?: number;

  @ApiProperty({ 
    description: 'Payment currency', 
    example: 'RUB',
    required: false,
  })
  currency?: string;

  @ApiProperty({ 
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
    required: false,
  })
  status?: PaymentStatus;

  @ApiProperty({ 
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
    required: false,
  })
  method?: PaymentMethod;

  @ApiProperty({ 
    description: 'Payment URL',
    required: false,
  })
  paymentUrl?: string;

  @ApiProperty({ 
    description: 'External payment ID',
    required: false,
  })
  externalId?: string;

  @ApiProperty({ 
    description: 'Order ID',
    required: false,
  })
  orderId?: string;

  @ApiProperty({ 
    description: 'Payment description',
    required: false,
  })
  description?: string;

  @ApiProperty({ 
    description: 'Payment metadata',
    required: false,
    type: 'object',
  })
  metadata?: Record<string, unknown>;

  @ApiProperty({ 
    description: 'Date when payment was created', 
    required: false,
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({ 
    description: 'Date when payment was last updated', 
    required: false,
    type: Date,
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Associated Subscription ID',
    required: false,
    type: Number,
  })
  subscriptionId?: number;

  constructor(partial: Partial<PaymentResponseDto> = {}) {
    Object.assign(this, {
      id: undefined,
      userId: undefined,
      amount: undefined,
      currency: undefined,
      status: undefined,
      method: undefined,
      paymentUrl: undefined,
      externalId: undefined,
      orderId: undefined,
      description: undefined,
      metadata: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      subscriptionId: undefined,
      ...partial,
    });
  }
}

export class PaymentLinkResponseDto {
  @ApiProperty({ 
    description: 'URL to redirect user for payment',
    type: String,
  })
  paymentUrl!: string;

  @ApiProperty({ 
    description: 'Payment ID',
    type: String,
  })
  paymentId!: string;

  @ApiProperty({ 
    description: 'Order ID',
    type: String,
  })
  orderId!: string;

  @ApiProperty({ 
    description: 'Payment amount',
    type: Number,
  })
  amount!: number;

  @ApiProperty({ 
    description: 'Currency code', 
    example: 'RUB',
    type: String,
  })
  currency!: string;

  @ApiProperty({ 
    description: 'Payment description',
    type: String,
  })
  description!: string;
}
