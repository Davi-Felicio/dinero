import { UniqueEntityID } from '@dinero/shared';
import { GetUserPreferenceUseCase } from '../src/application/use-cases/get-user-preference.use-case';
import { IUserPreferenceRepository } from '../src/domain/repositories/user-preference.repository';
import { UserPreferenceEntity } from '../src/domain/entities/user-preference.entity';
import { Currency } from '../src/domain/value-objects/currency.vo';

const mockPrefRepo: jest.Mocked<IUserPreferenceRepository> = {
  save: jest.fn(),
  findByUserId: jest.fn(),
};

const makeUseCase = () => new GetUserPreferenceUseCase(mockPrefRepo);

const userId = 'a0000000-0000-0000-0000-000000000001';

describe('GetUserPreferenceUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna preferências existentes', async () => {
    const pref = UserPreferenceEntity.create(
      { userId, defaultCurrency: Currency.create('USD'), darkMode: false },
      new UniqueEntityID(),
    );
    mockPrefRepo.findByUserId.mockResolvedValue(pref);

    const result = await makeUseCase().execute({ userId });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ defaultCurrency: 'USD', darkMode: false });
  });

  it('retorna defaults (BRL, darkMode: true) quando preferência não existe', async () => {
    mockPrefRepo.findByUserId.mockResolvedValue(null);

    const result = await makeUseCase().execute({ userId });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ defaultCurrency: 'BRL', darkMode: true });
  });
});
