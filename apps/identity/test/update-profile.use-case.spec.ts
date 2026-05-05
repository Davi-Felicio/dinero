import { UpdateProfileUseCase } from '../src/application/use-cases/update-profile.use-case';
import { IUserRepository } from '../src/domain/repositories/user.repository';
import { UserEntity } from '../src/domain/entities/user.entity';
import { Email } from '../src/domain/value-objects/email.vo';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  delete: jest.fn(),
};

const makeUseCase = () => new UpdateProfileUseCase(mockUserRepository);

const makeUser = () =>
  UserEntity.create({
    name: 'João Silva',
    email: Email.create('joao@example.com'),
    passwordHash: 'hash',
    phone: '11999999999',
    location: 'Toledo',
  });

describe('UpdateProfileUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('atualiza o perfil com dados parciais (apenas nome)', async () => {
    const user = makeUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.save.mockResolvedValue();

    const result = await makeUseCase().execute({
      userId: user.id.toValue(),
      name: 'João Atualizado',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().name).toBe('João Atualizado');
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
  });

  it('atualiza todos os campos', async () => {
    const user = makeUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.save.mockResolvedValue();

    const result = await makeUseCase().execute({
      userId: user.id.toValue(),
      name: 'Novo Nome',
      phone: '11888888888',
      birthDate: '1990-01-01T00:00:00.000Z',
      location: 'Cascavel',
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.name).toBe('Novo Nome');
    expect(dto.phone).toBe('11888888888');
    expect(dto.location).toBe('Cascavel');
    expect(dto.birthDate).toBeDefined();
  });

  it('falha quando usuário não é encontrado', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const result = await makeUseCase().execute({
      userId: 'inexistente',
      name: 'Novo Nome',
    });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBe('User not found');
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('falha quando nome tem menos de 2 caracteres', async () => {
    const user = makeUser();
    mockUserRepository.findById.mockResolvedValue(user);

    await expect(
      makeUseCase().execute({ userId: user.id.toValue(), name: 'A' }),
    ).rejects.toThrow('Name must have at least 2 characters');
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});
