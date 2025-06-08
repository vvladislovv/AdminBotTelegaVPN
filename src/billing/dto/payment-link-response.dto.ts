import { ApiProperty } from '@nestjs/swagger';

export class PaymentLinkResponseDto {
  @ApiProperty({ description: 'Payment URL to redirect user to', example: 'https://telegapay.pro/pay/12345' })
  paymentUrl?: string;

  @ApiProperty({ description: 'Payment ID', example: 'pay_123456789' })
  paymentId?: string;

  @ApiProperty({ description: 'Status of the payment link', example: 'pending' })
  status?: string;

  @ApiProperty({ description: 'Amount in kopeks/cents', example: 1000 })
  amount?: number;

  @ApiProperty({ description: 'Currency code', example: 'RUB' })
  currency?: string;

  @ApiProperty({ description: 'Payment description', example: 'Premium subscription' })
  description?: string;

  @ApiProperty({ 
    description: 'Order ID', 
    example: 'order_123',
    required: false 
  })
  orderId?: string;
}
