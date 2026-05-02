import { CreateTransactionUseCase } from '../src/application/use-cases/create-transaction.use-case';
import { ITransactionRepository } from '../src/domain/repositories/transaction.repository';
import { CreateTransactionDto } from '../src/application/dtos/create-transaction.dto';

const mockRepository: jest.Mocked<ITransactionRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByIdAndUserId: jest.fn(),
  findAllByUserId: jest.fn(),
  countByUserId: jest.fn(),
  softDelete: jest.fn(),
};

const makeUseCase = () => new CreateTransactionUseCase(mockRepository);

const validDto: CreateTransactionDto = {
  userId: 'a0000000-0000-0000-0000-000000000001',
  type: 'EXPENSE',
  amount: 150.5,
  currency: 'BRL',
  description: 'Almoço',
  date: '2026-04-28T12:00:00.000Z',
};

describe('CreateTransactionUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria e salva transação válida', async () => {
    mockRepository.save.mockResolvedValue();
    const result = await makeUseCase().execute(validDto);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    const dto = result.getValue();
    expect(dto.type).toBe('EXPENSE');
    expect(dto.amount).toBe(150.5);
    expect(dto.currency).toBe('BRL');
    expect(dto.syncStatus).toBe('MANUAL');
  });

  it('falha com valor zero', async () => {
    const result = await makeUseCase().execute({ ...validDto, amount: 0 });
    expect(result.isSuccess).toBe(false);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('falha com descrição vazia', async () => {
    const result = await makeUseCase().execute({ ...validDto, description: '' });
    expect(result.isSuccess).toBe(false);
  });

  it('usa BRL como moeda padrão quando currency não informada', async () => {
    mockRepository.save.mockResolvedValue();
    const { currency, ...dtoSemCurrency } = validDto;
    const result = await makeUseCase().execute(dtoSemCurrency as CreateTransactionDto);
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().currency).toBe('BRL');
  });
});
