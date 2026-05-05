import { Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

export interface SyncPullInput {
  userId: string;
  since?: Date;
}

export interface SyncPullTransactionItem {
  remoteId: string;
  localId: string | null;
  type: string;
  amount: number;
  currency: string;
  amountBrl: number | null;
  exchangeRate: number | null;
  description: string;
  date: string;
  categoryId: string | null;
  cardId: string | null;
  deletedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface SyncPullOutput {
  serverTime: string;
  count: number;
  transactions: SyncPullTransactionItem[];
}

@Injectable()
export class SyncPullUseCase implements IUseCase<SyncPullInput, SyncPullOutput> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: SyncPullInput): Promise<Result<SyncPullOutput>> {
    const { userId, since } = input;

    const rows = await this.prisma.transaction.findMany({
      where: {
        userId,
        ...(since ? { updatedAt: { gt: since } } : {}),
      },
      orderBy: { updatedAt: 'asc' },
      take: 500,
    });

    await this.prisma.syncLog.create({
      data: {
        userId,
        direction: 'PULL',
        recordCount: rows.length,
        conflicts: 0,
      },
    });

    const transactions: SyncPullTransactionItem[] = rows.map((row) => ({
      remoteId: row.id,
      localId: row.localId,
      type: row.type,
      amount: row.amount.toNumber(),
      currency: row.currency,
      amountBrl: row.amountBrl ? row.amountBrl.toNumber() : null,
      exchangeRate: row.exchangeRate ? row.exchangeRate.toNumber() : null,
      description: row.description,
      date: row.date.toISOString(),
      categoryId: row.categoryId,
      cardId: row.cardId,
      deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
      updatedAt: row.updatedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    }));

    return Result.ok({
      serverTime: new Date().toISOString(),
      count: transactions.length,
      transactions,
    });
  }
}
