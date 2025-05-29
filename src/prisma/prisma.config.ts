import { Prisma, PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type PrismaClientType = typeof prisma;

export type TicketWithRelations = Prisma.TicketGetPayload<{
    include: {
        bot: true;
        messages: true;
    };
}>;

export type TicketWithBot = Prisma.TicketGetPayload<{
    include: {
        bot: true;
    };
}>;

export type TicketWithMessages = Prisma.TicketGetPayload<{
    include: {
        messages: true;
    };
}>;
