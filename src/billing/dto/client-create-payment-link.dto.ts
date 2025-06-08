import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ClientCreatePaymentLinkDto {
  @ApiProperty({
    description: 'The ID of the subscription plan to pay for.',
    example: 'premium_monthly',
  })
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @ApiProperty({
    description: 'An optional promo code to apply to the payment.',
    example: 'SUMMER20',
    required: false,
  })
  @IsString()
  @IsOptional()
  promoCode?: string;
}
