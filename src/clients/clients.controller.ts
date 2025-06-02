import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BotsService } from '../bots/bots.service';
import { CreateBotDto } from '../bots/dto/create-bot.dto';
import { UpdateBotDto } from '../bots/dto/update-bot.dto';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';
import { UpdateTicketDto } from '../tickets/dto/update-ticket.dto';
import { TicketsService } from '../tickets/tickets.service';
import { ClientsService } from './clients.service';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('admin/clients')
@Controller('admin/clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.Admin)
export class ClientsController {
    constructor(
        private readonly clientsService: ClientsService,
        private readonly botsService: BotsService,
        private readonly ticketsService: TicketsService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Создать клиента (Админ)' })
    @ApiResponse({ status: 201, description: 'Клиент успешно создан' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
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
    @Roles(Role.Admin)
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
    @Roles(Role.Admin)
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
    @Roles(Role.Admin)
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
    @Roles(Role.Admin)
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
    @Roles(Role.Admin)
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
    @Roles(Role.Admin)
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
    @Roles(Role.Admin)
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
    @Roles(Role.Admin)
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
    @Roles(Role.Admin)
    async removeTicket(@Param('clientId') clientId: string, @Param('ticketId') ticketId: string) {
        // Need to ensure the ticket belongs to the client
        return this.ticketsService.remove(+ticketId, +clientId);
    }
}
