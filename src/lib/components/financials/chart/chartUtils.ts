import { marginColors } from '../utils/chartConfig';

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
        'Op. Cash Flow Margin'
    ];
    const index = marginTypes.indexOf(metricName);
    return marginColors[index % marginColors.length];
}
