import { UniqueEntityID } from '@dinero/shared';
import { UpdateCurrencyUseCase } from '../src/application/use-cases/update-currency.use-case';
import { IUserPreferenceRepository } from '../src/domain/repositories/user-preference.repository';
import { UserPreferenceEntity } from '../src/domain/entities/user-preference.entity';
import { Currency } from '../src/domain/value-objects/currency.vo';

const mockPrefRepo: jest.Mocked<IUserPreferenceRepository> = {
  save: jest.fn(),
  findByUserId: jest.fn(),
};

const makeUseCase = () => new UpdateCurrencyUseCase(mockPrefRepo);

const userId = 'a0000000-0000-0000-0000-000000000001';

const makeExistingPref = (code: 'BRL' | 'USD' | 'EUR' = 'BRL', darkMode = true) =>
  UserPreferenceEntity.create(
    { userId, defaultCurrency: Currency.create(code), darkMode },
    new UniqueEntityID(),
  );

describe('UpdateCurrencyUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('atualiza moeda de BRL para USD com sucesso', async () => {
    const pref = makeExistingPref('BRL', true);
    mockPrefRepo.findByUserId.mockResolvedValue(pref);
    mockPrefRepo.save.mockResolvedValue();

    const result = await makeUseCase().execute({ userId, currency: 'USD' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ defaultCurrency: 'USD', darkMode: true });
    expect(mockPrefRepo.save).toHaveBeenCalledTimes(1);
    expect(pref.defaultCurrency.code).toBe('USD');
  });

  it('atualiza moeda de BRL para EUR com sucesso', async () => {
    const pref = makeExistingPref('BRL', false);
    mockPrefRepo.findByUserId.mockResolvedValue(pref);
    mockPrefRepo.save.mockResolvedValue();

    const result = await makeUseCase().execute({ userId, currency: 'EUR' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ defaultCurrency: 'EUR', darkMode: false });
    expect(pref.defaultCurrency.code).toBe('EUR');
  });

  it('cria preferência quando não existe ainda (user antigo)', async () => {
    mockPrefRepo.findByUserId.mockResolvedValue(null);
    mockPrefRepo.save.mockResolvedValue();

    const result = await makeUseCase().execute({ userId, currency: 'usd' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ defaultCurrency: 'USD', darkMode: true });
    expect(mockPrefRepo.save).toHaveBeenCalledTimes(1);
    const savedPref = mockPrefRepo.save.mock.calls[0]![0];
    expect(savedPref.userId).toBe(userId);
    expect(savedPref.defaultCurrency.code).toBe('USD');
  });

  it('falha com moeda não suportada (XYZ)', async () => {
    const result = await makeUseCase().execute({ userId, currency: 'XYZ' });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toMatch(/Unsupported currency/);
    expect(mockPrefRepo.findByUserId).not.toHaveBeenCalled();
    expect(mockPrefRepo.save).not.toHaveBeenCalled();
  });

  it('falha com string vazia', async () => {
    const result = await makeUseCase().execute({ userId, currency: '' });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toMatch(/Unsupported currency/);
    expect(mockPrefRepo.save).not.toHaveBeenCalled();
  });
});
