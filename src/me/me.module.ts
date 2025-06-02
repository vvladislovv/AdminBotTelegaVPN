import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { PaymentModule } from './services/payment.module';
import { TelegaPayService } from './services/telega-pay.service';

@Module({
    imports: [ConfigModule, PrismaModule, PaymentModule],
    controllers: [MeController],
    providers: [MeService, PrismaService, TelegaPayService],
    exports: [MeService],
})
export class MeModule {}
