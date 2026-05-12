import { AssetType } from '../../domain/entities/asset.entity';

export type AssetTypeFilter = AssetType | 'TODOS';
export type AssetHistoricalRange =
  | '1d'
  | '2d'
  | '5d'
  | '7d'
  | '1mo'
  | '3mo'
  | '6mo'
  | '1y'
  | '2y'
  | '5y'
  | '10y'
  | 'ytd'
  | 'max';
export type AssetHistoricalInterval =
  | '1m'
  | '2m'
  | '5m'
  | '15m'
  | '30m'
  | '60m'
  | '90m'
  | '1h'
  | '1d'
  | '5d'
  | '1wk'
  | '1mo'
  | '3mo';

export interface IHistoricalPricePoint {
  date: number;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
  adjustedClose?: number;
}

export interface IAssetIndicators {
  priceEarnings?: number;
  earningsPerShare?: number;
  priceToNav?: number;
  dividendYield12m?: number;
  dividendYield1m?: number;
  liquidity?: number;
  totalInvestors?: number;
  marketCap?: number;
}

export interface IAssetSummary {
  description?: string;
  website?: string;
  sector?: string;
  industry?: string;
  cnpj?: string;
  administratorName?: string;
  segment?: string;
}

export interface IMarketAsset {
  ticker: string;
  name: string;
  type: AssetType;
  currency: string;
  price?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: number;
  logoUrl?: string;
  sector?: string;
}

export interface IAssetQuote extends IMarketAsset {
  price: number;
  shortName?: string;
  longName?: string;
  change?: number;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
  open?: number;
  regularMarketTime?: string;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  indicators?: IAssetIndicators;
  summary?: IAssetSummary;
  historicalPrices: IHistoricalPricePoint[];
}

export interface ISearchAssetsInput {
  search?: string;
  type?: AssetTypeFilter;
  page: number;
  limit: number;
}

export interface ISearchAssetsOutput {
  items: IMarketAsset[];
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalCount: number;
    hasNextPage: boolean;
  };
}

export interface IAssetQuoteInput {
  ticker: string;
  type?: AssetType;
  range?: AssetHistoricalRange;
  interval?: AssetHistoricalInterval;
  modules?: string;
  dividends?: boolean;
}

export interface IAssetQuoteBatchInput {
  ticker: string;
  type?: AssetType;
}

export interface IAssetQuotationService {
  searchAssets(input: ISearchAssetsInput): Promise<ISearchAssetsOutput>;
  getQuote(input: IAssetQuoteInput): Promise<IAssetQuote>;
  getQuotes(
    assets: IAssetQuoteBatchInput[],
    range?: AssetHistoricalRange,
    interval?: AssetHistoricalInterval,
  ): Promise<IAssetQuote[]>;
}
