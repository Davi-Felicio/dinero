import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ICardRepository } from '../../domain/repositories/card.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface GetCardInput {
  id: string;
  userId: string;
}

export interface CardDetailOutput {
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
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetCardUseCase implements IUseCase<GetCardInput, CardDetailOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.CARD_REPOSITORY)
    private readonly cardRepository: ICardRepository,
  ) {}

  async execute(input: GetCardInput): Promise<Result<CardDetailOutput>> {
    const card = await this.cardRepository.findById(input.id);
    if (!card || card.userId !== input.userId) {
      return Result.fail('Card not found');
    }
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
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    });
  }
}
