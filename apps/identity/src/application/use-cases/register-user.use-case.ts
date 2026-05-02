import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { IPasswordHasher } from '../../domain/services/password-hasher.domain-service';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
  location?: string;
}

export interface RegisterUserOutput {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class RegisterUserUseCase implements IUseCase<RegisterUserInput, RegisterUserOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(INJECTION_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<Result<RegisterUserOutput>> {
    const passwordValidation = Password.validate(input.password);
    if (passwordValidation.isFailure()) {
      return Result.fail(passwordValidation.error as string);
    }

    const existing = await this.userRepository.findByEmail(input.email.toLowerCase());
    if (existing) {
      return Result.fail('Email already in use');
    }

    const email = Email.create(input.email);
    const passwordHash = await this.passwordHasher.hash(passwordValidation.getValue());

    const user = UserEntity.create({
      name: input.name,
      email,
      passwordHash,
      phone: input.phone,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      location: input.location,
    });

    await this.userRepository.save(user);

    return Result.ok({
      id: user.id.toValue(),
      name: user.name,
      email: user.email.value,
    });
  }
}
