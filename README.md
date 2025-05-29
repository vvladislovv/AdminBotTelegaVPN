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

### Аутентификация
- POST /api/auth/login - Вход в систему
- POST /api/auth/logout - Выход из системы
- GET /api/auth/me - Информация о текущем пользователе

### Управление ботами
- GET /api/bots - Список ботов
- POST /api/bots - Создание нового бота
- PATCH /api/bots/:id - Обновление настроек бота
- DELETE /api/bots/:id - Удаление бота

### Тикеты
- GET /api/tickets - Список тикетов
- POST /api/tickets - Создание тикета
- GET /api/tickets/:id - Информация о тикете
- POST /api/tickets/:id/messages - Отправка сообщения в тикет

### CRM
- GET /api/crm/users - Список пользователей CRM
- GET /api/crm/users/:telegramId - Информация о пользователе
- POST /api/crm/webhook - Webhook для обновлений CRM

### Биллинг
- GET /api/billing/plans - Список тарифных планов
- POST /api/billing/subscribe - Подписка на план
- GET /api/billing/status - Статус подписки

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
