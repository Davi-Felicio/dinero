import { GetBalanceSummaryUseCase } from '../src/application/use-cases/get-balance-summary.use-case';
import { ITransactionRepository } from '../src/domain/repositories/transaction.repository';

const mockRepository: jest.Mocked<ITransactionRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByIdAndUserId: jest.fn(),
  findAllByUserId: jest.fn(),
  countByUserId: jest.fn(),
  softDelete: jest.fn(),
  getBalanceSummary: jest.fn(),
};

const makeUseCase = () => new GetBalanceSummaryUseCase(mockRepository);

const userId = 'a0000000-0000-0000-0000-000000000001';

describe('GetBalanceSummaryUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna saldo consolidado com receitas e despesas em BRL', async () => {
    mockRepository.getBalanceSummary.mockResolvedValue({
      totalIncome: 3500,
      totalExpenses: 1200,
    });

    const result = await makeUseCase().execute({ userId });

    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.totalIncome).toBe(3500);
    expect(data.totalExpenses).toBe(1200);
    expect(data.balance).toBe(2300);
    expect(data.currency).toBe('BRL');
    expect(data.period.startDate).toBeNull();
    expect(data.period.endDate).toBeNull();
    expect(mockRepository.getBalanceSummary).toHaveBeenCalledWith(userId, undefined, undefined);
  });

  it('retorna zeros quando não há transações', async () => {
    mockRepository.getBalanceSummary.mockResolvedValue({
      totalIncome: 0,
      totalExpenses: 0,
    });

    const result = await makeUseCase().execute({ userId });

    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.totalIncome).toBe(0);
    expect(data.totalExpenses).toBe(0);
    expect(data.balance).toBe(0);
  });

  it('retorna saldo negativo quando despesas superam receitas', async () => {
    mockRepository.getBalanceSummary.mockResolvedValue({
      totalIncome: 500,
      totalExpenses: 1200,
    });

    const result = await makeUseCase().execute({ userId });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().balance).toBe(-700);
  });

  it('passa startDate e endDate como Date para o repositório', async () => {
    mockRepository.getBalanceSummary.mockResolvedValue({
      totalIncome: 1000,
      totalExpenses: 400,
    });

    const result = await makeUseCase().execute({
      userId,
      startDate: '2026-01-01',
      endDate: '2026-05-31',
    });

    expect(result.isSuccess).toBe(true);
    const [, start, end] = mockRepository.getBalanceSummary.mock.calls[0]!;
    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(result.getValue().period).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-05-31',
    });
  });

  it('falha quando startDate é posterior a endDate', async () => {
    const result = await makeUseCase().execute({
      userId,
      startDate: '2026-12-31',
      endDate: '2026-01-01',
    });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toMatch(/data de início/i);
    expect(mockRepository.getBalanceSummary).not.toHaveBeenCalled();
  });

  it('falha com startDate inválida', async () => {
    const result = await makeUseCase().execute({ userId, startDate: 'data-invalida' });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toMatch(/início inválida/i);
    expect(mockRepository.getBalanceSummary).not.toHaveBeenCalled();
  });
});
