import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';

@Module({
    imports: [RabbitMQModule],
    controllers: [BotsController],
    providers: [BotsService, PrismaService],
    exports: [BotsService],
})
export class BotsModule {}
