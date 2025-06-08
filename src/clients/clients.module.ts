import { Module } from '@nestjs/common';
import { BotsModule } from '../bots/bots.module';
import { CrmModule } from '../crm/crm.module';
import { MeModule } from '../me/me.module';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsModule } from '../tickets/tickets.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { CrmConnectionsService } from '../crm/crm-connections.service';

@Module({
    imports: [BotsModule, TicketsModule, MeModule, CrmModule],
    controllers: [ClientsController],
    providers: [ClientsService, PrismaService, CrmConnectionsService],
    exports: [ClientsService],
})
export class ClientsModule {}
