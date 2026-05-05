import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { Money } from '../../domain/value-objects/money.vo';
import { INJECTION_TOKENS } from '../../injection-tokens';
import { UpdateTransactionDto } from '../dtos/update-transaction.dto';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';

export interface UpdateTransactionInput {
  id: string;
  userId: string;
  dto: UpdateTransactionDto;
}

@Injectable()
export class UpdateTransactionUseCase implements IUseCase<UpdateTransactionInput, TransactionResponseDto> {
  constructor(
    @Inject(INJECTION_TOKENS.TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: UpdateTransactionInput): Promise<Result<TransactionResponseDto>> {
    try {
      const transaction = await this.transactionRepository.findByIdAndUserId(input.id, input.userId);
      if (!transaction) {
        return Result.fail('Transação não encontrada');
      }

      const { dto } = input;
      transaction.update({
        ...(dto.amount !== undefined && { amount: Money.create(dto.amount, transaction.amount.currency) }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.merchant !== undefined && { merchant: dto.merchant }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      });

      await this.transactionRepository.save(transaction);
      return Result.ok(TransactionResponseDto.fromEntity(transaction));
    } catch (error) {
      return Result.fail((error as Error).message);
    }
  }
}
