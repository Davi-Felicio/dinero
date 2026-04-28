import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IAssetRepository } from '../../domain/repositories/asset.repository';
import { IPortfolioAssetRepository } from '../../domain/repositories/portfolio-asset.repository';
import { PortfolioAssetEntity } from '../../domain/entities/portfolio-asset.entity';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface AddPortfolioAssetInput {
  userId: string;
  ticker: string;
  quantity: number;
  averagePrice: number;
}

@Injectable()
export class AddPortfolioAssetUseCase implements IUseCase<AddPortfolioAssetInput, any> {
  constructor(
    @Inject(INJECTION_TOKENS.ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
    @Inject(INJECTION_TOKENS.PORTFOLIO_ASSET_REPOSITORY)
    private readonly portfolioAssetRepository: IPortfolioAssetRepository,
  ) {}

  async execute(input: AddPortfolioAssetInput): Promise<Result<any>> {
    const asset = await this.assetRepository.findByTicker(input.ticker.toUpperCase());
    if (!asset) {
      return Result.fail(`Asset ${input.ticker.toUpperCase()} not found`);
    }

    const existing = await this.portfolioAssetRepository.findByUserAndAsset(
      input.userId,
      asset.id.toValue(),
    );

    if (existing) {
      existing.addPosition(input.quantity, input.averagePrice);
      await this.portfolioAssetRepository.save(existing);
      return Result.ok({
        id: existing.id.toValue(),
        assetId: existing.assetId,
        ticker: asset.ticker,
        name: asset.name,
        type: asset.type,
        quantity: existing.quantity,
        averagePrice: existing.averagePrice,
        totalCost: existing.totalCost,
      });
    }

    const portfolioAsset = PortfolioAssetEntity.create({
      userId: input.userId,
      assetId: asset.id.toValue(),
      quantity: input.quantity,
      averagePrice: input.averagePrice,
    });

    await this.portfolioAssetRepository.save(portfolioAsset);

    return Result.ok({
      id: portfolioAsset.id.toValue(),
      assetId: portfolioAsset.assetId,
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      quantity: portfolioAsset.quantity,
      averagePrice: portfolioAsset.averagePrice,
      totalCost: portfolioAsset.totalCost,
    });
  }
}
