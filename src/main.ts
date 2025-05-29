import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { patchNestjsSwagger, ZodValidationPipe } from '@anatine/zod-nestjs';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Глобальные настройки
    app.useGlobalPipes(new ValidationPipe());
    app.use(helmet());
    app.enableCors();

    // Глобальное применение ZodValidationPipe
    app.useGlobalPipes(new ZodValidationPipe());

    // Настройка Swagger с интеграцией Zod
    const config = new DocumentBuilder()
        .setTitle('AdminBotTelegaVPN API')
        .setDescription('API для управления Telegram VPN ботами')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    patchNestjsSwagger(); // Интеграция Zod и Swagger

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Префикс для всех маршрутов
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3001;
    await app.listen(port, () => {
        Logger.log(`Application is running on: http://localhost:${port}`);
    });
}
bootstrap();
