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
import { BotsService } from './bots.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';

@ApiTags('me/bots')
@Controller('me/bots')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BotsController {
    constructor(private readonly botsService: BotsService) {}

    @Post()
    @ApiOperation({ summary: 'Создать нового бота' })
    @ApiResponse({ status: 201, description: 'Бот успешно создан' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({
        status: 409,
        description: 'Бот с таким токеном или username уже существует',
    })
    create(@Body() createBotDto: CreateBotDto, @Request() req: { user: RequestUser }) {
        return this.botsService.create(createBotDto, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Получить список всех ботов' })
    @ApiResponse({ status: 200, description: 'Список ботов' })
    findAll(@Request() req: { user: RequestUser }) {
        return this.botsService.findAll(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить информацию о боте' })
    @ApiResponse({ status: 200, description: 'Информация о боте' })
    @ApiResponse({ status: 404, description: 'Бот не найден' })
    findOne(@Param('id') id: string, @Request() req: { user: RequestUser }) {
        return this.botsService.findOne(+id, req.user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить информацию о боте' })
    @ApiResponse({ status: 200, description: 'Информация о боте обновлена' })
    @ApiResponse({ status: 404, description: 'Бот не найден' })
    @ApiResponse({ status: 409, description: 'Бот с таким токеном или username уже существует' })
    update(
        @Param('id') id: string,
        @Body() updateBotDto: UpdateBotDto,
        @Request() req: { user: RequestUser },
    ) {
        return this.botsService.update(+id, updateBotDto, req.user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить бота' })
    @ApiResponse({ status: 200, description: 'Бот успешно удален' })
    @ApiResponse({ status: 404, description: 'Бот не найден' })
    remove(@Param('id') id: string, @Request() req: { user: RequestUser }) {
        return this.botsService.remove(+id, req.user.id);
    }

    @Get(':id/stats')
    @ApiOperation({ summary: 'Получить статистику бота' })
    @ApiResponse({ status: 200, description: 'Статистика бота' })
    @ApiResponse({ status: 404, description: 'Бот не найден' })
    getStats(@Param('id') id: string, @Request() req: { user: RequestUser }) {
        return this.botsService.getStats(+id, req.user.id);
    }
}
