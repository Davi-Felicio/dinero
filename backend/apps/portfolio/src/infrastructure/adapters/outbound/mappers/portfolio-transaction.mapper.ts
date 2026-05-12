import { UniqueEntityID } from '@dinero/shared';
import {
  PortfolioTransactionEntity,
  PortfolioTransactionType,
} from '../../../../domain/entities/portfolio-transaction.entity';

type DecimalLike = {
  toNumber(): number;
};

type PortfolioTransactionPrismaModel = {
  id: string;
  userId: string;
  assetId: string;
  type: string;
  quantity: DecimalLike;
  unitPrice: DecimalLike;
  costs: DecimalLike;
  totalAmount: DecimalLike;
  operationDate: Date;
  createdAt: Date;
};

type PortfolioTransactionPersistenceModel = {
  id: string;
  userId: string;
  assetId: string;
  type: PortfolioTransactionType;
  quantity: number;
  unitPrice: number;
  costs: number;
  totalAmount: number;
  operationDate: Date;
  createdAt: Date;
};

export class PortfolioTransactionMapper {
  static toDomain(raw: PortfolioTransactionPrismaModel): PortfolioTransactionEntity {
    return PortfolioTransactionEntity.reconstitute(
      {
        userId: raw.userId,
        assetId: raw.assetId,
        type: raw.type as PortfolioTransactionType,
        quantity: raw.quantity.toNumber(),
        unitPrice: raw.unitPrice.toNumber(),
        costs: raw.costs.toNumber(),
        totalAmount: raw.totalAmount.toNumber(),
        operationDate: raw.operationDate,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(
    transaction: PortfolioTransactionEntity,
  ): PortfolioTransactionPersistenceModel {
    return {
      id: transaction.id.toValue(),
      userId: transaction.userId,
      assetId: transaction.assetId,
      type: transaction.type,
      quantity: transaction.quantity,
      unitPrice: transaction.unitPrice,
      costs: transaction.costs,
      totalAmount: transaction.totalAmount,
      operationDate: transaction.operationDate,
      createdAt: transaction.createdAt,
    };
  }
}
