import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Subscription } from '@prisma/client';
import { nanoid } from 'nanoid';
import { RequestUser } from '../auth/interfaces/request.interface';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeBillingDto } from './dto/subscribe-billing.dto';
import { TelegaPayService } from './services/telega-pay.service';

@Injectable()
export class MeService {
    private readonly logger = new Logger(MeService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly telegaPayService: TelegaPayService,
    ) {}

    async subscribeBilling(user: RequestUser, subscribeDto: SubscribeBillingDto) {
        const bot = await this.prisma.bot.findFirst({
            where: {
                id: Number(subscribeDto.botId),
                userId: user.id,
            },
        });

        if (!bot) {
            throw new Error('Bot not found');
        }

        const { paymentLink, invoiceId, amount } = await this.telegaPayService.createInvoice(
            user.id,
            Number(subscribeDto.botId),
            subscribeDto.plan as any,
        );

        await this.prisma.subscription.create({
            data: {
                userId: user.id,
                botId: Number(subscribeDto.botId),
                plan: subscribeDto.plan as any,
                status: 'PENDING',
                amount,
                invoiceId,
            },
        });

        return { paymentLink };
    }

    async getBillingStatus(user: RequestUser) {
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!subscription) {
            return {
                status: 'NO_SUBSCRIPTION',
                plan: null,
            };
        }

        // Use the current subscription status as default
        let newStatus = subscription.status;
        
        // Check invoice status in TelegaPay if invoiceId exists
        if (subscription.invoiceId) {
          try {
            const status = await this.telegaPayService.checkInvoiceStatus(
              subscription.invoiceId
            );
            if (status?.status) {
              // Only update if the status is a valid SubscriptionStatus
              const validStatuses = [
                'PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED'
              ] as const;
              
              if (validStatuses.includes(status.status as any)) {
                newStatus = status.status as any;
              }
            }
          } catch (error) {
            console.error('Error checking invoice status:', error);
          }
        }

        // Update subscription status in the database if it has changed
        if (newStatus !== subscription.status) {
          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: newStatus },
          });
        }

        return {
            status: newStatus,
            plan: subscription.plan,
            expiresAt: subscription.periodEnd,
        };
    }

    async getBillingInfo(user: RequestUser) {
        const subscriptions = await this.prisma.subscription.findMany({
            where: {
                userId: user.id,
            },
            include: {
                bot: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return {
            subscriptions: subscriptions.map(
                (sub: Subscription & { bot: { id: number; name: string } }) => ({
                    id: sub.id,
                    plan: sub.plan,
                    status: sub.status,
                    amount: sub.amount,
                    createdAt: sub.createdAt,
                    expiresAt: sub.periodEnd,
                    bot: {
                        id: sub.bot.id,
                        name: sub.bot.name,
                    },
                }),
            ),
        };
    }

    async getReferrals(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                referrals: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                    },
                },
                referralStats: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            referrals: user.referrals || [],
            stats: user.referralStats,
        };
    }

    async getNewReferralLink(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Генерируем уникальный код для реферальной ссылки
        const code = nanoid(10);

        // Создаем новую реферальную ссылку
        const referralLink = await this.prisma.referralLink.create({
            data: {
                code,
                userId,
            },
        });

        // Формируем полную ссылку для регистрации
        const fullLink = `${process.env.FRONTEND_URL}/register?ref=${code}`;

        return {
            link: fullLink,
            code: referralLink.code,
        };
    }

    async getReferralBonuses(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                referralStats: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            totalBonus: user.referralStats?.totalBonus || 0,
            pendingBonus: user.referralStats?.pendingBonus || 0,
            lastBonusDate: user.referralStats?.lastBonusDate,
        };
    }

    async getReferralStats(userId: number) {
        const userStats = await this.prisma.referralStats.findUnique({
            where: { userId },
        });

        if (!userStats) {
            // Return default stats if no stats found yet
            return {
                userId,
                totalReferrals: 0,
                activeReferrals: 0,
                totalBonus: 0,
                pendingBonus: 0,
                lastBonusDate: null,
            };
        }

        return userStats;
    }

    async getReferralLinks(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                referralLinks: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user.referralLinks;
    }

    async updateReferralBonuses(userId: number, totalBonus?: number, pendingBonus?: number) {
        const updateData: any = {};
        if (totalBonus !== undefined) {
            updateData.totalBonus = totalBonus;
        }
        if (pendingBonus !== undefined) {
            updateData.pendingBonus = pendingBonus;
        }

        if (Object.keys(updateData).length === 0) {
            return this.prisma.referralStats.findUnique({ where: { userId } });
        }

        // Check if referral stats exist, create if not
        await this.prisma.referralStats.upsert({
            where: { userId },
            create: { userId, ...updateData },
            update: updateData,
        });

        return this.prisma.referralStats.findUnique({ where: { userId } });
    }

    async deleteReferralLink(linkId: number, userId: number) {
        const referralLink = await this.prisma.referralLink.findFirst({
            where: {
                id: linkId,
                userId: userId, // Ensure link belongs to the user
            },
        });

        if (!referralLink) {
            throw new NotFoundException('Referral link not found or does not belong to the user');
        }

        await this.prisma.referralLink.delete({
            where: { id: linkId },
        });

        return { success: true, message: 'Referral link deleted successfully' };
    }

    async trackReferralClick(code: string) {
        const referralLink = await this.prisma.referralLink.findUnique({
            where: { code },
        });

        if (!referralLink) {
            throw new NotFoundException('Referral link not found');
        }

        // Увеличиваем счетчик кликов
        await this.prisma.referralLink.update({
            where: { id: referralLink.id },
            data: {
                clicks: {
                    increment: 1,
                },
            },
        });

        return { success: true };
    }

    async processReferralRegistration(code: string, newUserId: number) {
        const referralLink = await this.prisma.referralLink.findUnique({
            where: { code },
            include: {
                user: {
                    include: {
                        referralStats: true,
                    },
                },
            },
        });

        if (!referralLink) {
            throw new NotFoundException('Referral link not found');
        }

        // Обновляем статистику реферальной ссылки
        await this.prisma.referralLink.update({
            where: { id: referralLink.id },
            data: {
                conversions: {
                    increment: 1,
                },
            },
        });

        // Обновляем статистику пользователя
        await this.prisma.referralStats.upsert({
            where: { userId: referralLink.userId },
            create: {
                userId: referralLink.userId,
                totalReferrals: 1,
                activeReferrals: 1,
                pendingBonus: 100, // Пример бонуса за реферала
            },
            update: {
                totalReferrals: {
                    increment: 1,
                },
                activeReferrals: {
                    increment: 1,
                },
                pendingBonus: {
                    increment: 100, // Пример бонуса за реферала
                },
            },
        });

        // Обновляем информацию о реферере для нового пользователя
        await this.prisma.user.update({
            where: { id: newUserId },
            data: {
                referredBy: referralLink.userId,
            },
        });

        return { success: true };
    }
}
