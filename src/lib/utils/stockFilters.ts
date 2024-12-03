import type { StockMetadata, MarketCapCategory } from '$lib/components/stock-lookup/Types';

const marketCapRanges = {
  Micro: { max: 2_000_000_000 },
  Small: { min: 2_000_000_000, max: 10_000_000_000 },
  Mid: { min: 10_000_000_000, max: 50_000_000_000 },
  Large: { min: 50_000_000_000, max: 500_000_000_000 },
  Mega: { min: 500_000_000_000 }
} as const;

export function getMarketCapCategory(marketCap: number): MarketCapCategory {
  if (marketCap < marketCapRanges.Micro.max) return 'Micro';
  if (marketCap < marketCapRanges.Small.max) return 'Small';
  if (marketCap < marketCapRanges.Mid.max) return 'Mid';
  if (marketCap < marketCapRanges.Large.max) return 'Large';
  return 'Mega';
}

export function compareValues(a: string | number | null | undefined, b: string | number | null | undefined, direction: number): number {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'string' && typeof b === 'string') {
    return direction * a.localeCompare(b);
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return direction * (a - b);
  }
  return 0;
}

export function filterStocks(
  stocks: StockMetadata[],
  searchQuery: string,
  sectorFilter: string,
  exchangeFilter: string,
  countryFilter: string,
  marketCapFilter: MarketCapCategory,
  sortColumn: keyof StockMetadata,
  sortDirection: number
): StockMetadata[] {
  return stocks
    .filter((stock) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        stock.symbol.toLowerCase().includes(query) ||
        stock.company_name.toLowerCase().includes(query);
      const matchesSector = !sectorFilter || stock.sector === sectorFilter;
      const matchesExchange = !exchangeFilter || stock.exchange === exchangeFilter;
      const matchesCountry = !countryFilter || stock.country === countryFilter;
      const matchesMarketCap = !marketCapFilter || getMarketCapCategory(stock.market_cap) === marketCapFilter;
      return matchesSearch && matchesSector && matchesExchange && matchesCountry && matchesMarketCap;
    })
    .sort((a, b) => compareValues(a[sortColumn], b[sortColumn], sortDirection));
}
