import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './infrastructure/adapters/inbound/health.controller';
import { BankConnectionController } from './infrastructure/adapters/inbound/bank-connection.controller';
import { CreateBankConnectionUseCase } from './application/use-cases/create-bank-connection.use-case';
import { ListBankConnectionsUseCase } from './application/use-cases/list-bank-connections.use-case';
import { RevokeBankConnectionUseCase } from './application/use-cases/revoke-bank-connection.use-case';
import { PrismaBankConnectionRepository } from './infrastructure/adapters/outbound/prisma-bank-connection.repository';
import { PrismaSyncEventRepository } from './infrastructure/adapters/outbound/prisma-sync-event.repository';
import { JwtAuthGuard } from '@dinero/shared';
import { INJECTION_TOKENS } from './injection-tokens';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] ?? 'change_me_in_production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [HealthController, BankConnectionController],
  providers: [
    JwtAuthGuard,
    CreateBankConnectionUseCase,
    ListBankConnectionsUseCase,
    RevokeBankConnectionUseCase,
    {
      provide: INJECTION_TOKENS.BANK_CONNECTION_REPOSITORY,
      useClass: PrismaBankConnectionRepository,
    },
    {
      provide: INJECTION_TOKENS.SYNC_EVENT_REPOSITORY,
      useClass: PrismaSyncEventRepository,
    },
  ],
})
export class OpenfinanceModule {}
