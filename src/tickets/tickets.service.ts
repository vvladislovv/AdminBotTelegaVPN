import { Injectable, NotFoundException } from '@nestjs/common';
import { Ticket, TicketMessage, TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TicketWithBot, TicketWithMessages, TicketWithRelations } from '../prisma/types';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
    constructor(
        private prisma: PrismaService,
        private rabbitMQService: RabbitMQService,
    ) {}

    async create(createTicketDto: CreateTicketDto, userId: number): Promise<TicketWithRelations> {
        const bot = await this.prisma.bot.findFirst({
            where: {
                id: createTicketDto.botId,
                userId: userId,
            },
        });

        if (!bot) {
            throw new NotFoundException('Бот не найден или не принадлежит вам');
        }

        const ticket = await this.prisma.ticket.create({
            data: {
                subject: createTicketDto.subject,
                message: createTicketDto.message,
                status: TicketStatus.OPEN,
                telegramId: createTicketDto.telegramId.toString(),
                botId: bot.id,
                userId: userId,
            },
            include: {
                bot: true,
                messages: true,
            },
        });

        this.rabbitMQService.publishMessage('bot_commands', {
            type: 'ticket_created',
            botId: bot.id,
            telegramId: parseInt(ticket.telegramId),
            message: `Создан новый тикет #${ticket.id}`,
        });

        return ticket;
    }

    async findAll(userId: number): Promise<TicketWithRelations[]> {
        return this.prisma.ticket.findMany({
            where: { userId },
            include: {
                bot: true,
                messages: true,
            },
        });
    }

    async findOne(id: number, userId: number): Promise<TicketWithRelations> {
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                bot: true,
                messages: true,
            },
        });

        if (!ticket) {
            throw new NotFoundException('Тикет не найден');
        }

        return ticket;
    }

    async update(id: number, updateTicketDto: UpdateTicketDto, userId: number): Promise<Ticket> {
        const ticket = (await this.prisma.ticket.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                bot: true,
            },
        })) as TicketWithBot;

        if (!ticket) {
            throw new NotFoundException('Тикет не найден');
        }

        const updatedTicket = await this.prisma.ticket.update({
            where: { id },
            data: updateTicketDto,
        });

        this.rabbitMQService.publishMessage('bot_commands', {
            type: 'ticket_updated',
            botId: ticket.bot.id,
            telegramId: parseInt(ticket.telegramId),
            message: `Статус тикета #${ticket.id} изменен на ${updateTicketDto.status}`,
        });

        return updatedTicket;
    }

    async remove(id: number, userId: number): Promise<{ message: string }> {
        const ticket = (await this.prisma.ticket.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                bot: true,
            },
        })) as TicketWithBot;

        if (!ticket) {
            throw new NotFoundException('Тикет не найден');
        }

        // Сначала удаляем все сообщения тикета
        await this.prisma.ticketMessage.deleteMany({
            where: { ticketId: id },
        });

        // Затем удаляем сам тикет
        await this.prisma.ticket.delete({
            where: { id },
        });

        this.rabbitMQService.publishMessage('bot_commands', {
            type: 'ticket_closed',
            botId: ticket.bot.id,
            telegramId: parseInt(ticket.telegramId),
            message: `Тикет #${ticket.id} закрыт`,
        });

        return { message: 'Тикет успешно удален' };
    }

    async addMessage(
        id: number,
        createTicketMessageDto: CreateTicketMessageDto,
        userId: number,
    ): Promise<TicketMessage> {
        const ticket = (await this.prisma.ticket.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                bot: true,
            },
        })) as TicketWithBot;

        if (!ticket) {
            throw new NotFoundException('Тикет не найден');
        }

        const message = await this.prisma.ticketMessage.create({
            data: {
                ticketId: id,
                message: createTicketMessageDto.message,
                isFromAdmin: true,
            },
        });

        this.rabbitMQService.publishMessage('bot_commands', {
            type: 'ticket_message',
            botId: ticket.bot.id,
            telegramId: parseInt(ticket.telegramId),
            message: `Ответ на тикет #${ticket.id}:\n\n${createTicketMessageDto.message}`,
        });

        return message;
    }

    async getMessages(id: number, userId: number): Promise<TicketMessage[]> {
        const ticket = (await this.prisma.ticket.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        })) as TicketWithMessages;

        if (!ticket) {
            throw new NotFoundException('Тикет не найден');
        }

        return ticket.messages;
    }
}
