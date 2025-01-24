export interface StockPrice {
    date: string;
    adj_close: number;
}

export interface MetricResult {
    values: number[];
    dates: string[];
}

export interface ValuationMetricConfig {
    name: string;
    color: string;
    bgColor: string;
}
