import { patchNestjsSwagger, ZodValidationPipe } from '@anatine/zod-nestjs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Глобальные настройки
    app.useGlobalPipes(new ValidationPipe());
    app.use(helmet());
    
    // CORS настройки для разработки
    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
    });

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

    const port = process.env.PORT || 3000;
    await app.listen(port, () => {
        Logger.log(`Application is running on: http://localhost:${port}`);
    });
}
bootstrap();
