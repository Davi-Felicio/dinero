import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { INJECTION_TOKENS } from '../../injection-tokens';
import { AssetEntity } from '../../domain/entities/asset.entity';
import { PortfolioAssetEntity } from '../../domain/entities/portfolio-asset.entity';
import { IAssetRepository } from '../../domain/repositories/asset.repository';
import { IPortfolioAssetRepository } from '../../domain/repositories/portfolio-asset.repository';
import {
  AssetHistoricalInterval,
  AssetHistoricalRange,
  IAssetQuotationService,
  IAssetQuote,
} from '../ports/asset-quotation.service';
import { getErrorMessage } from './get-error-message';

export interface IGetPortfolioSummaryInput {
  userId: string;
  range: AssetHistoricalRange;
  interval: AssetHistoricalInterval;
}

export interface IPortfolioChartPoint {
  date: string;
  value: number;
}

export interface IPortfolioPositionOutput {
  id: string;
  assetId: string;
  ticker: string;
  name: string;
  type: string;
  quantity: number;
  averagePrice: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  result: number;
  resultPercent: number;
  logoUrl?: string;
  sector?: string;
  history: IPortfolioChartPoint[];
}

export interface IGetPortfolioSummaryOutput {
  userId: string;
  totalInvested: number;
  currentValue: number;
  result: number;
  resultPercent: number;
  positionsCount: number;
  marketDataStatus: 'OK' | 'PARTIAL';
  positions: IPortfolioPositionOutput[];
  chart: IPortfolioChartPoint[];
}

interface IPositionWithAsset {
  position: PortfolioAssetEntity;
  asset: AssetEntity;
}

@Injectable()
export class GetPortfolioSummaryUseCase implements IUseCase<
  IGetPortfolioSummaryInput,
  IGetPortfolioSummaryOutput
> {
  constructor(
    @Inject(INJECTION_TOKENS.PORTFOLIO_ASSET_REPOSITORY)
    private readonly portfolioAssetRepository: IPortfolioAssetRepository,
    @Inject(INJECTION_TOKENS.ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
    @Inject(INJECTION_TOKENS.ASSET_QUOTATION_SERVICE)
    private readonly quotationService: IAssetQuotationService,
  ) {}

  async execute(input: IGetPortfolioSummaryInput): Promise<Result<IGetPortfolioSummaryOutput>> {
    try {
      const positions = await this.getPositionsWithAssets(input.userId);
      const quotes = await this.quotationService.getQuotes(
        positions.map(({ asset }) => ({ ticker: asset.ticker, type: asset.type })),
        input.range,
        input.interval,
      );
      const quoteMap = new Map(quotes.map((quote) => [quote.ticker, quote]));
      const items = positions.map(({ position, asset }) =>
        this.buildPositionOutput(position, asset, quoteMap.get(asset.ticker)),
      );
      const totalInvested = this.sum(items.map((item) => item.totalInvested));
      const currentValue = this.sum(items.map((item) => item.currentValue));
      const result = currentValue - totalInvested;
      const resultPercent = totalInvested > 0 ? (result / totalInvested) * 100 : 0;

      return Result.ok({
        userId: input.userId,
        totalInvested,
        currentValue,
        result,
        resultPercent,
        positionsCount: items.length,
        marketDataStatus: quotes.length === positions.length ? 'OK' : 'PARTIAL',
        positions: items,
        chart: this.buildPortfolioChart(positions, quoteMap),
      });
    } catch (error: unknown) {
      return Result.fail(getErrorMessage(error));
    }
  }

  private async getPositionsWithAssets(userId: string): Promise<IPositionWithAsset[]> {
    const positions = await this.portfolioAssetRepository.findAllByUserId(userId);
    const assets = await Promise.all(
      positions.map(async (position) => ({
        position,
        asset: await this.assetRepository.findById(position.assetId),
      })),
    );

    return assets
      .filter((item): item is { position: PortfolioAssetEntity; asset: AssetEntity } => {
        return item.asset !== null;
      })
      .sort((a, b) => a.asset.ticker.localeCompare(b.asset.ticker));
  }

  private buildPositionOutput(
    position: PortfolioAssetEntity,
    asset: AssetEntity,
    quote?: IAssetQuote,
  ): IPortfolioPositionOutput {
    const currentPrice = quote?.price ?? position.averagePrice;
    const totalInvested = position.totalCost;
    const currentValue = position.quantity * currentPrice;
    const result = currentValue - totalInvested;

    return {
      id: position.id.toValue(),
      assetId: position.assetId,
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      quantity: position.quantity,
      averagePrice: position.averagePrice,
      totalInvested,
      currentPrice,
      currentValue,
      result,
      resultPercent: totalInvested > 0 ? (result / totalInvested) * 100 : 0,
      logoUrl: asset.logoUrl ?? quote?.logoUrl,
      sector: asset.sector ?? quote?.sector,
      history: this.buildAssetHistory(position, quote),
    };
  }

  private buildAssetHistory(
    position: PortfolioAssetEntity,
    quote?: IAssetQuote,
  ): IPortfolioChartPoint[] {
    return (quote?.historicalPrices ?? []).map((point) => ({
      date: new Date(point.date * 1000).toISOString(),
      value: point.close * position.quantity,
    }));
  }

  private buildPortfolioChart(
    positions: IPositionWithAsset[],
    quoteMap: Map<string, IAssetQuote>,
  ): IPortfolioChartPoint[] {
    const valuesByDate = new Map<number, number>();

    for (const { position, asset } of positions) {
      const quote = quoteMap.get(asset.ticker);
      for (const point of quote?.historicalPrices ?? []) {
        valuesByDate.set(
          point.date,
          (valuesByDate.get(point.date) ?? 0) + point.close * position.quantity,
        );
      }
    }

    return Array.from(valuesByDate.entries())
      .sort(([firstDate], [secondDate]) => firstDate - secondDate)
      .map(([date, value]) => ({
        date: new Date(date * 1000).toISOString(),
        value,
      }));
  }

  private sum(values: number[]): number {
    return values.reduce((total, value) => total + value, 0);
  }
}
