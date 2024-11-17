export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short'
    });
}

export function formatValue(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    
    const absValue = Math.abs(numValue);
    if (absValue >= 1e9) {
        return `${(numValue / 1e9).toFixed(1)}B`;
    } else if (absValue >= 1e6) {
        return `${(numValue / 1e6).toFixed(1)}M`;
    } else if (absValue >= 1e3) {
        return `${(numValue / 1e3).toFixed(1)}K`;
    }
    return numValue.toFixed(1);
}

export function calculateGrowth(data: number[], currentIndex: number): string {
    if (currentIndex < 0 || !data[currentIndex]) return '';
    
    // For YoY comparison, look back 4 quarters
    const prevIndex = currentIndex - 4;
    if (prevIndex < 0 || !data[prevIndex]) {
        // If no YoY data, try QoQ
        const prevQuarterIndex = currentIndex - 1;
        if (prevQuarterIndex < 0 || !data[prevQuarterIndex]) return '';
        
        const qoqGrowth = ((data[currentIndex] - data[prevQuarterIndex]) / Math.abs(data[prevQuarterIndex])) * 100;
        const qoqSign = qoqGrowth > 0 ? '+' : '';
        return ` (QoQ: ${qoqSign}${qoqGrowth.toFixed(1)}%)`;
    }
    
    const yoyGrowth = ((data[currentIndex] - data[prevIndex]) / Math.abs(data[prevIndex])) * 100;
    const yoySign = yoyGrowth > 0 ? '+' : '';
    return ` (YoY: ${yoySign}${yoyGrowth.toFixed(1)}%)`;
}
