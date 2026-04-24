import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository';
import { TransactionEntity } from '../../../domain/entities/transaction.entity';
import { TransactionMapper } from './mappers/transaction.mapper';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(transaction: TransactionEntity): Promise<void> {
    const data = TransactionMapper.toPersistence(transaction);
    await this.prisma.transaction.upsert({
      where: { id: data.id },
      create: data,
      update: {
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        categoryId: data.categoryId,
        syncStatus: data.syncStatus,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    const raw = await this.prisma.transaction.findUnique({ where: { id } });
    return raw ? TransactionMapper.toDomain(raw) : null;
  }

  async findAllByUserId(userId: string, page: number, limit: number): Promise<TransactionEntity[]> {
    const raws = await this.prisma.transaction.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' },
    });
    return raws.map(TransactionMapper.toDomain);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.transaction.count({ where: { userId } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } });
  }
}
