import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { Money } from '../../domain/value-objects/money.vo';
import { INJECTION_TOKENS } from '../../injection-tokens';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';

@Injectable()
export class CreateTransactionUseCase implements IUseCase<CreateTransactionDto, TransactionResponseDto> {
  constructor(
    @Inject(INJECTION_TOKENS.TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Result<TransactionResponseDto>> {
    try {
      const amount = Money.create(dto.amount, dto.currency ?? 'BRL');
      const transaction = TransactionEntity.create({
        userId: dto.userId,
        type: dto.type,
        amount,
        description: dto.description,
        date: new Date(dto.date),
        merchant: dto.merchant,
        location: dto.location,
        categoryId: dto.categoryId,
        cardId: dto.cardId,
      });

      await this.transactionRepository.save(transaction);
      return Result.ok(TransactionResponseDto.fromEntity(transaction));
    } catch (error) {
      return Result.fail((error as Error).message);
    }
  }
}
