import { ListTransactionsUseCase } from '../src/application/use-cases/list-transactions.use-case';
import { ITransactionRepository } from '../src/domain/repositories/transaction.repository';
import { TransactionEntity } from '../src/domain/entities/transaction.entity';
import { Money } from '../src/domain/value-objects/money.vo';

const mockRepository: jest.Mocked<ITransactionRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByIdAndUserId: jest.fn(),
  findAllByUserId: jest.fn(),
  countByUserId: jest.fn(),
  softDelete: jest.fn(),
};

const makeUseCase = () => new ListTransactionsUseCase(mockRepository);

const makeTransaction = () =>
  TransactionEntity.create({
    userId: 'user-1',
    type: 'EXPENSE',
    amount: Money.create(100, 'BRL'),
    description: 'Mercado',
    date: new Date(),
  });

describe('ListTransactionsUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna lista paginada corretamente', async () => {
    const transactions = [makeTransaction(), makeTransaction()];
    mockRepository.findAllByUserId.mockResolvedValue(transactions);
    mockRepository.countByUserId.mockResolvedValue(5);

    const result = await makeUseCase().execute({ userId: 'user-1', page: 1, limit: 2 });

    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.data).toHaveLength(2);
    expect(data.total).toBe(5);
    expect(data.totalPages).toBe(3);
    expect(data.page).toBe(1);
  });

  it('retorna lista vazia quando usuário não tem transações', async () => {
    mockRepository.findAllByUserId.mockResolvedValue([]);
    mockRepository.countByUserId.mockResolvedValue(0);

    const result = await makeUseCase().execute({ userId: 'user-sem-tx', page: 1, limit: 20 });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().data).toHaveLength(0);
    expect(result.getValue().totalPages).toBe(0);
  });
});
