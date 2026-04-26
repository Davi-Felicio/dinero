import { UniqueEntityID } from '@dinero/shared';
import { CardEntity } from '../../../../domain/entities/card.entity';
import { Money } from '../../../../domain/value-objects/money.vo';

type CardPrismaModel = {
  id: string;
  userId: string;
  name: string;
  brand: string;
  lastDigits: string;
  currentBill: { toNumber(): number };
  creditLimit: { toNumber(): number };
  dueDay: number;
  createdAt: Date;
  updatedAt: Date;
};

export class CardMapper {
  static toDomain(raw: CardPrismaModel): CardEntity {
    return CardEntity.reconstitute(
      {
        userId: raw.userId,
        name: raw.name,
        brand: raw.brand,
        lastDigits: raw.lastDigits,
        currentBill: Money.create(raw.currentBill.toNumber(), 'BRL'),
        creditLimit: Money.create(raw.creditLimit.toNumber(), 'BRL'),
        dueDay: raw.dueDay,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(card: CardEntity) {
    return {
      id: card.id.toValue(),
      userId: card.userId,
      name: card.name,
      brand: card.brand,
      lastDigits: card.lastDigits,
      currentBill: card.currentBill.amount,
      creditLimit: card.creditLimit.amount,
      dueDay: card.dueDay,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }
}
