import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './infrastructure/adapters/inbound/health.controller';
import { MarketAssetsController } from './infrastructure/adapters/inbound/market-assets.controller';
import { PortfolioController } from './infrastructure/adapters/inbound/portfolio.controller';
import { PrismaAssetRepository } from './infrastructure/adapters/outbound/prisma-asset.repository';
import { PrismaPortfolioAssetRepository } from './infrastructure/adapters/outbound/prisma-portfolio-asset.repository';
import { PrismaPortfolioTransactionRepository } from './infrastructure/adapters/outbound/prisma-portfolio-transaction.repository';
import { BrapiAssetQuotationService } from './infrastructure/adapters/outbound/brapi-asset-quotation.service';
import { SearchAssetsUseCase } from './application/use-cases/search-assets.use-case';
import { GetAssetQuoteUseCase } from './application/use-cases/get-asset-quote.use-case';
import { CreatePortfolioTransactionUseCase } from './application/use-cases/create-portfolio-transaction.use-case';
import { GetPortfolioSummaryUseCase } from './application/use-cases/get-portfolio-summary.use-case';
import { ListPortfolioTransactionsUseCase } from './application/use-cases/list-portfolio-transactions.use-case';
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
  controllers: [HealthController, MarketAssetsController, PortfolioController],
  providers: [
    JwtAuthGuard,
    SearchAssetsUseCase,
    GetAssetQuoteUseCase,
    CreatePortfolioTransactionUseCase,
    GetPortfolioSummaryUseCase,
    ListPortfolioTransactionsUseCase,
    {
      provide: INJECTION_TOKENS.ASSET_REPOSITORY,
      useClass: PrismaAssetRepository,
    },
    {
      provide: INJECTION_TOKENS.PORTFOLIO_ASSET_REPOSITORY,
      useClass: PrismaPortfolioAssetRepository,
    },
    {
      provide: INJECTION_TOKENS.PORTFOLIO_TRANSACTION_REPOSITORY,
      useClass: PrismaPortfolioTransactionRepository,
    },
    {
      provide: INJECTION_TOKENS.ASSET_QUOTATION_SERVICE,
      useClass: BrapiAssetQuotationService,
    },
  ],
})
export class PortfolioModule {}
