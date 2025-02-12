export function formatEmployees(value: number): string {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toString();
}

export function formatCurrency(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return 'N/A';
    
    // If value is already a string with a percentage sign, return it
    if (typeof value === 'string' && value.endsWith('%')) return value;
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return 'N/A';
    
    // Convert to billions for large numbers
    if (Math.abs(numValue) >= 1e9) {
        return `$${(numValue / 1e9).toFixed(2)}B`;
    }
    // Convert to millions for medium numbers
    if (Math.abs(numValue) >= 1e6) {
        return `$${(numValue / 1e6).toFixed(2)}M`;
    }
    // Format smaller numbers
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(numValue);
}
