import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './infrastructure/adapters/inbound/health.controller';
import { HealthCheckUseCase } from './application/use-cases/health-check.use-case';
import { PrismaUserRepository } from './infrastructure/adapters/outbound/prisma-user.repository';
import { INJECTION_TOKENS } from './injection-tokens';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [
    HealthCheckUseCase,
    {
      provide: INJECTION_TOKENS.USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class IdentityModule {}
