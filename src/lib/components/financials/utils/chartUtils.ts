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

export function calculateMultiYearGrowth(data: { date: string; value: number }[], years: number): number | null {
    if (!data || data.length < 2) return null;
    
    // Sort data by date in ascending order
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Get the most recent value
    const mostRecent = sortedData[sortedData.length - 1];
    
    // Find the value closest to X years ago
    const targetDate = new Date(mostRecent.date);
    targetDate.setFullYear(targetDate.getFullYear() - years);
    
    // Find the closest data point to our target date
    const historicalData = sortedData.reduce((closest, current) => {
        const currentDiff = Math.abs(new Date(current.date).getTime() - targetDate.getTime());
        const closestDiff = Math.abs(new Date(closest.date).getTime() - targetDate.getTime());
        return currentDiff < closestDiff ? current : closest;
    });
    
    // Calculate CAGR
    const yearDiff = (new Date(mostRecent.date).getTime() - new Date(historicalData.date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (yearDiff < years * 0.75) return null; // Ensure we have at least 75% of the requested time period
    
    const cagr = (Math.pow(mostRecent.value / historicalData.value, 1 / yearDiff) - 1) * 100;
    return isFinite(cagr) ? Number(cagr.toFixed(2)) : null;
}

export function formatGrowthRate(rate: number | null): string {
    if (rate === null) return 'N/A';
    const sign = rate > 0 ? '+' : '';
    return `${sign}${rate.toFixed(2)}%`;
}
