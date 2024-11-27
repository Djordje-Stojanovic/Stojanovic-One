import { db } from '$lib/supabaseClient';
import type { FinancialData } from './types';
import type { IncomeStatement, BalanceSheet, CashFlowStatement, RevenueSegment, RevenueGeoSegment } from '$lib/types/financialStatements';

export async function getExistingData(symbol: string): Promise<FinancialData> {
    const [
        existingIncomeStmts,
        existingBalanceSheets,
        existingCashFlowStmts,
        existingRevenueSegments,
        existingRevenueGeoSegments
    ] = await Promise.all([
        db.from('income_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
        db.from('balance_sheets').select('*').eq('symbol', symbol).order('date', { ascending: false }),
        db.from('cash_flow_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
        db.from('revenue_segments').select('*').eq('symbol', symbol).order('date', { ascending: false }),
        db.from('revenue_geo_segments').select('*').eq('symbol', symbol).order('date', { ascending: false })
    ]);

    return {
        income_statements: existingIncomeStmts.data as IncomeStatement[] || [],
        balance_sheets: existingBalanceSheets.data as BalanceSheet[] || [],
        cash_flow_statements: existingCashFlowStmts.data as CashFlowStatement[] || [],
        revenue_segments: existingRevenueSegments.data as RevenueSegment[] || [],
        revenue_geo_segments: existingRevenueGeoSegments.data as RevenueGeoSegment[] || []
    };
}

export async function upsertFinancialData<T extends { symbol: string; date: string; period: string }>(
    tableName: string,
    data: T[],
    returnData = false
) {
    if (!Array.isArray(data) || data.length === 0) {
        console.log(`No data to insert for ${tableName}`);
        return { data: [] };
    }

    try {
        const query = db
            .from(tableName)
            .upsert(data, {
                onConflict: 'symbol,date,period',
                ignoreDuplicates: true
            });

        if (returnData) {
            query.select();
        }

        const result = await query;

        if (result.error) {
            console.error(`Error upserting ${tableName}:`, result.error);
            throw result.error;
        }

        return result;
    } catch (error) {
        console.error(`Error in upsertFinancialData for ${tableName}:`, error);
        throw error;
    }
}

export async function upsertRevenueSegments(
    annualData: RevenueSegment[],
    quarterlyData: RevenueSegment[],
    symbol: string
): Promise<RevenueSegment[]> {
    try {
        // Insert annual data
        if (annualData.length > 0) {
            const { error: annualError } = await db
                .from('revenue_segments')
                .upsert(annualData, {
                    onConflict: 'symbol,date,period',
                    ignoreDuplicates: true
                })
                .select();

            if (annualError) {
                console.error('Error upserting annual revenue segments:', annualError);
                throw annualError;
            }
        }

        // Insert quarterly data
        if (quarterlyData.length > 0) {
            const { error: quarterlyError } = await db
                .from('revenue_segments')
                .upsert(quarterlyData, {
                    onConflict: 'symbol,date,period',
                    ignoreDuplicates: true
                })
                .select();

            if (quarterlyError) {
                console.error('Error upserting quarterly revenue segments:', quarterlyError);
                throw quarterlyError;
            }
        }

        // Return all data
        const { data, error } = await db
            .from('revenue_segments')
            .select('*')
            .eq('symbol', symbol)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error selecting revenue segments:', error);
            throw error;
        }

        return data as RevenueSegment[];
    } catch (error) {
        console.error('Error in upsertRevenueSegments:', error);
        throw error;
    }
}

export async function upsertRevenueGeoSegments(
    annualData: RevenueGeoSegment[],
    quarterlyData: RevenueGeoSegment[],
    symbol: string
): Promise<RevenueGeoSegment[]> {
    try {
        // Insert annual data
        if (annualData.length > 0) {
            const { error: annualError } = await db
                .from('revenue_geo_segments')
                .upsert(annualData, {
                    onConflict: 'symbol,date,period',
                    ignoreDuplicates: true
                })
                .select();

            if (annualError) {
                console.error('Error upserting annual revenue geo segments:', annualError);
                throw annualError;
            }
        }

        // Insert quarterly data
        if (quarterlyData.length > 0) {
            const { error: quarterlyError } = await db
                .from('revenue_geo_segments')
                .upsert(quarterlyData, {
                    onConflict: 'symbol,date,period',
                    ignoreDuplicates: true
                })
                .select();

            if (quarterlyError) {
                console.error('Error upserting quarterly revenue geo segments:', quarterlyError);
                throw quarterlyError;
            }
        }

        // Return all data
        const { data, error } = await db
            .from('revenue_geo_segments')
            .select('*')
            .eq('symbol', symbol)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error selecting revenue geo segments:', error);
            throw error;
        }

        return data as RevenueGeoSegment[];
    } catch (error) {
        console.error('Error in upsertRevenueGeoSegments:', error);
        throw error;
    }
}
