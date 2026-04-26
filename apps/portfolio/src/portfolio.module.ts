import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './infrastructure/adapters/inbound/health.controller';
import { PortfolioController } from './infrastructure/adapters/inbound/portfolio.controller';
import { AssetController } from './infrastructure/adapters/inbound/asset.controller';
import { AddPortfolioAssetUseCase } from './application/use-cases/add-portfolio-asset.use-case';
import { GetPortfolioUseCase } from './application/use-cases/get-portfolio.use-case';
import { ListAssetsUseCase } from './application/use-cases/list-assets.use-case';
import { PrismaAssetRepository } from './infrastructure/adapters/outbound/prisma-asset.repository';
import { PrismaPortfolioAssetRepository } from './infrastructure/adapters/outbound/prisma-portfolio-asset.repository';
import { BrapiQuotationService } from './infrastructure/adapters/outbound/brapi-quotation.service';
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
  controllers: [HealthController, PortfolioController, AssetController],
  providers: [
    JwtAuthGuard,
    AddPortfolioAssetUseCase,
    GetPortfolioUseCase,
    ListAssetsUseCase,
    {
      provide: INJECTION_TOKENS.ASSET_REPOSITORY,
      useClass: PrismaAssetRepository,
    },
    {
      provide: INJECTION_TOKENS.PORTFOLIO_ASSET_REPOSITORY,
      useClass: PrismaPortfolioAssetRepository,
    },
    {
      provide: INJECTION_TOKENS.ASSET_QUOTATION_SERVICE,
      useClass: BrapiQuotationService,
    },
  ],
})
export class PortfolioModule {}
