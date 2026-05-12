import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { INJECTION_TOKENS } from '../../injection-tokens';
import { IAssetRepository } from '../../domain/repositories/asset.repository';
import { IPortfolioTransactionRepository } from '../../domain/repositories/portfolio-transaction.repository';
import { getErrorMessage } from './get-error-message';

export interface IListPortfolioTransactionsInput {
  userId: string;
  page: number;
  limit: number;
}

export interface IListPortfolioTransactionsOutput {
  items: {
    id: string;
    ticker: string;
    assetName: string;
    type: string;
    quantity: number;
    unitPrice: number;
    costs: number;
    totalAmount: number;
    operationDate: string;
    createdAt: string;
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalCount: number;
    hasNextPage: boolean;
  };
}

@Injectable()
export class ListPortfolioTransactionsUseCase implements IUseCase<
  IListPortfolioTransactionsInput,
  IListPortfolioTransactionsOutput
> {
  constructor(
    @Inject(INJECTION_TOKENS.PORTFOLIO_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: IPortfolioTransactionRepository,
    @Inject(INJECTION_TOKENS.ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
  ) {}

  async execute(
    input: IListPortfolioTransactionsInput,
  ): Promise<Result<IListPortfolioTransactionsOutput>> {
    try {
      const [transactions, totalCount] = await Promise.all([
        this.transactionRepository.findAllByUserId(input.userId, input.page, input.limit),
        this.transactionRepository.countByUserId(input.userId),
      ]);
      const items = await Promise.all(
        transactions.map(async (transaction) => {
          const asset = await this.assetRepository.findById(transaction.assetId);

          return {
            id: transaction.id.toValue(),
            ticker: asset?.ticker ?? transaction.assetId,
            assetName: asset?.name ?? transaction.assetId,
            type: transaction.type,
            quantity: transaction.quantity,
            unitPrice: transaction.unitPrice,
            costs: transaction.costs,
            totalAmount: transaction.totalAmount,
            operationDate: transaction.operationDate.toISOString(),
            createdAt: transaction.createdAt.toISOString(),
          };
        }),
      );
      const totalPages = Math.ceil(totalCount / input.limit);

      return Result.ok({
        items,
        pagination: {
          currentPage: input.page,
          totalPages,
          itemsPerPage: input.limit,
          totalCount,
          hasNextPage: input.page < totalPages,
        },
      });
    } catch (error: unknown) {
      return Result.fail(getErrorMessage(error));
    }
  }
}
