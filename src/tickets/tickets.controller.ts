import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/interfaces/request.interface';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@ApiTags('me/tickets')
@Controller('me/tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Post()
    @ApiOperation({ summary: 'Создать новый тикет' })
    @ApiResponse({ status: 201, description: 'Тикет успешно создан' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 404, description: 'Бот не найден' })
    create(@Body() createTicketDto: CreateTicketDto, @Request() req: { user: RequestUser }) {
        return this.ticketsService.create(createTicketDto, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Получить список всех тикетов' })
    @ApiResponse({ status: 200, description: 'Список тикетов' })
    findAll(@Request() req: { user: RequestUser }) {
        return this.ticketsService.findAll(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить информацию о тикете' })
    @ApiResponse({ status: 200, description: 'Информация о тикете' })
    @ApiResponse({ status: 404, description: 'Тикет не найден' })
    findOne(@Param('id') id: string, @Request() req: { user: RequestUser }) {
        return this.ticketsService.findOne(+id, req.user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить статус тикета' })
    @ApiResponse({ status: 200, description: 'Статус тикета обновлен' })
    @ApiResponse({ status: 404, description: 'Тикет не найден' })
    update(
        @Param('id') id: string,
        @Body() updateTicketDto: UpdateTicketDto,
        @Request() req: { user: RequestUser },
    ) {
        return this.ticketsService.update(+id, updateTicketDto, req.user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить тикет' })
    @ApiResponse({ status: 200, description: 'Тикет успешно удален' })
    @ApiResponse({ status: 404, description: 'Тикет не найден' })
    remove(@Param('id') id: string, @Request() req: { user: RequestUser }) {
        return this.ticketsService.remove(+id, req.user.id);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Добавить сообщение в тикет' })
    @ApiResponse({ status: 201, description: 'Сообщение успешно добавлено' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 404, description: 'Тикет не найден' })
    addMessage(
        @Param('id') id: string,
        @Body() createTicketMessageDto: CreateTicketMessageDto,
        @Request() req: { user: RequestUser },
    ) {
        return this.ticketsService.addMessage(+id, createTicketMessageDto, req.user.id);
    }

    @Get(':id/messages')
    @ApiOperation({ summary: 'Получить сообщения тикета' })
    @ApiResponse({ status: 200, description: 'Список сообщений тикета' })
    @ApiResponse({ status: 404, description: 'Тикет не найден' })
    getMessages(@Param('id') id: string, @Request() req: { user: RequestUser }) {
        return this.ticketsService.getMessages(+id, req.user.id);
    }
}
