import { Module } from '@nestjs/common';
import { BotsModule } from '../bots/bots.module';
import { MeModule } from '../me/me.module';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsModule } from '../tickets/tickets.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
    imports: [BotsModule, TicketsModule, MeModule],
    controllers: [ClientsController],
    providers: [ClientsService, PrismaService],
    exports: [ClientsService],
})
export class ClientsModule {}
