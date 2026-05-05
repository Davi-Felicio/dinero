import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './infrastructure/adapters/inbound/health.controller';
import { TransactionController } from './infrastructure/adapters/inbound/transaction.controller';
import { CardController } from './infrastructure/adapters/inbound/card.controller';
import { CategoryController } from './infrastructure/adapters/inbound/category.controller';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { ListTransactionsUseCase } from './application/use-cases/list-transactions.use-case';
import { GetTransactionByIdUseCase } from './application/use-cases/get-transaction-by-id.use-case';
import { UpdateTransactionUseCase } from './application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from './application/use-cases/delete-transaction.use-case';
import { CreateCardUseCase } from './application/use-cases/create-card.use-case';
import { ListCardsUseCase } from './application/use-cases/list-cards.use-case';
import { GetCardUseCase } from './application/use-cases/get-card.use-case';
import { UpdateCardUseCase } from './application/use-cases/update-card.use-case';
import { DeleteCardUseCase } from './application/use-cases/delete-card.use-case';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { PrismaTransactionRepository } from './infrastructure/adapters/outbound/prisma-transaction.repository';
import { PrismaCardRepository } from './infrastructure/adapters/outbound/prisma-card.repository';
import { PrismaCategoryRepository } from './infrastructure/adapters/outbound/prisma-category.repository';
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
  controllers: [HealthController, TransactionController, CardController, CategoryController],
  providers: [
    JwtAuthGuard,
    CreateTransactionUseCase,
    ListTransactionsUseCase,
    GetTransactionByIdUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
    CreateCardUseCase,
    ListCardsUseCase,
    GetCardUseCase,
    UpdateCardUseCase,
    DeleteCardUseCase,
    CreateCategoryUseCase,
    ListCategoriesUseCase,
    {
      provide: INJECTION_TOKENS.TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
    {
      provide: INJECTION_TOKENS.CARD_REPOSITORY,
      useClass: PrismaCardRepository,
    },
    {
      provide: INJECTION_TOKENS.CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
  ],
})
export class FinancialModule {}
