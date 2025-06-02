import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/interfaces/request.interface';
import { SubscribeBillingDto } from './dto/subscribe-billing.dto';
import { MeService } from './me.service';

@ApiTags('me')
@Controller('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeController {
    constructor(private readonly meService: MeService) {}

    @Get('/referrals')
    @ApiOperation({ summary: 'Получить список приглашенных пользователей' })
    @ApiResponse({ status: 200, description: 'Список приглашенных' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async getReferrals(@Request() req: { user: RequestUser }) {
        return this.meService.getReferrals(req.user.id);
    }

    @Get('/referrals/new')
    @ApiOperation({ summary: 'Получить ссылку для регистрации приглашенного пользователя' })
    @ApiResponse({ status: 200, description: 'Ссылка на регистрацию' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async getNewReferralLink(@Request() req: { user: RequestUser }) {
        return this.meService.getNewReferralLink(req.user.id);
    }

    @Get('/referrals/bonuses')
    @ApiOperation({ summary: 'Получить сумму скидок/бонусов по реферальной программе' })
    @ApiResponse({ status: 200, description: 'Сумма бонусов' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async getReferralBonuses(@Request() req: { user: RequestUser }) {
        return this.meService.getReferralBonuses(req.user.id);
    }

    @Get('/referrals/track/:code')
    @ApiOperation({ summary: 'Отследить клик по реферальной ссылке' })
    @ApiResponse({ status: 200, description: 'Клик успешно зарегистрирован' })
    @ApiResponse({ status: 404, description: 'Реферальная ссылка не найдена' })
    async trackReferralClick(@Param('code') code: string) {
        return this.meService.trackReferralClick(code);
    }

    @Post('/billing/subscribe')
    @ApiOperation({ summary: 'Подписаться через TelegaPay' })
    @ApiResponse({ status: 200, description: 'Ссылка на оплату создана' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async subscribeBilling(
        @Request() req: { user: RequestUser },
        @Body() subscribeDto: SubscribeBillingDto,
    ) {
        return this.meService.subscribeBilling(req.user, subscribeDto);
    }

    @Get('/billing/status')
    @ApiOperation({ summary: 'Получить информацию о текущем плане подписки' })
    @ApiResponse({ status: 200, description: 'Информация о плане' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async getBillingStatus(@Request() req: { user: RequestUser }) {
        return this.meService.getBillingStatus(req.user);
    }

    @Get('/billing')
    @ApiOperation({ summary: 'Получить общую информацию о биллинге' })
    @ApiResponse({ status: 200, description: 'Информация о биллинге' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async getBillingInfo(@Request() req: { user: RequestUser }) {
        return this.meService.getBillingInfo(req.user);
    }

    @Get('/crm/usersinfo')
    @ApiOperation({ summary: 'Получить информацию CRM о текущем пользователе' })
    @ApiResponse({ status: 200, description: 'Информация CRM пользователя' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async getCrmUserInfo(@Request() req: { user: RequestUser }) {
        // TODO: Реализовать получение информации CRM о пользователе
        return { crmUserInfo: {} };
    }

    @Get('/crm/connections')
    @ApiOperation({ summary: 'Получить данные о подключениях CRM текущего пользователя' })
    @ApiResponse({ status: 200, description: 'Данные о подключениях CRM' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async getCrmConnections(@Request() req: { user: RequestUser }) {
        // TODO: Реализовать получение данных о подключениях CRM пользователя
        return { crmConnections: [] };
    }
}
