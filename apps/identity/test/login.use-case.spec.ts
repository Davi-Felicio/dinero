import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '../src/application/use-cases/login.use-case';
import { IUserRepository } from '../src/domain/repositories/user.repository';
import { IPasswordHasher } from '../src/domain/services/password-hasher.domain-service';
import { UserEntity } from '../src/domain/entities/user.entity';
import { Email } from '../src/domain/value-objects/email.vo';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  delete: jest.fn(),
};

const mockPasswordHasher: jest.Mocked<IPasswordHasher> = {
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
} as unknown as JwtService;

const makeUseCase = () =>
  new LoginUseCase(mockUserRepository, mockPasswordHasher, mockJwtService);

const makeUser = () =>
  UserEntity.create({
    name: 'João',
    email: Email.create('joao@example.com'),
    passwordHash: 'stored-hash',
  });

describe('LoginUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPasswordHasher.compare.mockResolvedValue(true);
    (mockJwtService.sign as jest.Mock).mockReturnValue('mock-token');
  });

  it('retorna token e dados do usuário com credenciais válidas', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(makeUser());

    const result = await makeUseCase().execute({
      email: 'joao@example.com',
      password: 'Senha123',
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.accessToken).toBe('mock-token');
    expect(dto.user.email).toBe('joao@example.com');
    expect(dto.user.name).toBe('João');
    expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
  });

  it('falha quando email não é encontrado', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await makeUseCase().execute({
      email: 'naoexiste@example.com',
      password: 'Senha123',
    });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBe('Invalid credentials');
    expect(mockJwtService.sign).not.toHaveBeenCalled();
  });

  it('falha quando senha está incorreta', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(makeUser());
    mockPasswordHasher.compare.mockResolvedValue(false);

    const result = await makeUseCase().execute({
      email: 'joao@example.com',
      password: 'SenhaErrada1',
    });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBe('Invalid credentials');
    expect(mockJwtService.sign).not.toHaveBeenCalled();
  });
});
