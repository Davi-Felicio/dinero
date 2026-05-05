import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';

export interface GetTransactionByIdInput {
  id: string;
  userId: string;
}

@Injectable()
export class GetTransactionByIdUseCase implements IUseCase<GetTransactionByIdInput, TransactionResponseDto> {
  constructor(
    @Inject(INJECTION_TOKENS.TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: GetTransactionByIdInput): Promise<Result<TransactionResponseDto>> {
    const transaction = await this.transactionRepository.findByIdAndUserId(input.id, input.userId);
    if (!transaction) {
      return Result.fail('Transação não encontrada');
    }
    return Result.ok(TransactionResponseDto.fromEntity(transaction));
  }
}
