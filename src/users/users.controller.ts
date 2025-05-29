import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('me/users')
@Controller('me/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Получить список всех пользователей' })
    @ApiResponse({ status: 200, description: 'Список пользователей' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить пользователя по ID' })
    @ApiResponse({ status: 200, description: 'Информация о пользователе' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить пользователя' })
    @ApiResponse({ status: 200, description: 'Пользователь успешно обновлен' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить пользователя' })
    @ApiResponse({ status: 200, description: 'Пользователь успешно удален' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
