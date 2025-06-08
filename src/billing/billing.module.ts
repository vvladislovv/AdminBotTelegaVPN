import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import * as https from 'https';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { TelegramPayService } from './telegram-pay.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        // Здесь можно указать другие стандартные опции для axios, если они нужны,
        // например, timeout, baseURL (хотя baseURL лучше задавать в самом сервисе)
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // ВНИМАНИЕ: Это отключает проверку SSL-сертификата!
                                     // Используйте с осторожностью и НЕ в продакшене
                                     // для недоверенных эндпоинтов.
        }),
      }),
    }),
  ],
  controllers: [BillingController],
  providers: [BillingService, TelegramPayService]
})
export class BillingModule {}
