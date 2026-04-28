import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface ListTransactionsInput {
  userId: string;
  page: number;
  limit: number;
}

export interface TransactionListItem {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  merchant?: string;
  location?: string;
  date: string;
  categoryId?: string;
  cardId?: string;
  syncStatus: string;
}

export interface ListTransactionsOutput {
  items: TransactionListItem[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListTransactionsUseCase implements IUseCase<ListTransactionsInput, ListTransactionsOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: ListTransactionsInput): Promise<Result<ListTransactionsOutput>> {
    const [transactions, total] = await Promise.all([
      this.transactionRepository.findAllByUserId(input.userId, input.page, input.limit),
      this.transactionRepository.countByUserId(input.userId),
    ]);

    return Result.ok({
      items: transactions.map((t) => ({
        id: t.id.toValue(),
        type: t.type,
        amount: t.amount.amount,
        currency: t.amount.currency,
        description: t.description,
        merchant: t.merchant,
        location: t.location,
        date: t.date.toISOString(),
        categoryId: t.categoryId,
        cardId: t.cardId,
        syncStatus: t.syncStatus,
      })),
      total,
      page: input.page,
      limit: input.limit,
    });
  }
}
