import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrmProvider } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BotsService } from '../bots/bots.service';
import { CreateBotDto } from '../bots/dto/create-bot.dto';
import { UpdateBotDto } from '../bots/dto/update-bot.dto';
import { CrmConnectionsService } from '../crm/crm-connections.service';
import { CrmService } from '../crm/crm.service';
import { CreateCrmConnectionDto } from '../crm/dto/create-crm-connection.dto';
import { MeService } from '../me/me.service';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';
import { UpdateTicketDto } from '../tickets/dto/update-ticket.dto';
import { TicketsService } from '../tickets/tickets.service';
import { ClientsService } from './clients.service';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('admin/clients')
@Controller('admin/clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class ClientsController {
    constructor(
        private readonly clientsService: ClientsService,
        private readonly botsService: BotsService,
        private readonly ticketsService: TicketsService,
        private readonly meService: MeService,
        private readonly crmConnectionsService: CrmConnectionsService,
        private readonly crmService: CrmService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Создать клиента (Админ)' })
    @ApiResponse({ status: 201, description: 'Клиент успешно создан' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 409, description: 'Пользователь уже существует' })
    async create(@Body() registerUserDto: RegisterUserDto) {
        return this.clientsService.create(registerUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Получить список всех клиентов (Админ)' })
    @ApiResponse({ status: 200, description: 'Список клиентов' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        return this.clientsService.findAll(page, limit, search);
    }

    @Get('stats')
    getDashboardStats() {
        return this.clientsService.getDashboardStats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Информация о клиенте' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    async findOne(@Param('id') id: string) {
        return this.clientsService.findOne(+id);
    }

    @Get(':id/activity')
    getUserActivity(@Param('id') id: string) {
        return this.clientsService.getUserActivity(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Клиент успешно обновлен' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(+id, updateClientDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Клиент успешно удален' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    async remove(@Param('id') id: string) {
        return this.clientsService.remove(+id);
    }

    // Bot management endpoints
    @Post(':clientId/bots')
    @ApiOperation({ summary: 'Создать бота для клиента (Админ)' })
    @ApiResponse({ status: 201, description: 'Бот успешно создан' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @Roles(Role.ADMIN)
    async createBot(@Param('clientId') clientId: string, @Body() createBotDto: CreateBotDto) {
        // Need to ensure the client exists before creating a bot for them
        await this.clientsService.findOne(+clientId);
        return this.botsService.create(createBotDto, +clientId);
    }

    @Get(':clientId/bots/:botId')
    @ApiOperation({ summary: 'Получить бота клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Информация о боте' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или бот не найден' })
    @Roles(Role.ADMIN)
    async findOneBot(@Param('clientId') clientId: string, @Param('botId') botId: string) {
        // Need to ensure the bot belongs to the client
        return this.botsService.findOne(+botId, +clientId);
    }

    @Patch(':clientId/bots/:botId')
    @ApiOperation({ summary: 'Обновить бота клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Информация о боте обновлена' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или бот не найден' })
    @Roles(Role.ADMIN)
    async updateBot(
        @Param('clientId') clientId: string,
        @Param('botId') botId: string,
        @Body() updateBotDto: UpdateBotDto,
    ) {
        // Need to ensure the bot belongs to the client
        return this.botsService.update(+botId, updateBotDto, +clientId);
    }

    @Delete(':clientId/bots/:botId')
    @ApiOperation({ summary: 'Удалить бота клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Бот успешно удален' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или бот не найден' })
    @Roles(Role.ADMIN)
    async removeBot(@Param('clientId') clientId: string, @Param('botId') botId: string) {
        // Need to ensure the bot belongs to the client
        return this.botsService.remove(+botId, +clientId);
    }

    // Ticket management endpoints
    @Get(':clientId/tickets')
    @ApiOperation({ summary: 'Получить все тикеты клиента (Админ)' })
    @ApiResponse({ status: 200, description: 'Список тикетов' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    @Roles(Role.ADMIN)
    async findAllTickets(@Param('clientId') clientId: string) {
        // Need to ensure the client exists
        await this.clientsService.findOne(+clientId);
        return this.ticketsService.findAll(+clientId);
    }

    @Get(':clientId/tickets/:ticketId')
    @ApiOperation({ summary: 'Получить тикет клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Информация о тикете' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или тикет не найден' })
    @Roles(Role.ADMIN)
    async findOneTicket(@Param('clientId') clientId: string, @Param('ticketId') ticketId: string) {
        // Need to ensure the ticket belongs to the client
        return this.ticketsService.findOne(+ticketId, +clientId);
    }

    @Post(':clientId/tickets')
    @ApiOperation({ summary: 'Создать тикет для клиента (Админ)' })
    @ApiResponse({ status: 201, description: 'Тикет успешно создан' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или бот не найден' })
    @Roles(Role.ADMIN)
    async createTicket(
        @Param('clientId') clientId: string,
        @Body() createTicketDto: CreateTicketDto,
    ) {
        // Need to ensure the client exists and the bot in createTicketDto belongs to the client
        await this.clientsService.findOne(+clientId);
        // The createTicketDto contains botId, the service should check if that bot belongs to the userId (clientId)
        return this.ticketsService.create(createTicketDto, +clientId);
    }

    @Patch(':clientId/tickets/:ticketId')
    @ApiOperation({ summary: 'Обновить тикет клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Статус тикета обновлен' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или тикет не найден' })
    @Roles(Role.ADMIN)
    async updateTicket(
        @Param('clientId') clientId: string,
        @Param('ticketId') ticketId: string,
        @Body() updateTicketDto: UpdateTicketDto,
    ) {
        // Need to ensure the ticket belongs to the client
        return this.ticketsService.update(+ticketId, updateTicketDto, +clientId);
    }

    @Delete(':clientId/tickets/:ticketId')
    @ApiOperation({ summary: 'Удалить тикет клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Тикет успешно удален' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или тикет не найден' })
    @Roles(Role.ADMIN)
    async removeTicket(@Param('clientId') clientId: string, @Param('ticketId') ticketId: string) {
        return this.ticketsService.remove(+ticketId, +clientId);
    }

    // Ticket Messages endpoints
    @Post(':clientId/tickets/:ticketId/messages')
    @ApiOperation({ summary: 'Добавить сообщение в тикет клиента (Админ)' })
    @ApiResponse({ status: 201, description: 'Сообщение успешно добавлено' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или тикет не найден' })
    @Roles(Role.ADMIN)
    async addMessageToTicket(
        @Param('clientId') clientId: string,
        @Param('ticketId') ticketId: string,
        @Body() messageData: { message: string },
    ) {
        // Проверяем существование клиента и тикета
        await this.clientsService.findOne(+clientId);
        await this.ticketsService.findOne(+ticketId, +clientId);

        return this.ticketsService.addMessage(
            +ticketId,
            {
                message: messageData.message,
            },
            +clientId,
        );
    }

    @Get(':clientId/tickets/:ticketId/messages')
    @ApiOperation({ summary: 'Получить сообщения тикета клиента (Админ)' })
    @ApiResponse({ status: 200, description: 'Список сообщений' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или тикет не найден' })
    @Roles(Role.ADMIN)
    async getTicketMessages(
        @Param('clientId') clientId: string,
        @Param('ticketId') ticketId: string,
    ) {
        // Проверяем существование клиента и тикета
        await this.clientsService.findOne(+clientId);
        await this.ticketsService.findOne(+ticketId, +clientId);

        return this.ticketsService.getMessages(+ticketId, +clientId);
    }

    // Admin Referral Endpoints
    @Get(':clientId/me/referrals')
    @ApiOperation({ summary: 'Получить список приглашенных пользователем (Админ)' })
    @ApiResponse({ status: 200, description: 'Список приглашенных пользователей' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    async getClientReferrals(@Param('clientId') clientId: string) {
        return this.meService.getReferrals(+clientId);
    }

    @Get(':clientId/me/referrals/stats')
    @ApiOperation({ summary: 'Получить статистику рефералов пользователя (Админ)' })
    @ApiResponse({ status: 200, description: 'Статистика рефералов' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    async getClientReferralStats(@Param('clientId') clientId: string) {
        return this.meService.getReferralStats(+clientId);
    }

    @Get(':clientId/me/referrals/links')
    @ApiOperation({ summary: 'Получить реферальные ссылки пользователя (Админ)' })
    @ApiResponse({ status: 200, description: 'Список реферальных ссылок' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    async getClientReferralLinks(@Param('clientId') clientId: string) {
        // Note: MeService.getNewReferralLink is for generating *new* links.
        // We need a method to get *existing* links for a user. Let's add that to MeService.
        return this.meService.getReferralLinks(+clientId);
    }

    @Get(':clientId/me/referrals/bonuses')
    @ApiOperation({ summary: 'Получить бонусы рефералов пользователя (Админ)' })
    @ApiResponse({ status: 200, description: 'Сумма бонусов' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    async getClientReferralBonuses(@Param('clientId') clientId: string) {
        return this.meService.getReferralBonuses(+clientId);
    }

    @Patch(':clientId/me/referrals/bonuses')
    @ApiOperation({ summary: 'Обновить бонусы рефералов пользователя (Админ)' })
    @ApiResponse({ status: 200, description: 'Бонусы успешно обновлены' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    async updateClientReferralBonuses(
        @Param('clientId') clientId: string,
        @Body() updateBonusDto: { totalBonus?: number; pendingBonus?: number },
    ) {
        return this.meService.updateReferralBonuses(
            +clientId,
            updateBonusDto.totalBonus,
            updateBonusDto.pendingBonus,
        );
    }

    @Delete(':clientId/me/referrals/links/:linkId')
    @ApiOperation({ summary: 'Удалить реферальную ссылку пользователя (Админ)' })
    @ApiResponse({ status: 200, description: 'Ссылка успешно удалена' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или ссылка не найдены' })
    async deleteClientReferralLink(
        @Param('clientId') clientId: string,
        @Param('linkId') linkId: string,
    ) {
        return this.meService.deleteReferralLink(+linkId, +clientId);
    }

    // Admin CRM Connections Endpoints
    @Post(':clientId/crm/connections')
    @ApiOperation({ summary: 'Создать CRM подключение для клиента (Админ)' })
    @ApiResponse({ status: 201, description: 'Подключение успешно создано' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    async createClientCrmConnection(
        @Param('clientId') clientId: string,
        @Body() connectionData: CreateCrmConnectionDto,
    ) {
        // Optional: Check if client exists
        await this.clientsService.findOne(+clientId);
        return this.crmConnectionsService.createConnection({
            ...connectionData,
            userId: +clientId,
        });
    }

    @Get(':clientId/crm/connections')
    @ApiOperation({ summary: 'Получить CRM подключение клиента по ID клиента (Админ)' })
    @ApiResponse({ status: 200, description: 'Информация о подключении' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или подключение не найдено' })
    async getClientCrmConnection(@Param('clientId') clientId: string) {
        // Optional: Check if client exists
        await this.clientsService.findOne(+clientId);
        return this.crmConnectionsService.getConnection(+clientId);
    }

    @Patch(':clientId/crm/connections/:connectionId')
    @ApiOperation({ summary: 'Обновить CRM подключение клиента по ID подключения (Админ)' })
    @ApiResponse({ status: 200, description: 'Подключение успешно обновлено' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или подключение не найдено' })
    async updateClientCrmConnection(
        @Param('clientId') clientId: string,
        @Param('connectionId') connectionId: string,
        @Body()
        updateConnectionData: {
            provider?: CrmProvider;
            accessToken?: string;
            refreshToken?: string;
            expiresAt?: Date;
            domain?: string;
            otherData?: any;
            isActive?: boolean;
        },
    ) {
        // Optional: Check if client exists (and perhaps if the connection belongs to the client)
        await this.clientsService.findOne(+clientId);
        // The service method should also verify the connection belongs to the user
        return this.crmConnectionsService.updateConnection(+connectionId, updateConnectionData);
    }

    @Delete(':clientId/crm/connections/:connectionId')
    @ApiOperation({ summary: 'Удалить CRM подключение клиента по ID подключения (Админ)' })
    @ApiResponse({ status: 200, description: 'Подключение успешно удалено' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или подключение не найдено' })
    async deleteClientCrmConnection(
        @Param('clientId') clientId: string,
        @Param('connectionId') connectionId: string,
    ) {
        // Optional: Check if client exists (and perhaps if the connection belongs to the client)
        await this.clientsService.findOne(+clientId);
        // The service method should also verify the connection belongs to the user
        return this.crmConnectionsService.deleteConnection(+connectionId);
    }

    // Admin CRM Data Endpoints (to get data FROM the connected CRM)
    @Get(':clientId/crm/data/all')
    @ApiOperation({ summary: 'Получить все данные клиента из подключенной CRM (Админ)' })
    @ApiResponse({ status: 200, description: 'Данные из CRM' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент или CRM подключение не найдено' })
    async getAllClientCrmData(@Param('clientId') clientId: string) {
        // Need to fetch the CRM connection for this user first
        const crmConnection = await this.crmConnectionsService.getConnection(+clientId);
        // Then use the main CrmService to fetch data using the connection details
        // return this.crmService.getAllUserDataFromCrm(+clientId, crmConnection);
    }

    @Post(':id/crm/connections')
    async createCrmConnection(
        @Param('id', ParseIntPipe) id: number,
        @Body() connectionData: CreateCrmConnectionDto,
    ) {
        return this.clientsService.createCrmConnection(id, connectionData);
    }
}
