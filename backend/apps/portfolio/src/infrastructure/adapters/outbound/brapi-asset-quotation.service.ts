import { Injectable } from '@nestjs/common';
import { AssetType } from '../../../domain/entities/asset.entity';
import {
  AssetHistoricalInterval,
  AssetHistoricalRange,
  IAssetQuotationService,
  IAssetQuote,
  IAssetQuoteBatchInput,
  IAssetQuoteInput,
  IHistoricalPricePoint,
  IMarketAsset,
  ISearchAssetsInput,
  ISearchAssetsOutput,
} from '../../../application/ports/asset-quotation.service';

interface IBrapiErrorResponse {
  error: boolean;
  message?: string;
  code?: string;
}

interface IBrapiListResponse {
  stocks: IBrapiListItem[];
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  totalCount?: number;
  hasNextPage?: boolean;
}

interface IBrapiListItem {
  stock: string;
  name?: string;
  close?: number;
  change?: number;
  volume?: number;
  market_cap?: number;
  sector?: string;
  type?: string;
  logo?: string;
}

interface IBrapiQuoteResponse {
  results: IBrapiQuoteItem[];
}

interface IBrapiQuoteItem {
  symbol: string;
  shortName?: string;
  longName?: string;
  currency?: string;
  regularMarketPrice?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketTime?: string;
  marketCap?: number;
  regularMarketVolume?: number;
  regularMarketPreviousClose?: number;
  regularMarketOpen?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  priceEarnings?: number;
  earningsPerShare?: number;
  logourl?: string;
  summaryProfile?: IBrapiSummaryProfile;
  historicalDataPrice?: IBrapiHistoricalPoint[];
}

interface IBrapiSummaryProfile {
  website?: string | null;
  industry?: string | null;
  industryDisp?: string | null;
  sector?: string | null;
  sectorDisp?: string | null;
  longBusinessSummary?: string | null;
  logoUrl?: string | null;
  cnpj?: string | null;
  administratorName?: string | null;
}

interface IBrapiHistoricalPoint {
  date: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  adjustedClose?: number;
}

interface IBrapiCryptoAvailableResponse {
  coins: string[];
}

interface IBrapiCryptoQuoteResponse {
  coins: IBrapiCryptoQuoteItem[];
}

interface IBrapiCryptoQuoteItem {
  currency?: string;
  coinName?: string;
  coin: string;
  regularMarketChange?: number;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  regularMarketDayLow?: number;
  regularMarketDayHigh?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  regularMarketTime?: string;
  coinImageUrl?: string;
  historicalDataPrice?: IBrapiHistoricalPoint[];
}

interface IBrapiFiiIndicatorsResponse {
  fiis: IBrapiFiiIndicatorItem[];
}

interface IBrapiFiiIndicatorItem {
  symbol: string;
  price?: number;
  priceToNav?: number;
  dividendYield12m?: number;
  dividendYield1m?: number;
  monthlyReturn?: number;
  totalInvestors?: number;
  name?: string;
  cnpj?: string;
  segmentType?: string;
  segmentoAtuacao?: string;
  administratorName?: string;
}

interface IBrapiFiiHistoricalResponse {
  fiis: IBrapiFiiHistoricalItem[];
}

interface IBrapiFiiHistoricalItem {
  symbol: string;
  historicalDataPrice?: IBrapiHistoricalPoint[];
}

function isBrapiErrorResponse(value: unknown): value is IBrapiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (value as { error?: unknown }).error === true;
}

@Injectable()
export class BrapiAssetQuotationService implements IAssetQuotationService {
  private readonly baseUrl = process.env['BRAPI_BASE_URL'] ?? 'https://brapi.dev';
  private readonly token = process.env['BRAPI_TOKEN']?.trim() ?? '';

  async searchAssets(input: ISearchAssetsInput): Promise<ISearchAssetsOutput> {
    const type = input.type === 'TODOS' ? undefined : input.type;

    if (type === 'CRIPTO') {
      return this.searchCryptoAssets(input);
    }

    if (type === 'RENDA_FIXA') {
      return this.emptySearch(input.page, input.limit);
    }

    const response = await this.request<IBrapiListResponse>('/api/quote/list', {
      search: input.search,
      type: this.mapAssetTypeToBrapiListType(type),
      page: input.page,
      limit: input.limit,
    });
    const items = response.stocks
      .map((asset) => this.mapListItem(asset))
      .filter((asset) => !type || asset.type === type);

    return {
      items,
      pagination: {
        currentPage: response.currentPage ?? input.page,
        totalPages: response.totalPages ?? 1,
        itemsPerPage: response.itemsPerPage ?? input.limit,
        totalCount: response.totalCount ?? items.length,
        hasNextPage: response.hasNextPage ?? false,
      },
    };
  }

  async getQuote(input: IAssetQuoteInput): Promise<IAssetQuote> {
    const normalizedInput = { ...input, ticker: input.ticker.trim().toUpperCase() };

    if (normalizedInput.type === 'CRIPTO') {
      return this.getCryptoQuote(normalizedInput);
    }

    if (normalizedInput.type === 'FII') {
      try {
        return await this.getFiiQuote(normalizedInput);
      } catch {
        return this.getB3Quote(normalizedInput);
      }
    }

    return this.getB3Quote(normalizedInput);
  }

  async getQuotes(
    assets: IAssetQuoteBatchInput[],
    range: AssetHistoricalRange = '1y',
    interval: AssetHistoricalInterval = '1mo',
  ): Promise<IAssetQuote[]> {
    const quotes = await Promise.all(
      assets.map(async (asset) => {
        try {
          return await this.getQuote({ ...asset, range, interval });
        } catch {
          return null;
        }
      }),
    );

    return quotes.filter((quote): quote is IAssetQuote => quote !== null);
  }

  private async getB3Quote(input: IAssetQuoteInput): Promise<IAssetQuote> {
    const response = await this.request<IBrapiQuoteResponse>(
      `/api/quote/${encodeURIComponent(input.ticker)}`,
      {
        range: input.range,
        interval: input.interval,
        modules: input.modules,
        dividends: input.dividends ? 'true' : undefined,
      },
    );
    const quote =
      response.results.find((item) => item.symbol.toUpperCase() === input.ticker) ??
      response.results[0];

    if (!quote) {
      throw new Error(`Asset ${input.ticker} not found at Brapi`);
    }

    return this.mapQuoteItem(quote, input.type);
  }

  private async getFiiQuote(input: IAssetQuoteInput): Promise<IAssetQuote> {
    const response = await this.request<IBrapiFiiIndicatorsResponse>('/api/v2/fii/indicators', {
      symbols: input.ticker,
    });
    const fii =
      response.fiis.find((item) => item.symbol.toUpperCase() === input.ticker) ?? response.fiis[0];

    if (!fii) {
      throw new Error(`FII ${input.ticker} not found at Brapi`);
    }

    const historicalPrices = await this.getFiiHistoricalPrices(input).catch(() => []);

    return {
      ticker: fii.symbol,
      name: fii.name ?? fii.symbol,
      type: 'FII',
      currency: 'BRL',
      price: fii.price ?? 0,
      changePercent: this.decimalToPercent(fii.monthlyReturn),
      logoUrl: this.logoForTicker(fii.symbol),
      sector: fii.segmentoAtuacao,
      indicators: {
        priceToNav: fii.priceToNav,
        dividendYield12m: this.decimalToPercent(fii.dividendYield12m),
        dividendYield1m: this.decimalToPercent(fii.dividendYield1m),
        totalInvestors: fii.totalInvestors,
      },
      summary: {
        cnpj: fii.cnpj,
        administratorName: fii.administratorName,
        segment: fii.segmentType,
        sector: fii.segmentoAtuacao,
      },
      historicalPrices,
    };
  }

  private async getFiiHistoricalPrices(input: IAssetQuoteInput): Promise<IHistoricalPricePoint[]> {
    const response = await this.request<IBrapiFiiHistoricalResponse>('/api/v2/fii/historical', {
      symbols: input.ticker,
      startDate: this.startDateForRange(input.range),
      endDate: this.formatDate(new Date()),
      sortOrder: 'asc',
    });
    const item =
      response.fiis.find((fii) => fii.symbol.toUpperCase() === input.ticker) ?? response.fiis[0];

    return this.mapHistoricalPrices(item?.historicalDataPrice ?? []);
  }

  private async getCryptoQuote(input: IAssetQuoteInput): Promise<IAssetQuote> {
    const response = await this.request<IBrapiCryptoQuoteResponse>('/api/v2/crypto', {
      coin: input.ticker,
      currency: 'BRL',
      range: input.range,
      interval: input.interval,
    });
    const quote =
      response.coins.find((item) => item.coin.toUpperCase() === input.ticker) ?? response.coins[0];

    if (!quote) {
      throw new Error(`Crypto ${input.ticker} not found at Brapi`);
    }

    return this.mapCryptoQuoteItem(quote);
  }

  private async searchCryptoAssets(input: ISearchAssetsInput): Promise<ISearchAssetsOutput> {
    const response = await this.request<IBrapiCryptoAvailableResponse>('/api/v2/crypto/available', {
      search: input.search,
    });
    const start = (input.page - 1) * input.limit;
    const pageCoins = response.coins.slice(start, start + input.limit);
    const quotes = this.token ? await this.getCryptoQuotes(pageCoins).catch(() => []) : [];
    const quoteMap = new Map(quotes.map((quote) => [quote.ticker, quote]));
    const items = pageCoins.map((coin) => {
      const quote = quoteMap.get(coin);
      return {
        ticker: coin,
        name: quote?.name ?? coin,
        type: 'CRIPTO' as AssetType,
        currency: quote?.currency ?? 'BRL',
        price: quote?.price,
        changePercent: quote?.changePercent,
        volume: quote?.volume,
        marketCap: quote?.marketCap,
        logoUrl: quote?.logoUrl,
      };
    });
    const totalPages = Math.ceil(response.coins.length / input.limit);

    return {
      items,
      pagination: {
        currentPage: input.page,
        totalPages,
        itemsPerPage: input.limit,
        totalCount: response.coins.length,
        hasNextPage: input.page < totalPages,
      },
    };
  }

  private async getCryptoQuotes(coins: string[]): Promise<IAssetQuote[]> {
    if (coins.length === 0) {
      return [];
    }

    const response = await this.request<IBrapiCryptoQuoteResponse>('/api/v2/crypto', {
      coin: coins.join(','),
      currency: 'BRL',
    });

    return response.coins.map((coin) => this.mapCryptoQuoteItem(coin));
  }

  private async request<T>(
    path: string,
    params: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { headers });
    const data = (await response.json().catch(() => ({}))) as unknown;

    if (!response.ok || isBrapiErrorResponse(data)) {
      if (response.status === 401 && !this.token) {
        throw new Error('BRAPI_TOKEN is required for this Brapi asset or endpoint');
      }

      const message = isBrapiErrorResponse(data)
        ? (data.message ?? data.code ?? 'Brapi request failed')
        : `Brapi request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data as T;
  }

  private mapListItem(raw: IBrapiListItem): IMarketAsset {
    return {
      ticker: raw.stock,
      name: raw.name ?? raw.stock,
      type: this.mapBrapiAssetType(raw.type),
      currency: 'BRL',
      price: raw.close,
      changePercent: raw.change,
      volume: raw.volume,
      marketCap: raw.market_cap,
      logoUrl: raw.logo,
      sector: raw.sector,
    };
  }

  private mapQuoteItem(raw: IBrapiQuoteItem, type?: AssetType): IAssetQuote {
    const summary = raw.summaryProfile;

    return {
      ticker: raw.symbol,
      name: raw.longName ?? raw.shortName ?? raw.symbol,
      shortName: raw.shortName,
      longName: raw.longName,
      type: type ?? this.inferAssetType(raw.symbol),
      currency: raw.currency ?? 'BRL',
      price: raw.regularMarketPrice ?? 0,
      change: raw.regularMarketChange,
      changePercent: raw.regularMarketChangePercent,
      dayHigh: raw.regularMarketDayHigh,
      dayLow: raw.regularMarketDayLow,
      previousClose: raw.regularMarketPreviousClose,
      open: raw.regularMarketOpen,
      regularMarketTime: raw.regularMarketTime,
      fiftyTwoWeekLow: raw.fiftyTwoWeekLow,
      fiftyTwoWeekHigh: raw.fiftyTwoWeekHigh,
      volume: raw.regularMarketVolume,
      marketCap: raw.marketCap,
      logoUrl: raw.logourl ?? summary?.logoUrl ?? this.logoForTicker(raw.symbol),
      sector: summary?.sectorDisp ?? summary?.sector ?? undefined,
      indicators: {
        priceEarnings: raw.priceEarnings,
        earningsPerShare: raw.earningsPerShare,
        marketCap: raw.marketCap,
      },
      summary: {
        description: summary?.longBusinessSummary ?? undefined,
        website: summary?.website ?? undefined,
        sector: summary?.sectorDisp ?? summary?.sector ?? undefined,
        industry: summary?.industryDisp ?? summary?.industry ?? undefined,
        cnpj: summary?.cnpj ?? undefined,
        administratorName: summary?.administratorName ?? undefined,
      },
      historicalPrices: this.mapHistoricalPrices(raw.historicalDataPrice ?? []),
    };
  }

  private mapCryptoQuoteItem(raw: IBrapiCryptoQuoteItem): IAssetQuote {
    return {
      ticker: raw.coin,
      name: raw.coinName ?? raw.coin,
      type: 'CRIPTO',
      currency: raw.currency ?? 'BRL',
      price: raw.regularMarketPrice ?? 0,
      change: raw.regularMarketChange,
      changePercent: raw.regularMarketChangePercent,
      dayHigh: raw.regularMarketDayHigh,
      dayLow: raw.regularMarketDayLow,
      regularMarketTime: raw.regularMarketTime,
      volume: raw.regularMarketVolume,
      marketCap: raw.marketCap,
      logoUrl: raw.coinImageUrl,
      indicators: {
        marketCap: raw.marketCap,
      },
      historicalPrices: this.mapHistoricalPrices(raw.historicalDataPrice ?? []),
    };
  }

  private mapHistoricalPrices(points: IBrapiHistoricalPoint[]): IHistoricalPricePoint[] {
    return points
      .filter((point) => point.close !== undefined)
      .map((point) => ({
        date: point.date,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close ?? 0,
        volume: point.volume,
        adjustedClose: point.adjustedClose,
      }));
  }

  private mapAssetTypeToBrapiListType(type?: AssetType): string | undefined {
    if (type === 'ACAO') {
      return 'stock';
    }

    if (type === 'FII') {
      return 'fund';
    }

    if (type === 'BDR') {
      return 'bdr';
    }

    return undefined;
  }

  private mapBrapiAssetType(type?: string): AssetType {
    if (type === 'fund') {
      return 'FII';
    }

    if (type === 'bdr') {
      return 'BDR';
    }

    if (type === 'etf') {
      return 'ETF';
    }

    return 'ACAO';
  }

  private inferAssetType(ticker: string): AssetType {
    if (/^[A-Z]{4}11$/.test(ticker)) {
      return 'FII';
    }

    if (/^[A-Z]{4}34$/.test(ticker)) {
      return 'BDR';
    }

    return 'ACAO';
  }

  private emptySearch(page: number, limit: number): ISearchAssetsOutput {
    return {
      items: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        itemsPerPage: limit,
        totalCount: 0,
        hasNextPage: false,
      },
    };
  }

  private startDateForRange(range: AssetHistoricalRange = '1y'): string | undefined {
    if (range === 'max') {
      return undefined;
    }

    const today = new Date();
    const start = new Date(today);

    switch (range) {
      case '1d':
        start.setDate(today.getDate() - 1);
        break;
      case '2d':
        start.setDate(today.getDate() - 2);
        break;
      case '5d':
        start.setDate(today.getDate() - 5);
        break;
      case '7d':
        start.setDate(today.getDate() - 7);
        break;
      case '1mo':
        start.setMonth(today.getMonth() - 1);
        break;
      case '3mo':
        start.setMonth(today.getMonth() - 3);
        break;
      case '6mo':
        start.setMonth(today.getMonth() - 6);
        break;
      case '2y':
        start.setFullYear(today.getFullYear() - 2);
        break;
      case '5y':
        start.setFullYear(today.getFullYear() - 5);
        break;
      case '10y':
        start.setFullYear(today.getFullYear() - 10);
        break;
      case 'ytd':
        return this.formatDate(new Date(today.getFullYear(), 0, 1));
      case '1y':
      default:
        start.setFullYear(today.getFullYear() - 1);
        break;
    }

    return this.formatDate(start);
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private decimalToPercent(value?: number): number | undefined {
    return value === undefined ? undefined : value * 100;
  }

  private logoForTicker(ticker: string): string {
    return `https://icons.brapi.dev/icons/${ticker}.svg`;
  }
}
