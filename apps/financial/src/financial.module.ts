import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './infrastructure/adapters/inbound/health.controller';
import { TransactionController } from './infrastructure/adapters/inbound/transaction.controller';
import { PrismaTransactionRepository } from './infrastructure/adapters/outbound/prisma-transaction.repository';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { ListTransactionsUseCase } from './application/use-cases/list-transactions.use-case';
import { GetTransactionByIdUseCase } from './application/use-cases/get-transaction-by-id.use-case';
import { UpdateTransactionUseCase } from './application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from './application/use-cases/delete-transaction.use-case';
import { INJECTION_TOKENS } from './injection-tokens';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController, TransactionController],
  providers: [
    {
      provide: INJECTION_TOKENS.TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
    CreateTransactionUseCase,
    ListTransactionsUseCase,
    GetTransactionByIdUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
  ],
})
export class FinancialModule {}
