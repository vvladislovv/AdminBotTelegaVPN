import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class SubscriptionResponseDto {
  @ApiProperty({ description: 'Subscription ID' })
  id!: number;

  @ApiProperty({ description: 'User ID' })
  userId!: number;

  @ApiProperty({ enum: SubscriptionPlan, description: 'Subscription plan type' })
  plan!: SubscriptionPlan;

  @ApiProperty({ enum: SubscriptionStatus, description: 'Subscription status' })
  status!: SubscriptionStatus;

  @ApiProperty({ description: 'Subscription start date' })
  startDate!: Date;

  @ApiProperty({ description: 'Subscription period start', required: false, nullable: true })
  periodStart?: Date | null;

  @ApiProperty({ description: 'Subscription period end', required: false, nullable: true })
  periodEnd?: Date | null;

  @ApiProperty({ description: 'Subscription end date', nullable: true })
  endDate!: Date | null;

  @ApiProperty({ description: 'Whether the subscription is active' })
  isActive!: boolean;

  @ApiProperty({ description: 'Date when the subscription was created' })
  createdAt!: Date;

  @ApiProperty({ description: 'Date when the subscription was last updated' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Associated bot name', nullable: true, required: false })
  botName?: string | null;

  @ApiProperty({ description: 'Associated bot username', nullable: true, required: false })
  botUsername?: string | null;

  @ApiProperty({ description: 'Associated bot payment token', nullable: true, required: false })
  botPaymentToken?: string | null;

  @ApiProperty({ description: 'Associated bot object', required: false, nullable: true })
  bot?: any;

  @ApiProperty({ description: 'Associated payment object', required: false, nullable: true })
  payment?: any;
}
