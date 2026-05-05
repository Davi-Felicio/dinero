import { Injectable } from '@nestjs/common';
import {
  IAssetQuotationService,
  AssetQuote,
} from '../../../domain/services/asset-quotation.domain-service';

@Injectable()
export class BrapiQuotationService implements IAssetQuotationService {
  private readonly BASE_URL = 'https://brapi.dev/api/quote';

  async getQuote(ticker: string): Promise<AssetQuote | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/${ticker}`);
      if (!response.ok) return null;
      const data = (await response.json()) as any;
      const result = data?.results?.[0];
      if (!result) return null;
      return {
        ticker: result.symbol,
        price: result.regularMarketPrice,
        currency: 'BRL',
        change: result.regularMarketChange,
        changePercent: result.regularMarketChangePercent,
      };
    } catch {
      return null;
    }
  }

  async getQuotes(tickers: string[]): Promise<AssetQuote[]> {
    if (tickers.length === 0) return [];
    try {
      const joined = tickers.join(',');
      const response = await fetch(`${this.BASE_URL}/${joined}`);
      if (!response.ok) return [];
      const data = (await response.json()) as any;
      return (data?.results ?? []).map((r: any) => ({
        ticker: r.symbol,
        price: r.regularMarketPrice,
        currency: 'BRL',
        change: r.regularMarketChange,
        changePercent: r.regularMarketChangePercent,
      }));
    } catch {
      return [];
    }
  }
}
