import { UniqueEntityID } from '@dinero/shared';
import { TransactionEntity, TransactionType, SyncStatus } from '../../../../domain/entities/transaction.entity';
import { Money, Currency } from '../../../../domain/value-objects/money.vo';

type TransactionPrismaModel = {
  id: string;
  userId: string;
  type: string;
  amount: { toNumber(): number };
  currency: string;
  amountBrl: { toNumber(): number } | null;
  exchangeRate: { toNumber(): number } | null;
  description: string;
  merchant: string | null;
  location: string | null;
  date: Date;
  categoryId: string | null;
  cardId: string | null;
  syncStatus: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class TransactionMapper {
  static toDomain(raw: TransactionPrismaModel): TransactionEntity {
    return TransactionEntity.reconstitute(
      {
        userId: raw.userId,
        type: raw.type as TransactionType,
        amount: Money.create(raw.amount.toNumber(), raw.currency as Currency),
        amountBrl: raw.amountBrl ? Money.create(raw.amountBrl.toNumber(), 'BRL') : undefined,
        exchangeRate: raw.exchangeRate ? raw.exchangeRate.toNumber() : undefined,
        description: raw.description,
        merchant: raw.merchant ?? undefined,
        location: raw.location ?? undefined,
        date: raw.date,
        categoryId: raw.categoryId ?? undefined,
        cardId: raw.cardId ?? undefined,
        syncStatus: raw.syncStatus as SyncStatus,
        deletedAt: raw.deletedAt ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(t: TransactionEntity) {
    return {
      id: t.id.toValue(),
      userId: t.userId,
      type: t.type,
      amount: t.amount.amount,
      currency: t.amount.currency,
      amountBrl: t.amountBrl?.amount ?? null,
      exchangeRate: t.exchangeRate ?? null,
      description: t.description,
      merchant: t.merchant ?? null,
      location: t.location ?? null,
      date: t.date,
      categoryId: t.categoryId ?? null,
      cardId: t.cardId ?? null,
      syncStatus: t.syncStatus,
      deletedAt: t.deletedAt ?? null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }
}
