import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { INJECTION_TOKENS } from '../../injection-tokens';
import { AssetEntity, AssetType } from '../../domain/entities/asset.entity';
import { PortfolioAssetEntity } from '../../domain/entities/portfolio-asset.entity';
import {
  PortfolioTransactionEntity,
  PortfolioTransactionType,
} from '../../domain/entities/portfolio-transaction.entity';
import { IAssetRepository } from '../../domain/repositories/asset.repository';
import { IPortfolioAssetRepository } from '../../domain/repositories/portfolio-asset.repository';
import { IPortfolioTransactionRepository } from '../../domain/repositories/portfolio-transaction.repository';
import { IAssetQuotationService, IAssetQuote } from '../ports/asset-quotation.service';
import { getErrorMessage } from './get-error-message';

export interface ICreatePortfolioTransactionInput {
  userId: string;
  ticker: string;
  name?: string;
  assetType: AssetType;
  type: PortfolioTransactionType;
  quantity: number;
  unitPrice: number;
  costs: number;
  operationDate: Date;
}

export interface ICreatePortfolioTransactionOutput {
  transaction: {
    id: string;
    type: PortfolioTransactionType;
    ticker: string;
    quantity: number;
    unitPrice: number;
    costs: number;
    totalAmount: number;
    operationDate: string;
  };
  position: {
    id: string;
    ticker: string;
    quantity: number;
    averagePrice: number;
    totalCost: number;
  } | null;
}

@Injectable()
export class CreatePortfolioTransactionUseCase implements IUseCase<
  ICreatePortfolioTransactionInput,
  ICreatePortfolioTransactionOutput
> {
  constructor(
    @Inject(INJECTION_TOKENS.ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
    @Inject(INJECTION_TOKENS.PORTFOLIO_ASSET_REPOSITORY)
    private readonly portfolioAssetRepository: IPortfolioAssetRepository,
    @Inject(INJECTION_TOKENS.PORTFOLIO_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: IPortfolioTransactionRepository,
    @Inject(INJECTION_TOKENS.ASSET_QUOTATION_SERVICE)
    private readonly quotationService: IAssetQuotationService,
  ) {}

  async execute(
    input: ICreatePortfolioTransactionInput,
  ): Promise<Result<ICreatePortfolioTransactionOutput>> {
    try {
      const asset = await this.getOrCreateAsset(input);
      const transaction = PortfolioTransactionEntity.create({
        userId: input.userId,
        assetId: asset.id.toValue(),
        type: input.type,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        costs: input.costs,
        operationDate: input.operationDate,
      });

      const position = await this.applyTransactionToPosition(
        input,
        asset.id.toValue(),
        transaction,
      );
      await this.transactionRepository.save(transaction);

      return Result.ok({
        transaction: {
          id: transaction.id.toValue(),
          type: transaction.type,
          ticker: asset.ticker,
          quantity: transaction.quantity,
          unitPrice: transaction.unitPrice,
          costs: transaction.costs,
          totalAmount: transaction.totalAmount,
          operationDate: transaction.operationDate.toISOString(),
        },
        position: position
          ? {
              id: position.id.toValue(),
              ticker: asset.ticker,
              quantity: position.quantity,
              averagePrice: position.averagePrice,
              totalCost: position.totalCost,
            }
          : null,
      });
    } catch (error: unknown) {
      return Result.fail(getErrorMessage(error));
    }
  }

  private async getOrCreateAsset(input: ICreatePortfolioTransactionInput): Promise<AssetEntity> {
    const ticker = input.ticker.trim().toUpperCase();
    const existingAsset = await this.assetRepository.findByTicker(ticker);

    if (existingAsset) {
      return existingAsset;
    }

    let quote: IAssetQuote | undefined;
    try {
      quote = await this.quotationService.getQuote({ ticker, type: input.assetType });
    } catch (error: unknown) {
      if (!input.name) {
        throw error;
      }
    }

    const asset = AssetEntity.create({
      ticker,
      name: input.name?.trim() || quote?.name || ticker,
      type: input.assetType,
      currency: quote?.currency || 'BRL',
      logoUrl: quote?.logoUrl,
      sector: quote?.sector,
    });

    await this.assetRepository.save(asset);
    return asset;
  }

  private async applyTransactionToPosition(
    input: ICreatePortfolioTransactionInput,
    assetId: string,
    transaction: PortfolioTransactionEntity,
  ): Promise<PortfolioAssetEntity | null> {
    const currentPosition = await this.portfolioAssetRepository.findByUserAndAsset(
      input.userId,
      assetId,
    );

    if (input.type === 'BUY') {
      const unitCostWithFees = transaction.totalAmount / transaction.quantity;

      if (currentPosition) {
        currentPosition.addPosition(input.quantity, unitCostWithFees);
        await this.portfolioAssetRepository.save(currentPosition);
        return currentPosition;
      }

      const newPosition = PortfolioAssetEntity.create({
        userId: input.userId,
        assetId,
        quantity: input.quantity,
        averagePrice: unitCostWithFees,
      });
      await this.portfolioAssetRepository.save(newPosition);
      return newPosition;
    }

    if (!currentPosition) {
      throw new Error('Asset is not in portfolio');
    }

    currentPosition.removePosition(input.quantity);

    if (currentPosition.quantity <= 0) {
      await this.portfolioAssetRepository.delete(currentPosition.id.toValue());
      return null;
    }

    await this.portfolioAssetRepository.save(currentPosition);
    return currentPosition;
  }
}
