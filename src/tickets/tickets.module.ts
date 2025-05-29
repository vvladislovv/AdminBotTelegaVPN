import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
    imports: [RabbitMQModule],
    controllers: [TicketsController],
    providers: [TicketsService, PrismaService],
    exports: [TicketsService],
})
export class TicketsModule {}
