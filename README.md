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

## API Endpoints с примерами curl

Базовый URL: `http://localhost:3000`

### Authentication

#### Регистрация пользователя
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Вход в систему
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Получить информацию о текущем пользователе
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Выход из системы
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Профиль пользователя (me)

#### Получить список рефералов
```bash
curl -X GET http://localhost:3000/me/referrals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Получить новую реферальную ссылку
```bash
curl -X GET http://localhost:3000/me/referrals/new \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Получить бонусы по реферальной программе
```bash
curl -X GET http://localhost:3000/me/referrals/bonuses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Отследить клик по реферальной ссылке
```bash
curl -X GET http://localhost:3000/me/referrals/track/REFERRAL_CODE
```

#### Подписаться через TelegaPay
```bash
curl -X POST http://localhost:3000/me/billing/subscribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": 1,
    "paymentMethod": "card"
  }'
```

#### Получить статус подписки
```bash
curl -X GET http://localhost:3000/me/billing/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Получить информацию о биллинге
```bash
curl -X GET http://localhost:3000/me/billing \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Получить CRM информацию пользователя
```bash
curl -X GET http://localhost:3000/me/crm/usersinfo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Получить CRM подключения пользователя
```bash
curl -X GET http://localhost:3000/me/crm/connections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Боты (me/bots)

#### Создать нового бота
```bash
curl -X POST http://localhost:3000/me/bots \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My VPN Bot",
    "token": "BOT_TOKEN_FROM_BOTFATHER",
    "username": "my_vpn_bot",
    "description": "VPN bot for users"
  }'
```

#### Получить список всех ботов
```bash
curl -X GET http://localhost:3000/me/bots \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Получить информацию о боте
```bash
curl -X GET http://localhost:3000/me/bots/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Обновить информацию о боте
```bash
curl -X PATCH http://localhost:3000/me/bots/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Bot Name",
    "description": "Updated description"
  }'
```

#### Удалить бота
```bash
curl -X DELETE http://localhost:3000/me/bots/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Получить статистику бота
```bash
curl -X GET http://localhost:3000/me/bots/1/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Тикеты (me/tickets)

#### Создать новый тикет
```bash
curl -X POST http://localhost:3000/me/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bot not working",
    "description": "My bot stopped responding",
    "botId": 1,
    "priority": "HIGH"
  }'
```

#### Получить список всех тикетов
```bash
curl -X GET http://localhost:3000/me/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Получить информацию о тикете
```bash
curl -X GET http://localhost:3000/me/tickets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Обновить статус тикета
```bash
curl -X PATCH http://localhost:3000/me/tickets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

#### Удалить тикет
```bash
curl -X DELETE http://localhost:3000/me/tickets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Добавить сообщение в тикет
```bash
curl -X POST http://localhost:3000/me/tickets/1/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Additional information about the issue"
  }'
```

#### Получить сообщения тикета
```bash
curl -X GET http://localhost:3000/me/tickets/1/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### CRM

#### Создать контакт в CRM
```bash
curl -X POST http://localhost:3000/crm/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

### CRM Подключения

#### Создать CRM подключение
```bash
curl -X POST http://localhost:3000/crm/connections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "AMOCRM",
    "accessToken": "access_token_here",
    "refreshToken": "refresh_token_here",
    "domain": "your-domain.amocrm.ru"
  }'
```

#### Получить все CRM подключения
```bash
curl -X GET http://localhost:3000/crm/connections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Получить CRM подключение по ID
```bash
curl -X GET http://localhost:3000/crm/connections/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Обновить CRM подключение
```bash
curl -X PUT http://localhost:3000/crm/connections/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "new_access_token",
    "isActive": true
  }'
```

#### Удалить CRM подключение
```bash
curl -X DELETE http://localhost:3000/crm/connections/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Администрирование (admin)

#### Создать промокод
```bash
curl -X POST http://localhost:3000/admin/promo-codes \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DISCOUNT20",
    "discountPercent": 20,
    "maxUses": 100,
    "expiresAt": "2024-12-31T23:59:59Z"
  }'
```

#### Получить все промокоды
```bash
curl -X GET http://localhost:3000/admin/promo-codes \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Получить промокод по ID
```bash
curl -X GET http://localhost:3000/admin/promo-codes/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Обновить промокод
```bash
curl -X PATCH http://localhost:3000/admin/promo-codes/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discountPercent": 25,
    "maxUses": 200
  }'
```

#### Удалить промокод
```bash
curl -X DELETE http://localhost:3000/admin/promo-codes/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Переключить статус промокода
```bash
curl -X PATCH http://localhost:3000/admin/promo-codes/1/toggle \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Проверить промокод
```bash
curl -X POST http://localhost:3000/admin/promo-codes/validate \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DISCOUNT20",
    "userId": 1
  }'
```

### Управление клиентами (admin/clients)

#### Создать клиента
```bash
curl -X POST http://localhost:3000/admin/clients \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

#### Получить список всех клиентов
```bash
curl -X GET "http://localhost:3000/admin/clients?page=1&limit=10&search=jane" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Получить статистику дашборда
```bash
curl -X GET http://localhost:3000/admin/clients/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Получить клиента по ID
```bash
curl -X GET http://localhost:3000/admin/clients/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Получить активность пользователя
```bash
curl -X GET http://localhost:3000/admin/clients/1/activity \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Обновить клиента
```bash
curl -X PATCH http://localhost:3000/admin/clients/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Name",
    "isActive": true
  }'
```

#### Удалить клиента
```bash
curl -X DELETE http://localhost:3000/admin/clients/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### TelegaPay

#### Получить методы оплаты
```bash
curl -X POST http://localhost:3000/telegapay/get-methods \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "RUB"
  }'
```

#### Получить реквизиты для оплаты
```bash
curl -X POST http://localhost:3000/telegapay/get-requisites \
  -H "Content-Type: application/json" \
  -d '{
    "method": "card",
    "amount": 100,
    "currency": "RUB",
    "order_id": "order_123",
    "user_id": "user_456"
  }'
```

#### Проверить доступность метода оплаты
```bash
curl -X POST http://localhost:3000/telegapay/validate-payment-method \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "card",
    "amount": 100,
    "currency": "RUB"
  }'
```

#### Создать ссылку на оплату
```bash
curl -X POST http://localhost:3000/telegapay/create-paylink \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "RUB",
    "order_id": "order_123",
    "description": "VPN subscription",
    "success_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel"
  }'
```

#### Проверить статус платежа
```bash
curl -X POST http://localhost:3000/telegapay/check-status \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_123"
  }'
```

#### Подтвердить платеж
```bash
curl -X POST http://localhost:3000/telegapay/confirm-payment \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "payment_external_id"
  }'
```

#### Создать выплату
```bash
curl -X POST http://localhost:3000/telegapay/create-payout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "RUB",
    "method": "card",
    "order_id": "payout_123",
    "requisites": {
      "card_number": "1234567890123456"
    }
  }'
```

#### Отменить платеж
```bash
curl -X POST http://localhost:3000/telegapay/cancel-payment \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_123"
  }'
```

#### Отменить выплату
```bash
curl -X POST http://localhost:3000/telegapay/cancel-payout \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "payout_123"
  }'
```

#### Отправить чек
```bash
curl -X POST http://localhost:3000/telegapay/send-receipt \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "trans_123",
    "email": "user@example.com"
  }'
```

### Swagger документация

После запуска приложения, полная документация API доступна по адресу:
```
http://localhost:3000/api
```

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

# Полный список API ручек и примеры вызова

Ниже приведены все основные API-ручки проекта с примерами вызова через curl. Для большинства ручек требуется JWT-токен (см. переменную {{token}} в Postman или получите через /auth/login).

---

## Auth

### Вход в систему
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Регистрация
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new_user@example.com",
    "password": "password123",
    "name": "New User"
  }'
```

### Получить профиль
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Выход
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Me (Личный кабинет)

### Получить список рефералов
```bash
curl -X GET http://localhost:3000/me/referrals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить новую реферальную ссылку
```bash
curl -X GET http://localhost:3000/me/referrals/new \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Трекнуть клик по реферальной ссылке
```bash
curl -X GET http://localhost:3000/me/referrals/track/REFERRAL_CODE
```

### Подписаться через TelegaPay
```bash
curl -X POST http://localhost:3000/me/billing/subscribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "PREMIUM",
    "botId": 1
  }'
```

### Получить статус подписки
```bash
curl -X GET http://localhost:3000/me/billing/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить информацию о биллинге
```bash
curl -X GET http://localhost:3000/me/billing \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить CRM информацию пользователя
```bash
curl -X GET http://localhost:3000/me/crm/usersinfo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить CRM подключения пользователя
```bash
curl -X GET http://localhost:3000/me/crm/connections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Боты (me/bots)

### Создать нового бота
```bash
curl -X POST http://localhost:3000/me/bots \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My VPN Bot",
    "token": "BOT_TOKEN_FROM_BOTFATHER",
    "username": "my_vpn_bot",
    "description": "VPN bot for users"
  }'
```

### Получить список всех ботов
```bash
curl -X GET http://localhost:3000/me/bots \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить информацию о боте
```bash
curl -X GET http://localhost:3000/me/bots/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Обновить информацию о боте
```bash
curl -X PATCH http://localhost:3000/me/bots/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Bot Name",
    "description": "Updated description"
  }'
```

### Удалить бота
```bash
curl -X DELETE http://localhost:3000/me/bots/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить статистику бота
```bash
curl -X GET http://localhost:3000/me/bots/1/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Тикеты (me/tickets)

### Создать новый тикет
```bash
curl -X POST http://localhost:3000/me/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bot not working",
    "description": "My bot stopped responding",
    "botId": 1,
    "priority": "HIGH"
  }'
```

### Получить список всех тикетов
```bash
curl -X GET http://localhost:3000/me/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить информацию о тикете
```bash
curl -X GET http://localhost:3000/me/tickets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Обновить статус тикета
```bash
curl -X PATCH http://localhost:3000/me/tickets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### Удалить тикет
```bash
curl -X DELETE http://localhost:3000/me/tickets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Добавить сообщение в тикет
```bash
curl -X POST http://localhost:3000/me/tickets/1/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Additional information about the issue"
  }'
```

### Получить сообщения тикета
```bash
curl -X GET http://localhost:3000/me/tickets/1/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## CRM

### Создать контакт в CRM
```bash
curl -X POST http://localhost:3000/crm/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

### Создать CRM подключение
```bash
curl -X POST http://localhost:3000/crm/connections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "AMOCRM",
    "accessToken": "access_token_here",
    "refreshToken": "refresh_token_here",
    "domain": "your-domain.amocrm.ru"
  }'
```

### Получить все CRM подключения
```bash
curl -X GET http://localhost:3000/crm/connections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить CRM подключение по ID
```bash
curl -X GET http://localhost:3000/crm/connections/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Обновить CRM подключение
```bash
curl -X PUT http://localhost:3000/crm/connections/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "new_access_token",
    "isActive": true
  }'
```

### Удалить CRM подключение
```bash
curl -X DELETE http://localhost:3000/crm/connections/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Администрирование (admin)

### Создать промокод
```bash
curl -X POST http://localhost:3000/admin/promo-codes \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DISCOUNT20",
    "discountPercent": 20,
    "maxUses": 100,
    "expiresAt": "2024-12-31T23:59:59Z"
  }'
```

### Получить все промокоды
```bash
curl -X GET http://localhost:3000/admin/promo-codes \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Получить промокод по ID
```bash
curl -X GET http://localhost:3000/admin/promo-codes/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Обновить промокод
```bash
curl -X PATCH http://localhost:3000/admin/promo-codes/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discountPercent": 25,
    "maxUses": 200
  }'
```

### Удалить промокод
```bash
curl -X DELETE http://localhost:3000/admin/promo-codes/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Переключить статус промокода
```bash
curl -X PATCH http://localhost:3000/admin/promo-codes/1/toggle \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Проверить промокод
```bash
curl -X POST http://localhost:3000/admin/promo-codes/validate \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DISCOUNT20",
    "userId": 1
  }'
```

---

## Управление клиентами (admin/clients)

### Создать клиента
```bash
curl -X POST http://localhost:3000/admin/clients \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### Получить список всех клиентов
```bash
curl -X GET "http://localhost:3000/admin/clients?page=1&limit=10&search=jane" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Получить статистику дашборда
```bash
curl -X GET http://localhost:3000/admin/clients/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Получить клиента по ID
```bash
curl -X GET http://localhost:3000/admin/clients/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Получить активность пользователя
```bash
curl -X GET http://localhost:3000/admin/clients/1/activity \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Обновить клиента
```bash
curl -X PATCH http://localhost:3000/admin/clients/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Name",
    "isActive": true
  }'
```

### Удалить клиента
```bash
curl -X DELETE http://localhost:3000/admin/clients/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## TelegaPay

### Получить методы оплаты
```bash
curl -X POST http://localhost:3000/telegapay/get-methods \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "RUB"
  }'
```

### Получить реквизиты для оплаты
```bash
curl -X POST http://localhost:3000/telegapay/get-requisites \
  -H "Content-Type: application/json" \
  -d '{
    "method": "card",
    "amount": 100,
    "currency": "RUB",
    "order_id": "order_123",
    "user_id": "user_456"
  }'
```

### Проверить доступность метода оплаты
```bash
curl -X POST http://localhost:3000/telegapay/validate-payment-method \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "card",
    "amount": 100,
    "currency": "RUB"
  }'
```

### Создать ссылку на оплату
```bash
curl -X POST http://localhost:3000/telegapay/create-paylink \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "RUB",
    "order_id": "order_123",
    "description": "VPN subscription",
    "success_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel"
  }'
```

### Проверить статус платежа
```bash
curl -X POST http://localhost:3000/telegapay/check-status \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_123"
  }'
```

### Подтвердить платеж
```bash
curl -X POST http://localhost:3000/telegapay/confirm-payment \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "payment_external_id"
  }'
```

### Создать выплату
```bash
curl -X POST http://localhost:3000/telegapay/create-payout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "RUB",
    "method": "card",
    "order_id": "payout_123",
    "requisites": {
      "card_number": "1234567890123456"
    }
  }'
```

### Отменить платеж
```bash
curl -X POST http://localhost:3000/telegapay/cancel-payment \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_123"
  }'
```

### Отменить выплату
```bash
curl -X POST http://localhost:3000/telegapay/cancel-payout \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "payout_123"
  }'
```

### Отправить чек
```bash
curl -X POST http://localhost:3000/telegapay/send-receipt \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "trans_123",
    "email": "user@example.com"
  }'
```

---

## Swagger документация

После запуска приложения, полная документация API доступна по адресу:
```
http://localhost:3000/api
```

## Подробное описание параметров для ручек

### POST /auth/login

**Описание:** Вход пользователя в систему

**Headers:**
- `Content-Type: application/json` (обязательно)

**Body:**
| Поле     | Тип    | Обязательное | Описание            | Пример           |
| -------- | ------ | ------------ | ------------------- | ---------------- |
| email    | string | да           | Email пользователя  | user@example.com |
| password | string | да           | Пароль пользователя | password123      |

**Пример запроса:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Пример успешного ответа:**
```json
{
  "access_token": "jwt.token.here"
}
```
