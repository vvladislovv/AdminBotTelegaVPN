import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { EncryptionService } from '../encryption/encryption.service';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';

interface TicketWithStatus {
    status: TicketStatus;
    createdAt: Date;
}

@Injectable()
export class BotsService {
    constructor(
        private prisma: PrismaService,
        private rabbitMQService: RabbitMQService,
        private encryptionService: EncryptionService,
    ) {}

    async create(createBotDto: CreateBotDto, userId: number) {
        const existingBot = await this.prisma.bot.findFirst({
            where: {
                OR: [{ token: createBotDto.token }, { username: createBotDto.username }],
            },
        });

        if (existingBot) {
            throw new ConflictException('Бот с таким токеном или username уже существует');
        }

        const encryptedToken = this.encryptionService.encrypt(createBotDto.token);

        const bot = await this.prisma.bot.create({
            data: {
                ...createBotDto,
                token: encryptedToken,
                userId,
                link: `https://t.me/${createBotDto.username.substring(1)}`,
            },
        });

        await this.rabbitMQService.publishMessage('bot_commands', {
            type: 'init',
            botId: bot.id,
            token: this.encryptionService.decrypt(bot.token),
            username: bot.username.substring(1),
        });

        return bot;
    }

    async findAll(userId: number) {
        const bots = await this.prisma.bot.findMany({
            where: { userId },
        });

        return bots;
    }

    async findOne(id: number, userId: number) {
        const bot = await this.prisma.bot.findFirst({
            where: { id, userId },
        });

        if (!bot) {
            throw new NotFoundException('Бот не найден');
        }

        return bot;
    }

    async update(id: number, updateBotDto: UpdateBotDto, userId: number) {
        const bot = await this.findOne(id, userId);

        if (updateBotDto.token || updateBotDto.username) {
            const existingBot = await this.prisma.bot.findFirst({
                where: {
                    OR: [
                        {
                            token: updateBotDto.token
                                ? this.encryptionService.encrypt(updateBotDto.token)
                                : undefined,
                        },
                        { username: updateBotDto.username },
                    ],
                    NOT: { id },
                },
            });

            if (existingBot) {
                throw new ConflictException('Бот с таким токеном или username уже существует');
            }
        }

        const dataToUpdate: any = { ...updateBotDto };
        if (updateBotDto.token) {
            dataToUpdate.token = this.encryptionService.encrypt(updateBotDto.token);
        }
        if (updateBotDto.username) {
            dataToUpdate.link = `https://t.me/${updateBotDto.username.substring(1)}`;
        }

        const updatedBot = await this.prisma.bot.update({
            where: { id },
            data: dataToUpdate,
        });

        if (updateBotDto.token || updateBotDto.username) {
            await this.rabbitMQService.publishMessage('bot_commands', {
                type: 'update',
                botId: bot.id,
                token: updateBotDto.token
                    ? this.encryptionService.decrypt(updatedBot.token)
                    : this.encryptionService.decrypt(bot.token),
                username: updateBotDto.username
                    ? updateBotDto.username.substring(1)
                    : bot.username.substring(1),
            });
        }

        return updatedBot;
    }

    async remove(id: number, userId: number) {
        const bot = await this.findOne(id, userId);

        await this.prisma.bot.delete({
            where: { id },
        });

        await this.rabbitMQService.publishMessage('bot_commands', {
            type: 'stop',
            botId: bot.id,
        });

        return { message: 'Бот успешно удален' };
    }

    async getStats(id: number, userId: number) {
        const bot = await this.findOne(id, userId);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const tickets = await this.prisma.ticket.findMany({
            where: {
                botId: id,
                createdAt: {
                    gte: thirtyDaysAgo,
                },
            },
            select: {
                status: true,
                createdAt: true,
            },
        });

        const stats = {
            totalTickets: tickets.length,
            openTickets: tickets.filter((t: TicketWithStatus) => t.status === 'OPEN').length,
            inProgressTickets: tickets.filter((t: TicketWithStatus) => t.status === 'IN_PROGRESS')
                .length,
            waitingTickets: tickets.filter((t: TicketWithStatus) => t.status === 'WAITING').length,
            closedTickets: tickets.filter((t: TicketWithStatus) => t.status === 'CLOSED').length,
            ticketsByDay: tickets.reduce(
                (acc: Record<string, number>, ticket: TicketWithStatus) => {
                    const date = ticket.createdAt.toISOString().split('T')[0];
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>,
            ),
        };

        return stats;
    }
}
