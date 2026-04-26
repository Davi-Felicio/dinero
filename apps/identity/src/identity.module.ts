import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './infrastructure/adapters/inbound/health.controller';
import { AuthController } from './infrastructure/adapters/inbound/auth.controller';
import { UserController } from './infrastructure/adapters/inbound/user.controller';
import { HealthCheckUseCase } from './application/use-cases/health-check.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { PrismaUserRepository } from './infrastructure/adapters/outbound/prisma-user.repository';
import { PrismaUserPreferenceRepository } from './infrastructure/adapters/outbound/prisma-user-preference.repository';
import { BcryptPasswordHasher } from './infrastructure/adapters/outbound/bcrypt-password-hasher';
import { JwtAuthGuard } from '@dinero/shared';
import { INJECTION_TOKENS } from './injection-tokens';

type JwtExpiresIn = number | `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

const parseJwtExpiresIn = (value: string | undefined): JwtExpiresIn => {
  if (!value) {
    return '7d';
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  if (/^\d+(ms|s|m|h|d|w|y)$/.test(value)) {
    return value as JwtExpiresIn;
  }

  return '7d';
};

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] ?? 'change_me_in_production',
      signOptions: { expiresIn: parseJwtExpiresIn(process.env['JWT_EXPIRES_IN']) },
    }),
  ],
  controllers: [HealthController, AuthController, UserController],
  providers: [
    HealthCheckUseCase,
    RegisterUserUseCase,
    LoginUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
    JwtAuthGuard,
    {
      provide: INJECTION_TOKENS.USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: INJECTION_TOKENS.USER_PREFERENCE_REPOSITORY,
      useClass: PrismaUserPreferenceRepository,
    },
    {
      provide: INJECTION_TOKENS.PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
  ],
})
export class IdentityModule {}
