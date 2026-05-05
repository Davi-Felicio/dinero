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
        amountBrl: data.amountBrl,
        exchangeRate: data.exchangeRate,
        merchant: data.merchant,
        location: data.location,
        date: data.date,
        categoryId: data.categoryId,
        cardId: data.cardId,
        syncStatus: data.syncStatus,
        deletedAt: data.deletedAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    const raw = await this.prisma.transaction.findFirst({
      where: { id, deletedAt: null },
    });
    return raw ? TransactionMapper.toDomain(raw) : null;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<TransactionEntity | null> {
    const raw = await this.prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
    });
    return raw ? TransactionMapper.toDomain(raw) : null;
  }

  async findAllByUserId(userId: string, page: number, limit: number): Promise<TransactionEntity[]> {
    const raws = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' },
    });
    return raws.map(TransactionMapper.toDomain);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.transaction.count({ where: { userId, deletedAt: null } });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
