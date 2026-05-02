import { UniqueEntityID } from '@dinero/shared';
import { AssetEntity, AssetType } from '../../../../domain/entities/asset.entity';

type AssetPrismaModel = {
  id: string;
  ticker: string;
  name: string;
  type: string;
  createdAt: Date;
};

export class AssetMapper {
  static toDomain(raw: AssetPrismaModel): AssetEntity {
    return AssetEntity.reconstitute(
      {
        ticker: raw.ticker,
        name: raw.name,
        type: raw.type as AssetType,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(asset: AssetEntity) {
    return {
      id: asset.id.toValue(),
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      createdAt: asset.createdAt,
    };
  }
}
