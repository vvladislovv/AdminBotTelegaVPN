FROM node:20-alpine

# Установка OpenSSL для Prisma
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run prisma:generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 