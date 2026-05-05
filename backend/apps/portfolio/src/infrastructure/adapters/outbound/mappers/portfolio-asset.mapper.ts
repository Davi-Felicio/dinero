import { UniqueEntityID } from '@dinero/shared';
import { PortfolioAssetEntity } from '../../../../domain/entities/portfolio-asset.entity';

type PortfolioAssetPrismaModel = {
  id: string;
  userId: string;
  assetId: string;
  quantity: number;
  averagePrice: { toNumber(): number };
  createdAt: Date;
  updatedAt: Date;
};

export class PortfolioAssetMapper {
  static toDomain(raw: PortfolioAssetPrismaModel): PortfolioAssetEntity {
    return PortfolioAssetEntity.reconstitute(
      {
        userId: raw.userId,
        assetId: raw.assetId,
        quantity: raw.quantity,
        averagePrice: raw.averagePrice.toNumber(),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(pa: PortfolioAssetEntity) {
    return {
      id: pa.id.toValue(),
      userId: pa.userId,
      assetId: pa.assetId,
      quantity: pa.quantity,
      averagePrice: pa.averagePrice,
      createdAt: pa.createdAt,
      updatedAt: pa.updatedAt,
    };
  }
}
