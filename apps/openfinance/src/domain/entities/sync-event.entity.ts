import { Entity, UniqueEntityID } from '@dinero/shared';

export type SyncEventStatus = 'SUCCESS' | 'PARTIAL' | 'FAILED';

export interface ISyncEventProps {
  bankConnectionId: string;
  status: SyncEventStatus;
  transactionCount: number;
  errorMessage?: string;
  syncedAt: Date;
}

export class SyncEventEntity extends Entity<ISyncEventProps> {
  private constructor(props: ISyncEventProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static createSuccess(bankConnectionId: string, transactionCount: number): SyncEventEntity {
    return new SyncEventEntity({
      bankConnectionId,
      status: 'SUCCESS',
      transactionCount,
      syncedAt: new Date(),
    });
  }

  static createFailed(bankConnectionId: string, errorMessage: string): SyncEventEntity {
    return new SyncEventEntity({
      bankConnectionId,
      status: 'FAILED',
      transactionCount: 0,
      errorMessage,
      syncedAt: new Date(),
    });
  }

  static reconstitute(props: ISyncEventProps, id: UniqueEntityID): SyncEventEntity {
    return new SyncEventEntity(props, id);
  }

  get bankConnectionId(): string { return this.props.bankConnectionId; }
  get status(): SyncEventStatus { return this.props.status; }
  get transactionCount(): number { return this.props.transactionCount; }
  get errorMessage(): string | undefined { return this.props.errorMessage; }
  get syncedAt(): Date { return this.props.syncedAt; }
}
