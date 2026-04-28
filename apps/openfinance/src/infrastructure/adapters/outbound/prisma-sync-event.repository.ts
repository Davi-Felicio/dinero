import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISyncEventRepository } from '../../../domain/repositories/sync-event.repository';
import { SyncEventEntity } from '../../../domain/entities/sync-event.entity';
import { SyncEventMapper } from './mappers/sync-event.mapper';

@Injectable()
export class PrismaSyncEventRepository implements ISyncEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(event: SyncEventEntity): Promise<void> {
    const data = SyncEventMapper.toPersistence(event);
    await this.prisma.syncEvent.upsert({
      where: { id: data.id },
      create: data,
      update: {
        status: data.status,
        transactionCount: data.transactionCount,
        errorMessage: data.errorMessage,
        syncedAt: data.syncedAt,
      },
    });
  }

  async findAllByConnectionId(bankConnectionId: string): Promise<SyncEventEntity[]> {
    const raws = await this.prisma.syncEvent.findMany({
      where: { bankConnectionId },
      orderBy: { syncedAt: 'desc' },
    });

    return raws.map(SyncEventMapper.toDomain);
  }
}