import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CrmService } from './crm.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmController {
    constructor(private readonly crmService: CrmService) {}

    @ApiOperation({ summary: 'Create new user in CRM' })
    @ApiResponse({ status: 201, description: 'User successfully created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @Post('users')
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.crmService.createUser(createUserDto);
    }

    @ApiOperation({ summary: 'Get user info from CRM' })
    @ApiResponse({ status: 200, description: 'User info retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Get('users/:id')
    async getUser(@Param('id') id: string) {
        return this.crmService.getUser(id);
    }

    @ApiOperation({ summary: 'Update user in CRM' })
    @ApiResponse({ status: 200, description: 'User successfully updated' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Put('users/:id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.crmService.updateUser(id, updateUserDto);
    }

    @ApiOperation({ summary: 'Delete user from CRM' })
    @ApiResponse({ status: 200, description: 'User successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Delete('users/:id')
    async deleteUser(@Param('id') id: string) {
        return this.crmService.deleteUser(id);
    }
}
