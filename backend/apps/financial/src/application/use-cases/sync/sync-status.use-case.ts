import { Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

export interface SyncStatusInput {
  userId: string;
}

export interface SyncStatusOutput {
  lastPushAt: string | null;
  lastPullAt: string | null;
  pendingCount: number;
}

@Injectable()
export class SyncStatusUseCase implements IUseCase<SyncStatusInput, SyncStatusOutput> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: SyncStatusInput): Promise<Result<SyncStatusOutput>> {
    const { userId } = input;

    const [lastPush, lastPull, pendingCount] = await Promise.all([
      this.prisma.syncLog.findFirst({
        where: { userId, direction: 'PUSH' },
        orderBy: { syncedAt: 'desc' },
      }),
      this.prisma.syncLog.findFirst({
        where: { userId, direction: 'PULL' },
        orderBy: { syncedAt: 'desc' },
      }),
      this.prisma.transaction.count({
        where: { userId, syncStatus: 'PENDING', deletedAt: null },
      }),
    ]);

    return Result.ok({
      lastPushAt: lastPush ? lastPush.syncedAt.toISOString() : null,
      lastPullAt: lastPull ? lastPull.syncedAt.toISOString() : null,
      pendingCount,
    });
  }
}
