import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreatePaymentLinkDto {
  @ApiProperty({ description: 'Amount to pay (in kopeks/cents)', example: 1000 })
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than 0' })
  amount?: number;

  @ApiProperty({ description: 'Payment description', example: 'Premium subscription' })
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Order ID', 
    example: 'order_123',
    required: false 
  })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({ 
    description: 'Success URL', 
    example: 'https://your-site.com/success',
    required: false 
  })
  @IsString()
  @IsOptional()
  successUrl?: string;

  @ApiProperty({ 
    description: 'Fail URL', 
    example: 'https://your-site.com/fail',
    required: false 
  })
  @IsString()
  @IsOptional()
  failUrl?: string;

  @ApiProperty({ 
    description: 'Currency code (default: RUB)', 
    example: 'RUB',
    required: false,
    default: 'RUB'
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Payment method for Telegapay', example: 'BANK_SBER', required: false })
  @IsString()
  @IsOptional()
  payment_method?: string;

  @ApiProperty({ description: 'User ID for the payment provider', example: 'user_12345', required: false })
  @IsString() 
  @IsOptional()
  userId?: string | number;

  @ApiProperty({ description: 'Return URL after payment attempt', example: 'https://example.com/payment_status', required: false })
  @IsUrl()
  @IsOptional()
  return_url?: string;
}
