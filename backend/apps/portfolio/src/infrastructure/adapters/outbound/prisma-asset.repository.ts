import { Injectable } from '@nestjs/common';
import { AssetEntity } from '../../../domain/entities/asset.entity';
import { IAssetRepository } from '../../../domain/repositories/asset.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AssetMapper } from './mappers/asset.mapper';

@Injectable()
export class PrismaAssetRepository implements IAssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(asset: AssetEntity): Promise<void> {
    const data = AssetMapper.toPersistence(asset);
    await this.prisma.asset.upsert({
      where: { id: data.id },
      create: data,
      update: {
        ticker: data.ticker,
        name: data.name,
        type: data.type,
        currency: data.currency,
        logoUrl: data.logoUrl,
        sector: data.sector,
      },
    });
  }

  async findById(id: string): Promise<AssetEntity | null> {
    const raw = await this.prisma.asset.findUnique({ where: { id } });
    return raw ? AssetMapper.toDomain(raw) : null;
  }

  async findByTicker(ticker: string): Promise<AssetEntity | null> {
    const raw = await this.prisma.asset.findUnique({
      where: { ticker: ticker.trim().toUpperCase() },
    });
    return raw ? AssetMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<AssetEntity[]> {
    const raws = await this.prisma.asset.findMany({ orderBy: { ticker: 'asc' } });
    return raws.map(AssetMapper.toDomain);
  }
}
