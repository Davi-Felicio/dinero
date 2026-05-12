import { Injectable } from '@nestjs/common';
import { PortfolioTransactionEntity } from '../../../domain/entities/portfolio-transaction.entity';
import { IPortfolioTransactionRepository } from '../../../domain/repositories/portfolio-transaction.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { PortfolioTransactionMapper } from './mappers/portfolio-transaction.mapper';

@Injectable()
export class PrismaPortfolioTransactionRepository implements IPortfolioTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(transaction: PortfolioTransactionEntity): Promise<void> {
    const data = PortfolioTransactionMapper.toPersistence(transaction);
    await this.prisma.portfolioTransaction.create({ data });
  }

  async findAllByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PortfolioTransactionEntity[]> {
    const raws = await this.prisma.portfolioTransaction.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { operationDate: 'desc' },
    });
    return raws.map(PortfolioTransactionMapper.toDomain);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.portfolioTransaction.count({ where: { userId } });
  }
}
