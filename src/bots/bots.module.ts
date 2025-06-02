import { Module } from '@nestjs/common';
import { EncryptionModule } from '../encryption/encryption.module';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';

@Module({
    imports: [RabbitMQModule, EncryptionModule],
    controllers: [BotsController],
    providers: [BotsService, PrismaService],
    exports: [BotsService],
})
export class BotsModule {}
