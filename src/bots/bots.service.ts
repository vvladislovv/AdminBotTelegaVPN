import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
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

        const bot = await this.prisma.bot.create({
            data: {
                ...createBotDto,
                userId,
            },
        });

        await this.rabbitMQService.publishMessage('bot_commands', {
            type: 'init',
            botId: bot.id,
            token: bot.token,
            username: bot.username,
        });

        return bot;
    }

    async findAll(userId: number) {
        return this.prisma.bot.findMany({
            where: { userId },
        });
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
                    OR: [{ token: updateBotDto.token }, { username: updateBotDto.username }],
                    NOT: { id },
                },
            });

            if (existingBot) {
                throw new ConflictException('Бот с таким токеном или username уже существует');
            }
        }

        const updatedBot = await this.prisma.bot.update({
            where: { id },
            data: updateBotDto,
        });

        if (updateBotDto.token || updateBotDto.username) {
            await this.rabbitMQService.publishMessage('bot_commands', {
                type: 'update',
                botId: bot.id,
                token: updateBotDto.token || bot.token,
                username: updateBotDto.username || bot.username,
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
