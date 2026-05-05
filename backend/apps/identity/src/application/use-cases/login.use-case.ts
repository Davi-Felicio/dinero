import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUseCase, Result } from '@dinero/shared';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IPasswordHasher } from '../../domain/services/password-hasher.domain-service';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  user: { id: string; name: string; email: string };
}

@Injectable()
export class LoginUseCase implements IUseCase<LoginInput, LoginOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(INJECTION_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<Result<LoginOutput>> {
    const user = await this.userRepository.findByEmail(input.email.toLowerCase());
    if (!user) {
      return Result.fail('Invalid credentials');
    }

    const valid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!valid) {
      return Result.fail('Invalid credentials');
    }

    const payload = { sub: user.id.toValue(), email: user.email.value };
    const accessToken = this.jwtService.sign(payload);

    return Result.ok({
      accessToken,
      user: { id: user.id.toValue(), name: user.name, email: user.email.value },
    });
  }
}
