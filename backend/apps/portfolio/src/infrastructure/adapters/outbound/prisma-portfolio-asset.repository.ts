import { Injectable } from '@nestjs/common';
import { PortfolioAssetEntity } from '../../../domain/entities/portfolio-asset.entity';
import { IPortfolioAssetRepository } from '../../../domain/repositories/portfolio-asset.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { PortfolioAssetMapper } from './mappers/portfolio-asset.mapper';

@Injectable()
export class PrismaPortfolioAssetRepository implements IPortfolioAssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(portfolioAsset: PortfolioAssetEntity): Promise<void> {
    const data = PortfolioAssetMapper.toPersistence(portfolioAsset);
    await this.prisma.portfolioAsset.upsert({
      where: { id: data.id },
      create: data,
      update: {
        quantity: data.quantity,
        averagePrice: data.averagePrice,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<PortfolioAssetEntity | null> {
    const raw = await this.prisma.portfolioAsset.findUnique({ where: { id } });
    return raw ? PortfolioAssetMapper.toDomain(raw) : null;
  }

  async findByUserAndAsset(userId: string, assetId: string): Promise<PortfolioAssetEntity | null> {
    const raw = await this.prisma.portfolioAsset.findUnique({
      where: { userId_assetId: { userId, assetId } },
    });
    return raw ? PortfolioAssetMapper.toDomain(raw) : null;
  }

  async findAllByUserId(userId: string): Promise<PortfolioAssetEntity[]> {
    const raws = await this.prisma.portfolioAsset.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return raws.map(PortfolioAssetMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.portfolioAsset.delete({ where: { id } });
  }
}
