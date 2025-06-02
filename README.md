# Admin Bot TelegaVPN

Административная панель для управления Telegram VPN ботами с интеграцией CRM.

## Технологии

- **Бэкенд**: NestJS (Node.js + TypeScript)
- **Telegram-боты**: Python (aiogram), микросервисная архитектура
- **Очереди**: RabbitMQ
- **Фронтенд**: React + TailwindCSS, совместимый с Telegram Web Apps
- **База данных**: PostgreSQL
- **Кэш**: Redis
- **Балансировка и прокси**: Nginx
- **Контейнеризация**: Docker + Docker Compose
- **Хранилище файлов**: локальное или S3-совместимое

## Требования

- Docker и Docker Compose
- Node.js 20+
- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- RabbitMQ 3+

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/admin-bot-telega-vpn.git
cd admin-bot-telega-vpn
```

2. Создайте файл .env на основе .env.example:
```bash
cp .env.example .env
```

3. Запустите проект с помощью Docker Compose:
```bash
docker-compose up -d
```

4. Примените миграции базы данных:
```bash
docker-compose exec app npm run prisma:migrate
```

## Разработка

### Бэкенд (NestJS)

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run start:dev

# Генерация Prisma клиента
npm run prisma:generate

# Запуск миграций
npm run prisma:migrate
```

### Python боты

```bash
# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows

# Установка зависимостей
pip install -r requirements.txt

# Запуск бота
python bot/main.py
```

## API Endpoints

### Authentication
- POST /auth/login - Вход в систему
- POST /auth/logout - Выход из системы
- GET /auth/me - Информация о текущем пользователе

### Bots
- GET /bots - Список ботов
- POST /bots - Создание нового бота
- PATCH /bots/:id - Обновление настроек бота
- DELETE /bots/:id - Удаление бота

### Tickets
- GET /tickets - Список тикетов
- POST /tickets - Создание тикета
- GET /tickets/:id - Информация о тикете
- POST /tickets/:id/messages - Отправка сообщения в тикет

### CRM
- GET /crm/users - Список пользователей CRM
- GET /crm/users/:telegramId - Информация о пользователе
- POST /crm/webhook - Webhook для обновлений CRM

### Billing
- GET /billing/plans - Список тарифных планов
- POST /billing/subscribe - Подписка на план
- GET /billing/status - Статус подписки

## Безопасность

- JWT аутентификация
- Хеширование паролей (bcrypt)
- Rate limiting
- HTTPS
- Защита от XSS и CSRF
- Валидация входных данных

## Мониторинг

- Логирование через Winston
- Метрики через Prometheus
- Трейсинг через OpenTelemetry

## Лицензия

MIT
