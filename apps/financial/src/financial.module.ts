import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './infrastructure/adapters/inbound/health.controller';
import { PrismaTransactionRepository } from './infrastructure/adapters/outbound/prisma-transaction.repository';
import { INJECTION_TOKENS } from './injection-tokens';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [
    {
      provide: INJECTION_TOKENS.TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
  ],
})
export class FinancialModule {}
