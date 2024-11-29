import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '$lib/types/financialStatements';
import type { ChartDataPoint } from '../types/ChartTypes';

/**
 * Extracts metric data from financial statements
 * @param statements Array of financial statements
 * @param fieldName Name of the field to extract
 * @returns Array of data points sorted by date
 */
export function extractMetricData(
    statements: (IncomeStatement | BalanceSheet | CashFlowStatement)[], 
    fieldName: string
): ChartDataPoint[] {
    return statements
        .filter(stmt => {
            const value = stmt[fieldName as keyof typeof stmt];
            return typeof value === 'number' && !isNaN(value);
        })
        .map(stmt => ({
            date: stmt.date,
            value: stmt[fieldName as keyof typeof stmt] as number
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Extracts segment data from revenue segments
 * @param segments Array of segment data
 * @param segmentName Name of the segment to extract
 * @returns Array of data points sorted by date
 */
export function extractSegmentData(
    segments: { date: string; segments: { [key: string]: number } }[] | undefined, 
    segmentName: string
): ChartDataPoint[] {
    if (!segments) return [];
    
    return segments
        .filter(stmt => {
            const value = stmt.segments[segmentName];
            return typeof value === 'number' && !isNaN(value);
        })
        .map(stmt => ({
            date: stmt.date,
            value: stmt.segments[segmentName]
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Combines and deduplicates data points from multiple sources
 * @param dataSets Arrays of data points to combine
 * @returns Deduplicated and sorted array of data points
 */
export function combineDataSets(...dataSets: ChartDataPoint[][]): ChartDataPoint[] {
    const uniqueDates = new Set<string>();
    return dataSets
        .flat()
        .filter(point => {
            if (uniqueDates.has(point.date)) return false;
            uniqueDates.add(point.date);
            return true;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
