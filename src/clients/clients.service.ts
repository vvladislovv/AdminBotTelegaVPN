import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { CrmConnectionsService } from '../crm/crm-connections.service';
import { CreateCrmConnectionDto } from '../crm/dto/create-crm-connection.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
    constructor(
        private readonly prisma: PrismaService,
        private crmConnectionsService: CrmConnectionsService,
    ) {}

    async create(registerUserDto: RegisterUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

        return this.prisma.user.create({
            data: {
                email: registerUserDto.email,
                password: hashedPassword,
                name: registerUserDto.name,
                role: 'USER', // Устанавливаем роль USER по умолчанию для созданных через админку
            },
        });
    }

    async findAll(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = search
            ? {
                  OR: [
                      { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
                      { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                  ],
              }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            tickets: true,
                            subscriptions: true,
                            bots: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findFirst({
            where: { id },
            include: {
                tickets: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                subscriptions: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                bots: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: number, updateClientDto: UpdateClientDto) {
        try {
            if (updateClientDto.password) {
                updateClientDto.password = await bcrypt.hash(updateClientDto.password, 10);
            }

            return await this.prisma.user.update({
                where: { id },
                data: updateClientDto,
            });
        } catch (error) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    async remove(id: number) {
        // Проверяем существование пользователя
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Удаляем связанные тикеты и их сообщения
        await this.prisma.ticketMessage.deleteMany({
            where: { ticket: { userId: id } },
        });
        await this.prisma.ticket.deleteMany({
            where: { userId: id },
        });

        // Удаляем связанные подписки
        await this.prisma.subscription.deleteMany({
            where: { userId: id },
        });

        // Удаляем связанные CRM записи (если есть)
        await this.prisma.crmUser.deleteMany({
            where: { bot: { userId: id } },
        });

        // Удаляем связанные боты
        await this.prisma.bot.deleteMany({
            where: { userId: id },
        });

        // Удаляем самого пользователя
        try {
            return await this.prisma.user.delete({
                where: { id },
            });
        } catch (error: any) {
            // This catch might be redundant if all relations are deleted, but kept for safety
            throw new Error(`Failed to delete user with ID ${id}: ${error.message}`);
        }
    }

    async getDashboardStats() {
        const [totalUsers, activeSubscriptions, totalTickets, recentUsers, recentTickets] =
            await Promise.all([
                this.prisma.user.count(),
                this.prisma.subscription.count({
                    where: {
                        periodEnd: { gt: new Date() },
                    },
                }),
                this.prisma.ticket.count(),
                this.prisma.user.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                    },
                }),
                this.prisma.ticket.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                }),
            ]);

        return {
            totalUsers,
            activeSubscriptions,
            totalTickets,
            recentUsers,
            recentTickets,
        };
    }

    async getUserActivity(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                tickets: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                },
                subscriptions: {
                    orderBy: { createdAt: 'desc' },
                },
                bots: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async createCrmConnection(clientId: number, dto: CreateCrmConnectionDto) {
        return this.crmConnectionsService.createConnection({
            ...dto,
            userId: clientId,
        });
    }
}
