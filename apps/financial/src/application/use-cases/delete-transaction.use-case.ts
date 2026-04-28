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
    const transaction = await this.transactionRepository.findByIdAndUserId(input.id, input.userId);
    if (!transaction) {
      return Result.fail('Transação não encontrada');
    }
    await this.transactionRepository.softDelete(input.id);
    return Result.ok();
  }
}
