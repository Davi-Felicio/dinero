import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IPortfolioAssetRepository } from '../../domain/repositories/portfolio-asset.repository';
import { IAssetRepository } from '../../domain/repositories/asset.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface GetPortfolioInput {
  userId: string;
}

@Injectable()
export class GetPortfolioUseCase implements IUseCase<GetPortfolioInput, any> {
  constructor(
    @Inject(INJECTION_TOKENS.PORTFOLIO_ASSET_REPOSITORY)
    private readonly portfolioAssetRepository: IPortfolioAssetRepository,
    @Inject(INJECTION_TOKENS.ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
  ) {}

  async execute(input: GetPortfolioInput): Promise<Result<any>> {
    const portfolioAssets = await this.portfolioAssetRepository.findAllByUserId(input.userId);

    const items = await Promise.all(
      portfolioAssets.map(async (pa) => {
        const asset = await this.assetRepository.findById(pa.assetId);
        return {
          id: pa.id.toValue(),
          assetId: pa.assetId,
          ticker: asset?.ticker ?? 'UNKNOWN',
          name: asset?.name ?? 'Unknown',
          type: asset?.type ?? 'UNKNOWN',
          quantity: pa.quantity,
          averagePrice: pa.averagePrice,
          totalCost: pa.totalCost,
        };
      }),
    );

    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);

    return Result.ok({ items, totalAssets: items.length, totalCost });
  }
}
