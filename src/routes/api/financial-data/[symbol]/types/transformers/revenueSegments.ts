import type { RevenueSegment } from '$lib/types/financialStatements';

interface RawRevenueSegment {
    [date: string]: {
        [segment: string]: number;
    };
}

export function transformRevenueSegments(data: RawRevenueSegment[], symbol: string): RevenueSegment[] {
    return data.map(item => {
        const [date, segments] = Object.entries(item)[0];
        const period = date.endsWith('-12-31') ? 'FY' : 
                      date.endsWith('-03-31') ? 'Q1' :
                      date.endsWith('-06-30') ? 'Q2' :
                      date.endsWith('-09-30') ? 'Q3' : 'Q4';

        return {
            symbol: symbol.toUpperCase(),
            date,
            reported_currency: 'USD', // FMP data is in USD
            period,
            segments,
            // Not setting id, created_at, or updated_at as they're handled by the database
        };
    });
}
