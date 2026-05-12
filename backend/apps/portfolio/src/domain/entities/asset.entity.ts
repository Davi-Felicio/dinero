import { Entity, UniqueEntityID } from '@dinero/shared';

export type AssetType = 'ACAO' | 'FII' | 'BDR' | 'ETF' | 'RENDA_FIXA' | 'CRIPTO';

export interface IAssetProps {
  ticker: string;
  name: string;
  type: AssetType;
  currency: string;
  logoUrl?: string;
  sector?: string;
  createdAt: Date;
}

export class AssetEntity extends Entity<IAssetProps> {
  private constructor(props: IAssetProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(props: Omit<IAssetProps, 'createdAt'>, id?: UniqueEntityID): AssetEntity {
    if (!props.ticker || props.ticker.trim().length === 0) {
      throw new Error('Ticker cannot be empty');
    }
    return new AssetEntity(
      {
        ...props,
        ticker: props.ticker.toUpperCase(),
        currency: props.currency || 'BRL',
        createdAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(props: IAssetProps, id: UniqueEntityID): AssetEntity {
    return new AssetEntity(props, id);
  }

  get ticker(): string {
    return this.props.ticker;
  }
  get name(): string {
    return this.props.name;
  }
  get type(): AssetType {
    return this.props.type;
  }
  get currency(): string {
    return this.props.currency;
  }
  get logoUrl(): string | undefined {
    return this.props.logoUrl;
  }
  get sector(): string | undefined {
    return this.props.sector;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
