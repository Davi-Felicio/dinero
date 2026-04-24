import { AggregateRoot, UniqueEntityID } from '@dinero/shared';

export interface IPortfolioAssetProps {
  userId: string;
  assetId: string;
  quantity: number;
  averagePrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PortfolioAssetEntity extends AggregateRoot<IPortfolioAssetProps> {
  private constructor(props: IPortfolioAssetProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: Omit<IPortfolioAssetProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ): PortfolioAssetEntity {
    if (props.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (props.averagePrice <= 0) {
      throw new Error('Average price must be greater than 0');
    }
    return new PortfolioAssetEntity(
      { ...props, createdAt: new Date(), updatedAt: new Date() },
      id,
    );
  }

  static reconstitute(props: IPortfolioAssetProps, id: UniqueEntityID): PortfolioAssetEntity {
    return new PortfolioAssetEntity(props, id);
  }

  get userId(): string { return this.props.userId; }
  get assetId(): string { return this.props.assetId; }
  get quantity(): number { return this.props.quantity; }
  get averagePrice(): number { return this.props.averagePrice; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  get totalCost(): number {
    return this.props.quantity * this.props.averagePrice;
  }

  addPosition(quantity: number, price: number): void {
    if (quantity <= 0) throw new Error('Quantity must be greater than 0');
    const totalShares = this.props.quantity + quantity;
    const totalCost = this.totalCost + quantity * price;
    Object.assign(this.props, {
      averagePrice: totalCost / totalShares,
      quantity: totalShares,
      updatedAt: new Date(),
    });
  }

  removePosition(quantity: number): void {
    if (quantity <= 0) throw new Error('Quantity must be greater than 0');
    if (quantity > this.props.quantity) throw new Error('Insufficient quantity');
    Object.assign(this.props, { quantity: this.props.quantity - quantity, updatedAt: new Date() });
  }
}
