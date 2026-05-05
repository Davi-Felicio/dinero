import { Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { SyncTransactionItemDto } from '../../../infrastructure/adapters/inbound/dtos/sync-push.dto';

export interface SyncPushInput {
  userId: string;
  transactions: SyncTransactionItemDto[];
}

export type SyncResultStatus = 'CREATED' | 'UPDATED' | 'DELETED' | 'CONFLICT' | 'IGNORED';

export interface SyncItemResult {
  localId: string;
  remoteId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  status: SyncResultStatus;
}

export interface SyncPushOutput {
  processed: number;
  conflicts: number;
  results: SyncItemResult[];
}

@Injectable()
export class SyncPushUseCase implements IUseCase<SyncPushInput, SyncPushOutput> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: SyncPushInput): Promise<Result<SyncPushOutput>> {
    const { userId, transactions } = input;
    const results: SyncItemResult[] = [];
    let conflicts = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const item of transactions) {
        const localUpdatedAt = new Date(item.updatedAt);

        if (item.operation === 'CREATE') {
          const existing = await tx.transaction.findFirst({
            where: { userId, localId: item.localId },
          });

          if (existing) {
            results.push({ localId: item.localId, remoteId: existing.id, operation: 'CREATE', status: 'IGNORED' });
            continue;
          }

          const created = await tx.transaction.create({
            data: {
              userId,
              type: item.type,
              amount: item.amount,
              currency: item.currency,
              amountBrl: item.amountBrl ?? null,
              exchangeRate: item.exchangeRate ?? null,
              description: item.description,
              date: new Date(item.date),
              categoryId: item.categoryId ?? null,
              cardId: item.cardId ?? null,
              syncStatus: 'SYNCED',
              localId: item.localId,
            },
          });
          results.push({ localId: item.localId, remoteId: created.id, operation: 'CREATE', status: 'CREATED' });

        } else if (item.operation === 'UPDATE') {
          if (!item.remoteId) {
            results.push({ localId: item.localId, remoteId: '', operation: 'UPDATE', status: 'IGNORED' });
            continue;
          }

          const existing = await tx.transaction.findUnique({ where: { id: item.remoteId } });
          if (!existing || existing.userId !== userId) {
            results.push({ localId: item.localId, remoteId: item.remoteId, operation: 'UPDATE', status: 'IGNORED' });
            continue;
          }

          if (existing.updatedAt > localUpdatedAt) {
            conflicts++;
            results.push({ localId: item.localId, remoteId: item.remoteId, operation: 'UPDATE', status: 'CONFLICT' });
            continue;
          }

          await tx.transaction.update({
            where: { id: item.remoteId },
            data: {
              type: item.type,
              amount: item.amount,
              currency: item.currency,
              amountBrl: item.amountBrl ?? null,
              exchangeRate: item.exchangeRate ?? null,
              description: item.description,
              date: new Date(item.date),
              categoryId: item.categoryId ?? null,
              cardId: item.cardId ?? null,
              syncStatus: 'SYNCED',
            },
          });
          results.push({ localId: item.localId, remoteId: item.remoteId, operation: 'UPDATE', status: 'UPDATED' });

        } else if (item.operation === 'DELETE') {
          if (!item.remoteId) {
            results.push({ localId: item.localId, remoteId: '', operation: 'DELETE', status: 'IGNORED' });
            continue;
          }

          const existing = await tx.transaction.findUnique({ where: { id: item.remoteId } });
          if (!existing || existing.userId !== userId) {
            results.push({ localId: item.localId, remoteId: item.remoteId, operation: 'DELETE', status: 'IGNORED' });
            continue;
          }

          await tx.transaction.update({
            where: { id: item.remoteId },
            data: { deletedAt: new Date() },
          });
          results.push({ localId: item.localId, remoteId: item.remoteId, operation: 'DELETE', status: 'DELETED' });
        }
      }

      await tx.syncLog.create({
        data: {
          userId,
          direction: 'PUSH',
          recordCount: transactions.length,
          conflicts,
        },
      });
    });

    return Result.ok({ processed: transactions.length, conflicts, results });
  }
}
