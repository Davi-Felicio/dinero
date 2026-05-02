import { UniqueEntityID } from '@dinero/shared';
import {
  SyncEventEntity,
  SyncEventStatus,
} from '../../../../domain/entities/sync-event.entity';

type SyncEventPrismaModel = {
  id: string;
  bankConnectionId: string;
  status: string;
  transactionCount: number;
  errorMessage: string | null;
  syncedAt: Date;
};

export class SyncEventMapper {
  static toDomain(raw: SyncEventPrismaModel): SyncEventEntity {
    return SyncEventEntity.reconstitute(
      {
        bankConnectionId: raw.bankConnectionId,
        status: raw.status as SyncEventStatus,
        transactionCount: raw.transactionCount,
        errorMessage: raw.errorMessage ?? undefined,
        syncedAt: raw.syncedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(event: SyncEventEntity) {
    return {
      id: event.id.toValue(),
      bankConnectionId: event.bankConnectionId,
      status: event.status,
      transactionCount: event.transactionCount,
      errorMessage: event.errorMessage ?? null,
      syncedAt: event.syncedAt,
    };
  }
}