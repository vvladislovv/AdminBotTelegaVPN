import { Injectable, Logger } from '@nestjs/common';
import { Subscription } from '@prisma/client';
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

        // Проверяем статус счета в TelegaPay
        const invoiceStatus = await this.telegaPayService.checkInvoiceStatus(
            subscription.invoiceId,
        );

        // Обновляем статус подписки в базе данных
        if (invoiceStatus.status !== subscription.status) {
            await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: invoiceStatus.status },
            });
        }

        return {
            status: invoiceStatus.status,
            plan: subscription.plan,
            expiresAt: subscription.expiresAt,
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
                    expiresAt: sub.expiresAt,
                    bot: {
                        id: sub.bot.id,
                        name: sub.bot.name,
                    },
                }),
            ),
        };
    }
}
