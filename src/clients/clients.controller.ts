import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('admin/clients')
@Controller('admin/clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Post()
    @ApiOperation({ summary: 'Создать клиента (Админ)' })
    @ApiResponse({ status: 201, description: 'Клиент успешно создан' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @Roles(Role.Admin)
    async create(@Body() createClientDto: CreateClientDto) {
        return this.clientsService.create(createClientDto);
    }

    @Get()
    @ApiOperation({ summary: 'Получить список всех клиентов (Админ)' })
    @ApiResponse({ status: 200, description: 'Список клиентов' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @Roles(Role.Admin)
    async findAll() {
        return this.clientsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Информация о клиенте' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    @Roles(Role.Admin)
    async findOne(@Param('id') id: string) {
        return this.clientsService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Клиент успешно обновлен' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    @Roles(Role.Admin)
    async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(+id, updateClientDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить клиента по ID (Админ)' })
    @ApiResponse({ status: 200, description: 'Клиент успешно удален' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    @ApiResponse({ status: 404, description: 'Клиент не найден' })
    @Roles(Role.Admin)
    async remove(@Param('id') id: string) {
        return this.clientsService.remove(+id);
    }
}
