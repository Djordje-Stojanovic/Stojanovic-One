import type { ChartMetric } from '../types';
import type { BaseFinancialStatement } from '$lib/types/financialStatements';

export function loadShowChart(): boolean {
    try {
        return localStorage.getItem('showChart') === 'true';
    } catch (e) {
        console.error('Error loading show chart state:', e);
        return false;
    }
}

export function saveShowChart(show: boolean) {
    try {
        localStorage.setItem('showChart', show.toString());
    } catch (e) {
        console.error('Error saving show chart state:', e);
    }
}

export function loadSelectedMetrics(): string[] {
    try {
        const stored = localStorage.getItem('selectedMetrics');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error loading selected metrics:', e);
        return [];
    }
}

export function saveSelectedMetrics(metrics: string[]) {
    try {
        localStorage.setItem('selectedMetrics', JSON.stringify(metrics));
    } catch (e) {
        console.error('Error saving selected metrics:', e);
    }
}

export function loadSelectedPeriod(): 'annual' | 'quarterly' | 'ttm' {
    try {
        const stored = localStorage.getItem('selectedPeriod');
        return (stored as 'annual' | 'quarterly' | 'ttm') || 'annual';
    } catch (e) {
        console.error('Error loading selected period:', e);
        return 'annual';
    }
}

export function saveSelectedPeriod(period: 'annual' | 'quarterly' | 'ttm') {
    try {
        localStorage.setItem('selectedPeriod', period);
    } catch (e) {
        console.error('Error saving selected period:', e);
    }
}

export function loadSelectedYears(): number {
    try {
        const stored = localStorage.getItem('selectedYears');
        return stored ? parseInt(stored, 10) : 10;
    } catch (e) {
        console.error('Error loading selected years:', e);
        return 10;
    }
}

export function saveSelectedYears(years: number) {
    try {
        localStorage.setItem('selectedYears', years.toString());
    } catch (e) {
        console.error('Error saving selected years:', e);
    }
}

interface DataPoint {
    date: string;
    value: number | null;
}

export function updateChartMetrics(
    selectedMetricNames: string[],
    statements: BaseFinancialStatement[]
): ChartMetric[] {
    return selectedMetricNames.map(name => {
        const metricData: DataPoint[] = statements.map(statement => {
            const value = statement[name.toLowerCase() as keyof typeof statement];
            return {
                date: statement.date,
                value: typeof value === 'number' ? value : null
            };
        });

        return {
            name,
            data: metricData
                .filter((d): d is { date: string; value: number } => d.value !== null)
        };
    });
}
