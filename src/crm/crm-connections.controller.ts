import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CrmConnectionsService } from './crm-connections.service';
import { CreateCrmConnectionDto } from './dto/create-crm-connection.dto';
import { UpdateCrmConnectionDto } from './dto/update-crm-connection.dto';

interface RequestWithUser extends Request {
    user: {
        id: number;
        email: string;
        role: string;
    };
}

@ApiTags('CRM Connections')
@ApiBearerAuth()
@Controller('crm/connections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmConnectionsController {
    constructor(private readonly crmConnectionsService: CrmConnectionsService) {}

    @ApiOperation({ summary: 'Create new CRM connection' })
    @ApiResponse({ status: 201, description: 'CRM connection successfully created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @Post()
    create(
        @Request() req: RequestWithUser,
        @Body() createCrmConnectionDto: CreateCrmConnectionDto,
    ) {
        const dto = {
            ...createCrmConnectionDto,
            userId: req.user.id,
        };
        return this.crmConnectionsService.createConnection(dto);
    }

    @ApiOperation({ summary: 'Get all CRM connections' })
    @ApiResponse({ status: 200, description: 'List of CRM connections retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @Get()
    findAll() {
        // In a real application, you might want to filter connections by the current user
        // For admin panel, maybe list all or filter by a query param
        return this.crmConnectionsService.getAllConnections();
    }

    @ApiOperation({ summary: 'Get CRM connection by ID' })
    @ApiResponse({ status: 200, description: 'CRM connection retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'CRM connection not found' })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.crmConnectionsService.getConnection(id);
    }

    @ApiOperation({ summary: 'Update CRM connection by ID' })
    @ApiResponse({ status: 200, description: 'CRM connection updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'CRM connection not found' })
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCrmConnectionDto: UpdateCrmConnectionDto,
    ) {
        return this.crmConnectionsService.updateConnection(id, updateCrmConnectionDto);
    }

    @ApiOperation({ summary: 'Delete CRM connection by ID' })
    @ApiResponse({ status: 200, description: 'CRM connection deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'CRM connection not found' })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.crmConnectionsService.deleteConnection(id);
    }
}
