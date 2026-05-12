import { DeleteTransactionUseCase } from '../src/application/use-cases/delete-transaction.use-case';
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
  getBalanceSummary: jest.fn(),
};

const makeUseCase = () => new DeleteTransactionUseCase(mockRepository);

const makeTransaction = () =>
  TransactionEntity.create({
    userId: 'user-1',
    type: 'EXPENSE',
    amount: Money.create(50, 'BRL'),
    description: 'Uber',
    date: new Date(),
  });

describe('DeleteTransactionUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('executa soft delete quando transação existe', async () => {
    mockRepository.findByIdAndUserId.mockResolvedValue(makeTransaction());
    mockRepository.softDelete.mockResolvedValue();

    const result = await makeUseCase().execute({ id: 'tx-1', userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.softDelete).toHaveBeenCalledWith('tx-1');
  });

  it('falha quando transação não existe ou pertence a outro usuário', async () => {
    mockRepository.findByIdAndUserId.mockResolvedValue(null);

    const result = await makeUseCase().execute({ id: 'tx-inexistente', userId: 'user-1' });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBe('Transação não encontrada');
    expect(mockRepository.softDelete).not.toHaveBeenCalled();
  });
});
