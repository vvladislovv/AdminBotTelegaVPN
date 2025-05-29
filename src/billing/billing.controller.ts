import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';

@ApiTags('me/billing')
@Controller('me/billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Get('/link')
    @ApiOperation({ summary: 'Получить ссылку для оплаты' })
    @ApiResponse({ status: 200, description: 'Ссылка для оплаты' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async getPaymentLink() {
        // Реализация получения ссылки для оплаты
        return { link: 'payment_link_placeholder' };
    }
}
