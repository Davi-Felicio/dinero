import { UniqueEntityID } from '@dinero/shared';
import { PortfolioAssetEntity } from '../../../../domain/entities/portfolio-asset.entity';

type DecimalLike = {
  toNumber(): number;
};

type PortfolioAssetPrismaModel = {
  id: string;
  userId: string;
  assetId: string;
  quantity: DecimalLike;
  averagePrice: DecimalLike;
  createdAt: Date;
  updatedAt: Date;
};

type PortfolioAssetPersistenceModel = {
  id: string;
  userId: string;
  assetId: string;
  quantity: number;
  averagePrice: number;
  createdAt: Date;
  updatedAt: Date;
};

export class PortfolioAssetMapper {
  static toDomain(raw: PortfolioAssetPrismaModel): PortfolioAssetEntity {
    return PortfolioAssetEntity.reconstitute(
      {
        userId: raw.userId,
        assetId: raw.assetId,
        quantity: raw.quantity.toNumber(),
        averagePrice: raw.averagePrice.toNumber(),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(position: PortfolioAssetEntity): PortfolioAssetPersistenceModel {
    return {
      id: position.id.toValue(),
      userId: position.userId,
      assetId: position.assetId,
      quantity: position.quantity,
      averagePrice: position.averagePrice,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt,
    };
  }
}
