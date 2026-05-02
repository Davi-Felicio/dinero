import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ICardRepository } from '../../domain/repositories/card.repository';
import { CardEntity } from '../../domain/entities/card.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface CreateCardInput {
  userId: string;
  name: string;
  brand: string;
  lastDigits: string;
  creditLimit: number;
  dueDay: number;
}

export interface CardOutput {
  id: string;
  userId: string;
  name: string;
  brand: string;
  lastDigits: string;
  creditLimit: number;
  currentBill: number;
  availableCredit: number;
  dueDay: number;
}

@Injectable()
export class CreateCardUseCase implements IUseCase<CreateCardInput, CardOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.CARD_REPOSITORY)
    private readonly cardRepository: ICardRepository,
  ) {}

  async execute(input: CreateCardInput): Promise<Result<CardOutput>> {
    const card = CardEntity.create({
      userId: input.userId,
      name: input.name,
      brand: input.brand,
      lastDigits: input.lastDigits,
      creditLimit: Money.create(input.creditLimit, 'BRL'),
      dueDay: input.dueDay,
    });

    await this.cardRepository.save(card);

    return Result.ok({
      id: card.id.toValue(),
      userId: card.userId,
      name: card.name,
      brand: card.brand,
      lastDigits: card.lastDigits,
      creditLimit: card.creditLimit.amount,
      currentBill: card.currentBill.amount,
      availableCredit: card.availableCredit.amount,
      dueDay: card.dueDay,
    });
  }
}
