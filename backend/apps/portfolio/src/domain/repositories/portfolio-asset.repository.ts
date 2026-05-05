import { PortfolioAssetEntity } from '../entities/portfolio-asset.entity';

export interface IPortfolioAssetRepository {
  save(portfolioAsset: PortfolioAssetEntity): Promise<void>;
  findById(id: string): Promise<PortfolioAssetEntity | null>;
  findByUserAndAsset(userId: string, assetId: string): Promise<PortfolioAssetEntity | null>;
  findAllByUserId(userId: string): Promise<PortfolioAssetEntity[]>;
  delete(id: string): Promise<void>;
}
