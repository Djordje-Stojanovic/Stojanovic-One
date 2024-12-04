import { marginColors, returnMetricColors } from '../utils/chartConfig';

export function calculateTTM(data: number[], currentIndex: number): number | null {
    if (currentIndex < 3) return null;
    
    // Sum up the last 4 quarters
    const ttm = data.slice(currentIndex - 3, currentIndex + 1).reduce((sum, val) => {
        return val !== null ? sum + val : sum;
    }, 0);
    
    return ttm;
}

export function getMarginColor(metricName: string): string {
    const marginTypes = [
        'Net Income Margin',
        'Gross Profit Margin',
        'Operating Margin',
        'EBITDA Margin',
        'FCF Margin',
        'Operating Cash Flow Margin',  // Fixed: Changed from 'Op. Cash Flow Margin' to match exact name
        'Op. Cash Flow Margin'         // Added alternative name for safety
    ];
    const index = marginTypes.indexOf(metricName);
    // If using alternative name, map to same color
    return marginColors[index === 6 ? 5 : index % marginColors.length];
}

export function getReturnMetricColor(metricName: string): string {
    const returnTypes = [
        'ROIC',
        'ROCE',
        'ROE',
        'ROA'
    ];
    const index = returnTypes.indexOf(metricName);
    return returnMetricColors[index % returnMetricColors.length];
}

// Calculate Return on Invested Capital (ROIC)
// ROIC = NOPAT / Invested Capital
// NOPAT = Operating Income * (1 - Tax Rate)
// Invested Capital = Total Assets - Current Liabilities
export function calculateROIC(operatingIncome: number, incomeTax: number, totalAssets: number, currentLiabilities: number): number {
    const taxRate = incomeTax / operatingIncome;
    const nopat = operatingIncome * (1 - taxRate);
    const investedCapital = totalAssets - currentLiabilities;
    return (nopat / investedCapital) * 100;
}

// Calculate Return on Capital Employed (ROCE)
// ROCE = EBIT / Capital Employed
// Capital Employed = Total Assets - Current Liabilities
export function calculateROCE(operatingIncome: number, totalAssets: number, currentLiabilities: number): number {
    const capitalEmployed = totalAssets - currentLiabilities;
    return (operatingIncome / capitalEmployed) * 100;
}

// Calculate Return on Equity (ROE)
// ROE = Net Income / Total Equity
export function calculateROE(netIncome: number, totalEquity: number): number {
    return (netIncome / totalEquity) * 100;
}

// Calculate Return on Assets (ROA)
// ROA = Net Income / Total Assets
export function calculateROA(netIncome: number, totalAssets: number): number {
    return (netIncome / totalAssets) * 100;
}
