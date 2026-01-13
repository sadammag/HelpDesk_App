export function normalizeTicketDates<
  T extends {
    createdAt?: any;
    updatedAt?: any;
    logs?: { createdAt?: any }[];
  },
>(tickets: T[]): T[] {
  return tickets.map((ticket) => ({
    ...ticket,
    createdAt: ticket.createdAt ? new Date(ticket.createdAt) : ticket.createdAt,
    updatedAt: ticket.updatedAt ? new Date(ticket.updatedAt) : ticket.updatedAt,
    logs: ticket.logs?.map((log) => ({
      ...log,
      createdAt: log.createdAt ? new Date(log.createdAt) : log.createdAt,
    })),
  }));
}
