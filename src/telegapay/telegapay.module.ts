import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TelegapayController } from './controllers/telegapay.controller';
import { TelegapayService } from './services/telegapay.service';
// Предполагаем, что PrismaService доступен глобально или через импорт PrismaModule в AppModule
// Если у тебя есть отдельный PrismaModule, его можно импортировать сюда:
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    HttpModule, // Для выполнения HTTP-запросов
    ConfigModule, // Для доступа к .env переменным
    PrismaModule,
  ],
  controllers: [TelegapayController],
  providers: [TelegapayService],
  exports: [TelegapayService], // Экспортируем сервис для использования в других модулях
})
export class TelegapayModule {}
