import { CardEntity } from '../entities/card.entity';

export interface ICardRepository {
  save(card: CardEntity): Promise<void>;
  findById(id: string): Promise<CardEntity | null>;
  findAllByUserId(userId: string): Promise<CardEntity[]>;
  delete(id: string): Promise<void>;
}
