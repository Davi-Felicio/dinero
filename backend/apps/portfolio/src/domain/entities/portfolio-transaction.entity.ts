import { AggregateRoot, UniqueEntityID } from '@dinero/shared';

export type PortfolioTransactionType = 'BUY' | 'SELL';

export interface IPortfolioTransactionProps {
  userId: string;
  assetId: string;
  type: PortfolioTransactionType;
  quantity: number;
  unitPrice: number;
  costs: number;
  totalAmount: number;
  operationDate: Date;
  createdAt: Date;
}

export class PortfolioTransactionEntity extends AggregateRoot<IPortfolioTransactionProps> {
  private constructor(props: IPortfolioTransactionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: Omit<IPortfolioTransactionProps, 'totalAmount' | 'createdAt'>,
    id?: UniqueEntityID,
  ): PortfolioTransactionEntity {
    if (props.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (props.unitPrice <= 0) {
      throw new Error('Unit price must be greater than 0');
    }

    if (props.costs < 0) {
      throw new Error('Costs cannot be negative');
    }

    const grossAmount = props.quantity * props.unitPrice;
    if (props.type === 'SELL' && props.costs > grossAmount) {
      throw new Error('Costs cannot be greater than sell gross amount');
    }

    const totalAmount =
      props.type === 'BUY' ? grossAmount + props.costs : grossAmount - props.costs;

    return new PortfolioTransactionEntity(
      {
        ...props,
        totalAmount,
        createdAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(
    props: IPortfolioTransactionProps,
    id: UniqueEntityID,
  ): PortfolioTransactionEntity {
    return new PortfolioTransactionEntity(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }
  get assetId(): string {
    return this.props.assetId;
  }
  get type(): PortfolioTransactionType {
    return this.props.type;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get unitPrice(): number {
    return this.props.unitPrice;
  }
  get costs(): number {
    return this.props.costs;
  }
  get totalAmount(): number {
    return this.props.totalAmount;
  }
  get operationDate(): Date {
    return this.props.operationDate;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
