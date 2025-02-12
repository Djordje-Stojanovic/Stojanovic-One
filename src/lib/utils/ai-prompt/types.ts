import type { FinancialData } from '$lib/types/financialStatements';
import type { StockPriceData } from '$lib/types/stockPrices';

export interface CompanyInfo {
    ceo?: string;
    sector?: string;
    industry?: string;
    marketCap?: number;
    beta?: number;
    exchange?: string;
    currency?: string;
    lastDividend?: number;
    priceRange?: string;
    employees?: number;
    ipoDate?: string;
    location?: string;
    description?: string;
    website?: string;
    price?: number;
}

export interface CompanyData {
    symbol: string;
    companyName: string | null;
    financialData: FinancialData;
    stockPriceData: StockPriceData | null;
    companyInfo?: CompanyInfo;
}
