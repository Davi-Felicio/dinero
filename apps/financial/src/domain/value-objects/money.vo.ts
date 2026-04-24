import { ValueObject } from '@dinero/shared';

export type Currency = 'BRL' | 'USD' | 'EUR' | 'GBP';

interface IMoneyProps {
  amount: number;
  currency: Currency;
}

export class Money extends ValueObject<IMoneyProps> {
  private constructor(props: IMoneyProps) {
    super(props);
  }

  static create(amount: number, currency: Currency = 'BRL'): Money {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    return new Money({ amount: Math.round(amount * 100) / 100, currency });
  }

  get amount(): number { return this.props.amount; }
  get currency(): Currency { return this.props.currency; }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot add ${this.currency} and ${other.currency}`);
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot subtract ${this.currency} and ${other.currency}`);
    }
    return Money.create(this.amount - other.amount, this.currency);
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
