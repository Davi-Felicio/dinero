import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ICardRepository } from '../../domain/repositories/card.repository';
import { Money } from '../../domain/value-objects/money.vo';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface UpdateCardInput {
  id: string;
  userId: string;
  name?: string;
  brand?: string;
  lastDigits?: string;
  creditLimit?: number;
  dueDay?: number;
}

export interface UpdateCardOutput {
  id: string;
  userId: string;
  name: string;
  brand: string;
  lastDigits: string;
  creditLimit: number;
  currentBill: number;
  availableCredit: number;
  dueDay: number;
  daysUntilDue: number;
  updatedAt: Date;
}

@Injectable()
export class UpdateCardUseCase implements IUseCase<UpdateCardInput, UpdateCardOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.CARD_REPOSITORY)
    private readonly cardRepository: ICardRepository,
  ) {}

  async execute(input: UpdateCardInput): Promise<Result<UpdateCardOutput>> {
    const card = await this.cardRepository.findById(input.id);
    if (!card || card.userId !== input.userId) {
      return Result.fail('Card not found');
    }

    const { id: _id, userId: _userId, creditLimit, ...rest } = input;
    card.update({
      ...rest,
      ...(creditLimit !== undefined ? { creditLimit: Money.create(creditLimit, 'BRL') } : {}),
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
      daysUntilDue: card.daysUntilDue(),
      updatedAt: card.updatedAt,
    });
  }
}
