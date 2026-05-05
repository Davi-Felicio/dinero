import { AssetEntity } from '../entities/asset.entity';

export interface IAssetRepository {
  save(asset: AssetEntity): Promise<void>;
  findById(id: string): Promise<AssetEntity | null>;
  findByTicker(ticker: string): Promise<AssetEntity | null>;
  findAll(): Promise<AssetEntity[]>;
}
