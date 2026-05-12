import { UniqueEntityID } from '@dinero/shared';
import { AssetEntity, AssetType } from '../../../../domain/entities/asset.entity';

type AssetPrismaModel = {
  id: string;
  ticker: string;
  name: string;
  type: string;
  currency: string;
  logoUrl: string | null;
  sector: string | null;
  createdAt: Date;
};

export class AssetMapper {
  static toDomain(raw: AssetPrismaModel): AssetEntity {
    return AssetEntity.reconstitute(
      {
        ticker: raw.ticker,
        name: raw.name,
        type: raw.type as AssetType,
        currency: raw.currency,
        logoUrl: raw.logoUrl ?? undefined,
        sector: raw.sector ?? undefined,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(asset: AssetEntity): AssetPrismaModel {
    return {
      id: asset.id.toValue(),
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      currency: asset.currency,
      logoUrl: asset.logoUrl ?? null,
      sector: asset.sector ?? null,
      createdAt: asset.createdAt,
    };
  }
}
