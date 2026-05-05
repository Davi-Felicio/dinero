import { AggregateRoot, UniqueEntityID } from '@dinero/shared';

export type ConnectionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'ERROR';

export interface IBankConnectionProps {
  userId: string;
  institutionId: string;
  institutionName: string;
  consentId?: string;
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class BankConnectionEntity extends AggregateRoot<IBankConnectionProps> {
  private constructor(props: IBankConnectionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: Omit<IBankConnectionProps, 'status' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ): BankConnectionEntity {
    return new BankConnectionEntity(
      { ...props, status: 'PENDING', createdAt: new Date(), updatedAt: new Date() },
      id,
    );
  }

  static reconstitute(props: IBankConnectionProps, id: UniqueEntityID): BankConnectionEntity {
    return new BankConnectionEntity(props, id);
  }

  get userId(): string { return this.props.userId; }
  get institutionId(): string { return this.props.institutionId; }
  get institutionName(): string { return this.props.institutionName; }
  get consentId(): string | undefined { return this.props.consentId; }
  get status(): ConnectionStatus { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  isActive(): boolean { return this.props.status === 'ACTIVE'; }

  activate(consentId: string): void {
    Object.assign(this.props, { status: 'ACTIVE', consentId, updatedAt: new Date() });
  }

  revoke(): void {
    Object.assign(this.props, { status: 'REVOKED', updatedAt: new Date() });
  }

  markAsError(): void {
    Object.assign(this.props, { status: 'ERROR', updatedAt: new Date() });
  }
}
