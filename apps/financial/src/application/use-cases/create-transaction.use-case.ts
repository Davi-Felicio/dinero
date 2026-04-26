import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { TransactionEntity, TransactionType } from '../../domain/entities/transaction.entity';
import { Money, Currency } from '../../domain/value-objects/money.vo';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface CreateTransactionInput {
  userId: string;
  type: TransactionType;
  amount: number;
  currency?: Currency;
  amountBrl?: number;
  exchangeRate?: number;
  description: string;
  merchant?: string;
  location?: string;
  date: string;
  categoryId?: string;
  cardId?: string;
}

export interface TransactionOutput {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  merchant?: string;
  date: string;
  categoryId?: string;
  cardId?: string;
  syncStatus: string;
  createdAt: string;
}

@Injectable()
export class CreateTransactionUseCase implements IUseCase<CreateTransactionInput, TransactionOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: CreateTransactionInput): Promise<Result<TransactionOutput>> {
    const currency = input.currency ?? 'BRL';
    const money = Money.create(input.amount, currency);
    const amountBrl = input.amountBrl ? Money.create(input.amountBrl, 'BRL') : undefined;

    const transaction = TransactionEntity.create({
      userId: input.userId,
      type: input.type,
      amount: money,
      amountBrl,
      exchangeRate: input.exchangeRate,
      description: input.description,
      merchant: input.merchant,
      location: input.location,
      date: new Date(input.date),
      categoryId: input.categoryId,
      cardId: input.cardId,
    });

    await this.transactionRepository.save(transaction);

    return Result.ok({
      id: transaction.id.toValue(),
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount.amount,
      currency: transaction.amount.currency,
      description: transaction.description,
      merchant: transaction.merchant,
      date: transaction.date.toISOString(),
      categoryId: transaction.categoryId,
      cardId: transaction.cardId,
      syncStatus: transaction.syncStatus,
      createdAt: transaction.createdAt.toISOString(),
    });
  }
}
