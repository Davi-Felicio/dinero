import { AggregateRoot, UniqueEntityID } from '@dinero/shared';
import { Money } from '../value-objects/money.vo';

export interface ICardProps {
  userId: string;
  name: string;
  brand: string;
  lastDigits: string;
  currentBill: Money;
  creditLimit: Money;
  dueDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CardEntity extends AggregateRoot<ICardProps> {
  private constructor(props: ICardProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: Omit<ICardProps, 'currentBill' | 'createdAt' | 'updatedAt'> & { creditLimit: Money },
    id?: UniqueEntityID,
  ): CardEntity {
    if (props.dueDay < 1 || props.dueDay > 31) {
      throw new Error('Due day must be between 1 and 31');
    }
    if (!/^\d{4}$/.test(props.lastDigits)) {
      throw new Error('Last digits must be exactly 4 digits');
    }
    return new CardEntity(
      {
        ...props,
        currentBill: Money.create(0, props.creditLimit.currency),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(props: ICardProps, id: UniqueEntityID): CardEntity {
    return new CardEntity(props, id);
  }

  get userId(): string { return this.props.userId; }
  get name(): string { return this.props.name; }
  get brand(): string { return this.props.brand; }
  get lastDigits(): string { return this.props.lastDigits; }
  get currentBill(): Money { return this.props.currentBill; }
  get creditLimit(): Money { return this.props.creditLimit; }
  get dueDay(): number { return this.props.dueDay; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  get availableCredit(): Money {
    return this.props.creditLimit.subtract(this.props.currentBill);
  }

  daysUntilDue(): number {
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth(), this.props.dueDay);
    if (dueDate < today) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  addToBill(amount: Money): void {
    const newBill = this.props.currentBill.add(amount);
    if (newBill.isGreaterThan(this.props.creditLimit)) {
      throw new Error('Charge exceeds credit limit');
    }
    Object.assign(this.props, { currentBill: newBill, updatedAt: new Date() });
  }

  update(changes: Partial<Pick<ICardProps, 'name' | 'brand' | 'lastDigits' | 'dueDay' | 'creditLimit'>>): void {
    if (changes.dueDay !== undefined && (changes.dueDay < 1 || changes.dueDay > 31)) {
      throw new Error('Due day must be between 1 and 31');
    }
    if (changes.lastDigits !== undefined && !/^\d{4}$/.test(changes.lastDigits)) {
      throw new Error('Last digits must be exactly 4 digits');
    }
    const defined = Object.fromEntries(
      Object.entries(changes).filter(([, v]) => v !== undefined),
    ) as Partial<Pick<ICardProps, 'name' | 'brand' | 'lastDigits' | 'dueDay' | 'creditLimit'>>;
    Object.assign(this.props, { ...defined, updatedAt: new Date() });
  }
}
