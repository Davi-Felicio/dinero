import {
  RegisterUserUseCase,
  RegisterUserInput,
} from '../src/application/use-cases/register-user.use-case';
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
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
};

const makeUseCase = () =>
  new RegisterUserUseCase(mockUserRepository, mockPasswordHasher);

const validInput: RegisterUserInput = {
  name: 'João Silva',
  email: 'joao@example.com',
  password: 'Senha123',
};

describe('RegisterUserUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPasswordHasher.hash.mockResolvedValue('hashed-password');
  });

  it('registra usuário com dados válidos', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockResolvedValue();

    const result = await makeUseCase().execute(validInput);

    expect(result.isSuccess).toBe(true);
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('Senha123');
    const dto = result.getValue();
    expect(dto.name).toBe('João Silva');
    expect(dto.email).toBe('joao@example.com');
    expect(dto.id).toBeDefined();
  });

  it('falha quando email já está cadastrado', async () => {
    const existing = UserEntity.create({
      name: 'Outro',
      email: Email.create('joao@example.com'),
      passwordHash: 'hash',
    });
    mockUserRepository.findByEmail.mockResolvedValue(existing);

    const result = await makeUseCase().execute(validInput);

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBe('Email already in use');
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('falha quando nome tem menos de 2 caracteres', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      makeUseCase().execute({ ...validInput, name: 'A' }),
    ).rejects.toThrow('Name must have at least 2 characters');
  });

  it('falha quando email é inválido', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      makeUseCase().execute({ ...validInput, email: 'not-an-email' }),
    ).rejects.toThrow(/Invalid email/);
  });

  it('falha quando senha não atende RF004 (sem maiúscula)', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await makeUseCase().execute({ ...validInput, password: 'senha123' });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toMatch(/uppercase letter/);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('falha quando senha não atende RF004 (sem número)', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await makeUseCase().execute({ ...validInput, password: 'SenhaSemNum' });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toMatch(/number/);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('aceita campos opcionais como undefined', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockResolvedValue();

    const result = await makeUseCase().execute({
      ...validInput,
      phone: undefined,
      birthDate: undefined,
      location: undefined,
    });

    expect(result.isSuccess).toBe(true);
  });
});
