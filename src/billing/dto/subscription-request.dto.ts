import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export type SubscriptionStatusType = keyof typeof SubscriptionStatus;

export class CreateSubscriptionDto {
  @ApiProperty({ 
    enum: SubscriptionPlan, 
    description: 'Subscription plan ID',
    example: SubscriptionPlan.BASIC,
    enumName: 'SubscriptionPlan',
  })
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @ApiProperty({ 
    description: 'Bot ID to subscribe',
    example: 1,
    type: Number,
  })
  @IsNumber()
  botId!: number;

  @ApiPropertyOptional({ 
    description: 'Promo code (optional)',
    example: 'SUMMER2023',
  })
  @IsString()
  @IsOptional()
  promoCode?: string;
}

export class SubscriptionResponseDto {
  @ApiProperty({ 
    description: 'Subscription ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({ 
    enum: SubscriptionPlan,
    enumName: 'SubscriptionPlan',
  })
  plan!: SubscriptionPlan;

  @ApiProperty({ 
    description: 'Subscription amount in RUB',
    type: Number,
  })
  amount!: number;

  @ApiPropertyOptional({
    description: 'Payment ID',
    type: String,
    nullable: true,
  })
  paymentId?: string | null;

  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
    enumName: 'SubscriptionStatus',
  })
  status!: keyof typeof SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Subscription period start date',
    type: Date,
    nullable: true,
  })
  periodStart?: Date | null;

  @ApiPropertyOptional({
    description: 'Subscription period end date',
    type: Date,
    nullable: true,
  })
  periodEnd?: Date | null;

  @ApiProperty({
    description: 'Subscription creation date',
    type: Date,
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Subscription last update date',
    type: Date,
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Bot information',
    type: Object,
    required: false,
  })
  bot?: {
    id: number;
    name: string;
    token: string;
    createdAt: Date;
    updatedAt: Date;
  };

  @ApiPropertyOptional({
    description: 'Payment information',
    type: Object,
    required: false,
  })
  payment?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    externalId: string | null;
    orderId: string | null;
    description: string | null;
    metadata: any;
    method: string;
    paymentUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  } | null | undefined;

  @ApiPropertyOptional({ 
    description: 'Payment URL (if payment is required)',
    type: String,
    required: false,
  })
  paymentUrl?: string;
}
