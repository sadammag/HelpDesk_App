import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TicketsService } from './tickets.service';

vi.mock('./tickets.entity', () => ({
  Ticket: class {},
  TicketStatus: {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
  },
}));


vi.mock('src/useres/user.entity', () => ({
  User: class {},
}));


export enum TicketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}
// Мок-тип Ticket
type TicketMock = {
  id?: string;
  title: string;
  description: string;
  status: TicketStatus;
  user: UserMock;
  message?: string
};

// Мок-тип User
type UserMock = {
  id: string;
  name: string;
  email: string;
  password: string;
  tickets: TicketMock[];
};


//  --------- НАЧАЛО СОЗДАНИЯ ТЕСТА ---------

describe('TicketsService', () => {
  let service: TicketsService;

  // Создается объект через ticketsRepository.create
  // Сохраняется этот объект в ticketsRepository.save
  let ticketsRepository: Partial<{
    create: (ticket: TicketMock) => TicketMock;
    save: (ticket: TicketMock) => Promise<TicketMock>;
  }>;

  // Создается объект log
  let ticketLogsService: Partial<{
    createLog: (
      ticketId: string,
      userId: string,
      message: string,
    ) => Promise<void>;

    getLogsByTicket: (ticketId: string) => Promise<{ message: string }[]>;
  }>;

  // Условный кеш менеджер
  let cacheManager: any;


  // Функция выставляется перед каждым тестом

  // Нужна чтобы:
  // чтобы каждый тест начинался с чистого состояния
  // чтобы моки не “протекали” между тестами
  // чтобы можно было писать несколько it(...), не боясь, что они повлияют друг на друга
  beforeEach(() => {

    // СУТЬ => тест логки без базы данных, MongoDB и кеша.
    // ДЛЯ ИМИТАЦИИ ПОВЕДЕНИЯ РЕАЛЬНОГО РЕПОЗИТИОРИЯ
    ticketsRepository = {
      // принимает данные и возращает объект сущности 
      // (тут верни то, что передали)
      create: vi.fn((ticket: TicketMock) => ticket), 

      // сохранения в БД и возращаем ответ с id
      save: vi.fn(async (ticket: TicketMock) => ({ 
        ...ticket,
        id: 'ticket123',
      })),
    }; 


    ticketLogsService = {
      // создание лога в mongoDB
      createLog: vi.fn(async () => {}),

      // получения всех логов по билету
      getLogsByTicket: vi.fn(async () => [{ message: 'log1' }]),
    };

    cacheManager = {
      get: vi.fn(),
      set: vi.fn(),
      store: { keys: vi.fn(async () => []) },
      del: vi.fn(),
    };

    // создан инстанс СЕРВИСА
    service = new TicketsService(  
      ticketsRepository as any,   // заменяем внешенюю зависимость typeORM
      ticketLogsService as any,   // заменяем внешенюю зависимость mongoDB
      cacheManager as any,
    );
  });

  // это один тестовый сценарий
  it('Он должен создать билет с логами', async () => {

    const user: UserMock = { // Фековый пользователь
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      tickets: [],
    };

    const ticketInput: TicketMock = { // Данные для создание билета (от клиента)
      title: 'Test Ticket',
      description: 'Description here',
      status: TicketStatus.OPEN,
      user,
      message: 'Initial log message'
    };

    // когда я вызываю "createTicket" c такими аргументами, что произодйдет
    const result = await service.createTicket(
      ticketInput.title,
      ticketInput.description,
      ticketInput.status,
      user as unknown as any,
      ticketInput.message,
    );

    // 1)  
    // ПРОВЕРКА => сеовис формирует билет правильно:

      // ✔️ функция была вызвана
      // ✔️ аргументы совпадают
      // ❌ если не была вызвана → тест упадёт
      // ❌ если аргументы другие → тест упадёт
    expect(ticketsRepository.create).toHaveBeenCalledWith({      // была функция вызвана хоть 1 раз          
                                        title: 'Test Ticket',    // и совпадают ли аргументы
                                        description: 'Description here',
                                        status: TicketStatus.OPEN,
                                        user,
                                     });

    // 2)
    // ПРОВЕРКА => что билет сохраняяется"
    // ЧТО ФУНКЦИЯ БЫЛА ВЫЗВАНА 1 раз
    expect(ticketsRepository.save).toHaveBeenCalled();

    // 3)
    // ПРОВЕРКА => что создается log
    expect(ticketLogsService.createLog).toHaveBeenCalledWith(
      'ticket123',
      'user123',
      'Initial log message',
    );

    // ПРОВЕРКА => что сервис запрашивает log (сервис не забывает его)
    expect(ticketLogsService.getLogsByTicket).toHaveBeenCalledWith('ticket123');


    // ПРОВЕРКА => что методы возращают корректный результат
    expect(result).toEqual({
      id: 'ticket123',
      title: 'Test Ticket',
      description: 'Description here',
      status: TicketStatus.OPEN,
      user,
      logs: [{ message: 'log1' }],
    });
  });
});
