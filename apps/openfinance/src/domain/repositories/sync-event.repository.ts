import { SyncEventEntity } from '../entities/sync-event.entity';

export interface ISyncEventRepository {
  save(event: SyncEventEntity): Promise<void>;
  findAllByConnectionId(bankConnectionId: string): Promise<SyncEventEntity[]>;
}
