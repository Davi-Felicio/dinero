import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ICardRepository } from '../../domain/repositories/card.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface DeleteCardInput {
  id: string;
  userId: string;
}

@Injectable()
export class DeleteCardUseCase implements IUseCase<DeleteCardInput, void> {
  constructor(
    @Inject(INJECTION_TOKENS.CARD_REPOSITORY)
    private readonly cardRepository: ICardRepository,
  ) {}

  async execute(input: DeleteCardInput): Promise<Result<void>> {
    const card = await this.cardRepository.findById(input.id);
    if (!card) return Result.fail('Card not found');
    if (card.userId !== input.userId) return Result.fail('Forbidden');
    await this.cardRepository.delete(input.id);
    return Result.ok();
  }
}
