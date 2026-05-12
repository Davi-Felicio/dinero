import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { BalanceSummaryResponseDto } from '../dtos/balance-summary-response.dto';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface GetBalanceSummaryInput {
  userId: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class GetBalanceSummaryUseCase
  implements IUseCase<GetBalanceSummaryInput, BalanceSummaryResponseDto>
{
  constructor(
    @Inject(INJECTION_TOKENS.TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: GetBalanceSummaryInput): Promise<Result<BalanceSummaryResponseDto>> {
    const startDate = input.startDate ? new Date(input.startDate) : undefined;
    const endDate = input.endDate ? new Date(input.endDate) : undefined;

    if (startDate && isNaN(startDate.getTime())) {
      return Result.fail('Data de início inválida');
    }
    if (endDate && isNaN(endDate.getTime())) {
      return Result.fail('Data de fim inválida');
    }
    if (startDate && endDate && startDate > endDate) {
      return Result.fail('A data de início não pode ser posterior à data de fim');
    }

    const { totalIncome, totalExpenses } = await this.transactionRepository.getBalanceSummary(
      input.userId,
      startDate,
      endDate,
    );

    const balance = Math.round((totalIncome - totalExpenses) * 100) / 100;

    return Result.ok({
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      balance,
      currency: 'BRL',
      period: {
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
      },
    });
  }
}
