// Database model (snake_case)
export interface StockPrice {
    id?: bigint;
    symbol: string;
    date: string;
    reported_currency: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    adj_close: number | null;
    volume: number;
    unadjusted_volume: number;
    change: number | null;
    change_percent: number | null;
    vwap: number | null;
    change_over_time: number | null;
    created_at?: string;
    updated_at?: string;
}

// FMP API response (camelCase)
export interface FMPStockPrice {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjClose: number;
    volume: number;
    unadjustedVolume: number;
    change: number;
    changePercent: number;
    vwap: number;
    label: string;
    changeOverTime: number;
}

export interface FMPStockPriceResponse {
    symbol: string;
    historical: FMPStockPrice[];
}

export interface StockPriceData {
    symbol: string;
    historical: StockPrice[];
}

// Helper type for database operations
export type StockPriceInsert = Omit<StockPrice, 'id' | 'created_at' | 'updated_at'>;
