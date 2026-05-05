import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ICardRepository } from '../../domain/repositories/card.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface ListCardsInput {
  userId: string;
}

@Injectable()
export class ListCardsUseCase implements IUseCase<ListCardsInput, any[]> {
  constructor(
    @Inject(INJECTION_TOKENS.CARD_REPOSITORY)
    private readonly cardRepository: ICardRepository,
  ) {}

  async execute(input: ListCardsInput): Promise<Result<any[]>> {
    const cards = await this.cardRepository.findAllByUserId(input.userId);
    return Result.ok(
      cards.map((c) => ({
        id: c.id.toValue(),
        userId: c.userId,
        name: c.name,
        brand: c.brand,
        lastDigits: c.lastDigits,
        creditLimit: c.creditLimit.amount,
        currentBill: c.currentBill.amount,
        availableCredit: c.availableCredit.amount,
        dueDay: c.dueDay,
        daysUntilDue: c.daysUntilDue(),
      })),
    );
  }
}
