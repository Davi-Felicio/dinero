import { AggregateRoot, UniqueEntityID } from '@dinero/shared';
import { Money } from '../value-objects/money.vo';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type SyncStatus = 'MANUAL' | 'SYNCED' | 'PENDING';

export interface ITransactionProps {
  userId: string;
  type: TransactionType;
  amount: Money;
  amountBrl?: Money;
  exchangeRate?: number;
  description: string;
  merchant?: string;
  location?: string;
  date: Date;
  categoryId?: string;
  cardId?: string;
  syncStatus: SyncStatus;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionEntity extends AggregateRoot<ITransactionProps> {
  private constructor(props: ITransactionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: Omit<ITransactionProps, 'syncStatus' | 'deletedAt' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ): TransactionEntity {
    if (!props.description || props.description.trim().length === 0) {
      throw new Error('A descrição não pode estar vazia');
    }
    return new TransactionEntity(
      {
        ...props,
        syncStatus: 'MANUAL',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(props: ITransactionProps, id: UniqueEntityID): TransactionEntity {
    return new TransactionEntity(props, id);
  }

  get userId(): string { return this.props.userId; }
  get type(): TransactionType { return this.props.type; }
  get amount(): Money { return this.props.amount; }
  get amountBrl(): Money | undefined { return this.props.amountBrl; }
  get exchangeRate(): number | undefined { return this.props.exchangeRate; }
  get description(): string { return this.props.description; }
  get merchant(): string | undefined { return this.props.merchant; }
  get location(): string | undefined { return this.props.location; }
  get date(): Date { return this.props.date; }
  get categoryId(): string | undefined { return this.props.categoryId; }
  get cardId(): string | undefined { return this.props.cardId; }
  get syncStatus(): SyncStatus { return this.props.syncStatus; }
  get deletedAt(): Date | undefined { return this.props.deletedAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  isExpense(): boolean { return this.props.type === 'EXPENSE'; }
  isIncome(): boolean { return this.props.type === 'INCOME'; }
  isDeleted(): boolean { return !!this.props.deletedAt; }

  markAsSynced(): void {
    Object.assign(this.props, { syncStatus: 'SYNCED', updatedAt: new Date() });
  }

  softDelete(): void {
    Object.assign(this.props, { deletedAt: new Date(), updatedAt: new Date() });
  }

  update(fields: Partial<Pick<ITransactionProps, 'description' | 'amount' | 'categoryId' | 'merchant' | 'location' | 'date'>>): void {
    Object.assign(this.props, { ...fields, updatedAt: new Date() });
  }
}
