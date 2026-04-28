import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface DeleteTransactionInput {
  id: string;
  userId: string;
}

@Injectable()
export class DeleteTransactionUseCase implements IUseCase<DeleteTransactionInput, void> {
  constructor(
    @Inject(INJECTION_TOKENS.TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: DeleteTransactionInput): Promise<Result<void>> {
    const transaction = await this.transactionRepository.findById(input.id);
    if (!transaction) return Result.fail('Transaction not found');
    if (transaction.userId !== input.userId) return Result.fail('Forbidden');
    await this.transactionRepository.delete(input.id);
    return Result.ok();
  }
}
