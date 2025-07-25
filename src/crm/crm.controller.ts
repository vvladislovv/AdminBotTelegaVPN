import { Body, Controller, Post, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmConnectionsService } from './crm-connections.service';

@Controller('crm')
export class CrmController {
    private readonly logger = new Logger(CrmController.name);

    constructor(
        private readonly crmService: CrmService,
        private readonly crmConnectionsService: CrmConnectionsService,
    ) {}

    @Post('contact')
    async createContact(@Body() createUserDto: any) {
        try {
            // Get the first available CRM connection instead of using dummy data
            const connections = await this.crmConnectionsService.getAllConnections();
            
            if (!connections || connections.length === 0) {
                throw new HttpException(
                    'No CRM connections configured',
                    HttpStatus.BAD_REQUEST
                );
            }

            const connection = connections[0]; // Use first available connection
            return await this.crmService.createContact(connection, createUserDto);
        } catch (error: any) {
            this.logger.error(`Failed to create contact: ${error.message}`, error.stack);
            
            if (error instanceof HttpException) {
                throw error;
            }
            
            throw new HttpException(
                'Failed to create contact in CRM',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
