import { DeleteAccountUseCase } from '../src/application/use-cases/delete-account.use-case';
import { IUserRepository } from '../src/domain/repositories/user.repository';
import { UserEntity } from '../src/domain/entities/user.entity';
import { Email } from '../src/domain/value-objects/email.vo';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  delete: jest.fn(),
};

const makeUseCase = () => new DeleteAccountUseCase(mockUserRepository);

const makeUser = () =>
  UserEntity.create({
    name: 'João',
    email: Email.create('joao@example.com'),
    passwordHash: 'hash',
  });

describe('DeleteAccountUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deleta a conta quando o usuário existe', async () => {
    const user = makeUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.delete.mockResolvedValue();

    const result = await makeUseCase().execute({ userId: user.id.toValue() });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ deleted: true });
    expect(mockUserRepository.delete).toHaveBeenCalledWith(user.id.toValue());
  });

  it('falha quando usuário não é encontrado', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const result = await makeUseCase().execute({ userId: 'inexistente' });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBe('User not found');
    expect(mockUserRepository.delete).not.toHaveBeenCalled();
  });
});
