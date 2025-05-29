import { Bot, Ticket, TicketMessage } from '@prisma/client';

export type TicketWithRelations = Ticket & {
    bot: Bot;
    messages: TicketMessage[];
};

export type TicketWithBot = Ticket & {
    bot: Bot;
};

export type TicketWithMessages = Ticket & {
    messages: TicketMessage[];
};

export type BotWithStats = Bot & {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    inProgressTickets: number;
    ticketsByDate: Record<string, number>;
};
