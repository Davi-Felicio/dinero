import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';
import { PaginatedTransactionResponseDto, TransactionResponseDto } from '../dtos/transaction-response.dto';

export interface ListTransactionsInput {
  userId: string;
  page: number;
  limit: number;
}

@Injectable()
export class ListTransactionsUseCase implements IUseCase<ListTransactionsInput, PaginatedTransactionResponseDto> {
  constructor(
    @Inject(INJECTION_TOKENS.TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: ListTransactionsInput): Promise<Result<PaginatedTransactionResponseDto>> {
    const { userId, page, limit } = input;
    const [transactions, total] = await Promise.all([
      this.transactionRepository.findAllByUserId(userId, page, limit),
      this.transactionRepository.countByUserId(userId),
    ]);

    const response: PaginatedTransactionResponseDto = {
      data: transactions.map(TransactionResponseDto.fromEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return Result.ok(response);
  }
}
