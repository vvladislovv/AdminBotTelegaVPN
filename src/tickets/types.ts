import { Prisma } from '@prisma/client';

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
