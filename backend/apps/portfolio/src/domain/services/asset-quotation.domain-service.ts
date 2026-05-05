export interface AssetQuote {
  ticker: string;
  price: number;
  currency: string;
  change?: number;
  changePercent?: number;
}

export interface IAssetQuotationService {
  getQuote(ticker: string): Promise<AssetQuote | null>;
  getQuotes(tickers: string[]): Promise<AssetQuote[]>;
}
