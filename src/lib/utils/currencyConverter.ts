import { VITE_FMP_API_KEY } from '$env/static/private';

export async function getExchangeRate(fromCurrency: string): Promise<number> {
    if (fromCurrency === 'USD') return 1;
    
    try {
        const response = await fetch(
            `https://financialmodelingprep.com/api/v3/quote/${fromCurrency}USD?apikey=${VITE_FMP_API_KEY}`
        );
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
            return data[0].price;
        }
        throw new Error(`Could not get exchange rate for ${fromCurrency}`);
    } catch (error) {
        console.error('Exchange rate error:', error);
        throw error;
    }
}

export function convertToUSD(value: number | null, exchangeRate: number): number | null {
    if (value === null) return null;
    return Number((value * exchangeRate).toFixed(2));
}

export function convertStatementToUSD(
    statement: Record<string, unknown>,
    exchangeRate: number,
    excludeFields: string[] = ['eps', 'eps_diluted', 'ratio', 'date', 'symbol', 'reported_currency', 'cik', 'filling_date', 'accepted_date', 'calendar_year', 'period']
): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(statement).map(([key, value]) => [
            key,
            typeof value === 'number' && !excludeFields.some(field => key.toLowerCase().includes(field.toLowerCase()))
                ? convertToUSD(value, exchangeRate)
                : value
        ])
    );
}
