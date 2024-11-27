import type { RevenueGeoSegment, FinancialPeriod } from '$lib/types/financialStatements';
import { convertToUSD } from '$lib/utils/currencyConverter';

interface RawRevenueGeoSegment {
    [date: string]: {
        [region: string]: number;
    };
}

export function transformRevenueGeoSegments(
    data: RawRevenueGeoSegment[], 
    symbol: string, 
    isAnnual: boolean,
    exchangeRate: number = 1  // Default to 1 if not provided
): RevenueGeoSegment[] {
    return data.map(item => {
        const [date, segments] = Object.entries(item)[0];
        
        // Clean up segments by removing zero values and convert to USD
        const cleanedSegments = Object.entries(segments).reduce((acc, [key, value]) => {
            if (value !== 0) {
                acc[key] = convertToUSD(value, exchangeRate) ?? 0;
            }
            return acc;
        }, {} as { [key: string]: number });

        // For annual data, always use FY
        // For quarterly data, determine quarter based on date
        let period: FinancialPeriod;
        if (isAnnual) {
            period = 'FY';
        } else {
            const month = date.substring(5, 7);
            switch (month) {
                case '03': period = 'Q1'; break;
                case '06': period = 'Q2'; break;
                case '09': period = 'Q3'; break;
                case '12': period = 'Q4'; break;
                default: period = 'Q4';
            }
        }

        return {
            symbol: symbol.toUpperCase(),
            date,
            reported_currency: 'USD',  // Always USD since we're converting the values
            period,
            segments: cleanedSegments,
            // Not setting id, created_at, or updated_at as they're handled by the database
        };
    });
}
