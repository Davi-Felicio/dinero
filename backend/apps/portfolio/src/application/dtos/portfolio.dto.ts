import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AssetType } from '../../domain/entities/asset.entity';
import { PortfolioTransactionType } from '../../domain/entities/portfolio-transaction.entity';
import { AssetHistoricalInterval, AssetHistoricalRange } from '../ports/asset-quotation.service';

const ASSET_TYPES: AssetType[] = ['ACAO', 'FII', 'BDR', 'ETF', 'RENDA_FIXA', 'CRIPTO'];
const TRANSACTION_TYPES: PortfolioTransactionType[] = ['BUY', 'SELL'];
const HISTORICAL_RANGES: AssetHistoricalRange[] = [
  '1d',
  '2d',
  '5d',
  '7d',
  '1mo',
  '3mo',
  '6mo',
  '1y',
  '2y',
  '5y',
  '10y',
  'ytd',
  'max',
];
const HISTORICAL_INTERVALS: AssetHistoricalInterval[] = [
  '1m',
  '2m',
  '5m',
  '15m',
  '30m',
  '60m',
  '90m',
  '1h',
  '1d',
  '5d',
  '1wk',
  '1mo',
  '3mo',
];

function toNumber(params: TransformFnParams): number | undefined {
  if (params.value === undefined || params.value === null || params.value === '') {
    return undefined;
  }

  return Number(params.value);
}

export class CreatePortfolioTransactionDto {
  @IsString()
  ticker!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsIn(ASSET_TYPES)
  assetType!: AssetType;

  @IsIn(TRANSACTION_TYPES)
  type!: PortfolioTransactionType;

  @Transform(toNumber)
  @IsNumber()
  @Min(0.000001)
  quantity!: number;

  @Transform(toNumber)
  @IsNumber()
  @Min(0.01)
  unitPrice!: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(0)
  costs = 0;

  @IsDateString()
  operationDate!: string;
}

export class PortfolioHistoryQueryDto {
  @IsOptional()
  @IsIn(HISTORICAL_RANGES)
  range: AssetHistoricalRange = '1y';

  @IsOptional()
  @IsIn(HISTORICAL_INTERVALS)
  interval: AssetHistoricalInterval = '1mo';
}

export class ListTransactionsQueryDto {
  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
