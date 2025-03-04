export interface StockMetadata {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  market_cap: number;
  pe_ratio?: number;
  exchange: string;
  logo_url: string;
  country: string;
}

export interface UserStock {
  stock_metadata_id: string | number;
  list_name: string;
}

export type MarketCapCategory = 'Micro' | 'Small' | 'Mid' | 'Large' | 'Mega' | '';

export type SortDirection = 'asc' | 'desc';

export function formatMarketCap(value: number): string {
  if (!value) return 'N/A';
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

export function formatPERatio(value: number | undefined): string {
  if (!value) return 'N/A';
  return value.toFixed(2);
}
