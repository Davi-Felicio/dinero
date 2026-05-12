import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  AssetHistoricalInterval,
  AssetHistoricalRange,
  AssetTypeFilter,
} from '../ports/asset-quotation.service';
import { AssetType } from '../../domain/entities/asset.entity';

const ASSET_TYPE_FILTERS: AssetTypeFilter[] = ['TODOS', 'ACAO', 'FII', 'BDR', 'ETF', 'CRIPTO'];
const ASSET_TYPES: AssetType[] = ['ACAO', 'FII', 'BDR', 'ETF', 'RENDA_FIXA', 'CRIPTO'];
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

function toBoolean(params: TransformFnParams): boolean | undefined {
  if (params.value === undefined || params.value === null || params.value === '') {
    return undefined;
  }

  if (params.value === true || params.value === 'true') {
    return true;
  }

  if (params.value === false || params.value === 'false') {
    return false;
  }

  return undefined;
}

export class SearchAssetsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(ASSET_TYPE_FILTERS)
  type: AssetTypeFilter = 'TODOS';

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

export class GetAssetQuoteQueryDto {
  @IsOptional()
  @IsIn(ASSET_TYPES)
  type?: AssetType;

  @IsOptional()
  @IsIn(HISTORICAL_RANGES)
  range: AssetHistoricalRange = '1y';

  @IsOptional()
  @IsIn(HISTORICAL_INTERVALS)
  interval: AssetHistoricalInterval = '1d';

  @IsOptional()
  @IsString()
  modules = 'summaryProfile';

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  dividends?: boolean;
}
