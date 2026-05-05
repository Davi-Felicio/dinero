import { GetProfileUseCase } from '../src/application/use-cases/get-profile.use-case';
import { IUserRepository } from '../src/domain/repositories/user.repository';
import { UserEntity } from '../src/domain/entities/user.entity';
import { Email } from '../src/domain/value-objects/email.vo';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  delete: jest.fn(),
};

const makeUseCase = () => new GetProfileUseCase(mockUserRepository);

const makeUser = () =>
  UserEntity.create({
    name: 'João',
    email: Email.create('joao@example.com'),
    passwordHash: 'hash',
    phone: '11999999999',
    location: 'Toledo',
  });

describe('GetProfileUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna o perfil quando o usuário existe', async () => {
    const user = makeUser();
    mockUserRepository.findById.mockResolvedValue(user);

    const result = await makeUseCase().execute({ userId: user.id.toValue() });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.id).toBe(user.id.toValue());
    expect(dto.email).toBe('joao@example.com');
    expect(dto.name).toBe('João');
    expect(dto.phone).toBe('11999999999');
    expect(dto.location).toBe('Toledo');
    expect(dto.createdAt).toBeDefined();
  });

  it('falha quando o usuário não é encontrado', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const result = await makeUseCase().execute({ userId: 'inexistente' });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBe('User not found');
  });
});
