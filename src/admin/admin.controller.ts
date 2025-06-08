import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/enums/role.enum';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    // Promo Code Management
    @Post('promo-codes')
    @ApiOperation({ summary: 'Create a new promo code' })
    @ApiResponse({ status: 201, description: 'Promo code created successfully' })
    async createPromoCode(@Body() dto: CreatePromoCodeDto) {
        return this.adminService.createPromoCode(1, dto); // TODO: Get actual admin ID from request
    }

    @Get('promo-codes')
    @ApiOperation({ summary: 'Get all promo codes' })
    @ApiResponse({ status: 200, description: 'List of all promo codes' })
    async getAllPromoCodes() {
        return this.adminService.getAllPromoCodes();
    }

    @Get('promo-codes/:id')
    @ApiOperation({ summary: 'Get a specific promo code' })
    @ApiResponse({ status: 200, description: 'Promo code details' })
    async getPromoCode(@Param('id') id: string) {
        return this.adminService.getPromoCode(+id);
    }

    @Patch('promo-codes/:id')
    @ApiOperation({ summary: 'Update a promo code' })
    @ApiResponse({ status: 200, description: 'Promo code updated successfully' })
    async updatePromoCode(@Param('id') id: string, @Body() dto: Partial<CreatePromoCodeDto>) {
        return this.adminService.updatePromoCode(+id, dto);
    }

    @Delete('promo-codes/:id')
    @ApiOperation({ summary: 'Delete a promo code' })
    @ApiResponse({ status: 200, description: 'Promo code deleted successfully' })
    async deletePromoCode(@Param('id') id: string) {
        return this.adminService.deletePromoCode(+id);
    }

    @Patch('promo-codes/:id/toggle')
    @ApiOperation({ summary: 'Toggle promo code status' })
    @ApiResponse({ status: 200, description: 'Promo code status toggled successfully' })
    async togglePromoCodeStatus(@Param('id') id: string) {
        return this.adminService.togglePromoCodeStatus(+id);
    }

    @Post('promo-codes/validate')
    @ApiOperation({ summary: 'Проверить промокод' })
    @ApiResponse({ status: 200, description: 'Промокод проверен успешно' })
    @ApiResponse({ status: 400, description: 'Промокод недействителен' })
    @ApiResponse({ status: 404, description: 'Промокод не найден' })
    async validatePromoCode(@Body() dto: ValidatePromoCodeDto) {
        return this.adminService.validatePromoCode(dto);
    }

    // CRM Management
    @Get('crm/connections')
    @ApiOperation({ summary: 'Get all CRM connections' })
    @ApiResponse({ status: 200, description: 'List of all CRM connections' })
    async getAllCrmConnections() {
        return this.adminService.getAllCrmConnections();
    }

    @Get('crm/connections/:id')
    @ApiOperation({ summary: 'Get a specific CRM connection' })
    @ApiResponse({ status: 200, description: 'CRM connection details' })
    async getCrmConnection(@Param('id') id: string) {
        return this.adminService.getCrmConnection(+id);
    }

    @Delete('crm/connections/:id')
    @ApiOperation({ summary: 'Delete a CRM connection' })
    @ApiResponse({ status: 200, description: 'CRM connection deleted successfully' })
    async deleteCrmConnection(@Param('id') id: string) {
        return this.adminService.deleteCrmConnection(+id);
    }

    @Patch('crm/connections/:id/toggle')
    @ApiOperation({ summary: 'Toggle CRM connection status' })
    @ApiResponse({ status: 200, description: 'CRM connection status toggled successfully' })
    async toggleCrmConnectionStatus(@Param('id') id: string) {
        return this.adminService.toggleCrmConnectionStatus(+id);
    }
}
