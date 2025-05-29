import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { PaymentModule } from './services/payment.module';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        PaymentModule,
    ],
    controllers: [MeController],
    providers: [MeService],
    exports: [MeService],
})
export class MeModule {}
