import type { FinancialData, IncomeStatement, BalanceSheet, CashFlowStatement, RevenueSegment, RevenueGeoSegment } from '$lib/types/financialStatements';

type FinancialStatement = IncomeStatement | BalanceSheet | CashFlowStatement;

function isBalanceSheet(statement: FinancialStatement): boolean {
    return 'total_assets' in statement;
}

function calculateTTM(statements: FinancialStatement[]): FinancialStatement[] {
    // Get quarterly statements sorted by date (newest first)
    const quarterlyStatements = statements
        .filter(stmt => stmt.period !== 'FY' && stmt.period !== 'TTM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (quarterlyStatements.length < 4) return [];

    const ttmStatements: FinancialStatement[] = [];

    // Calculate TTM for each quarter point
    for (let i = 0; i < quarterlyStatements.length - 3; i++) {
        const currentQuarter = quarterlyStatements[i];
        const previousQuarters = quarterlyStatements.slice(i, i + 4);
        
        // Create TTM entry based on current quarter
        const ttmEntry = { ...currentQuarter };
        ttmEntry.period = 'TTM';

        // Sum numeric fields from the last 4 quarters
        Object.keys(ttmEntry).forEach(key => {
            const value = ttmEntry[key];
            if (
                typeof value === 'number' && 
                !key.includes('ratio') && 
                key !== 'id' &&
                key !== 'weighted_average_shs_out' &&
                key !== 'weighted_average_shs_out_dil'
            ) {
                const sum = previousQuarters.reduce((acc, q) => acc + (Number(q[key]) || 0), 0);
                ttmEntry[key] = Number(sum.toFixed(2));
            }
        });

        ttmStatements.push(ttmEntry);
    }

    return ttmStatements.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

function calculateSegmentsTTM<T extends RevenueSegment | RevenueGeoSegment>(segments: T[]): T[] {
    // Get quarterly segments sorted by date (newest first)
    const quarterlySegments = segments
        .filter(seg => seg.period !== 'FY' && seg.period !== 'TTM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (quarterlySegments.length < 4) return [];

    const ttmSegments: T[] = [];

    // Calculate TTM for each quarter point
    for (let i = 0; i < quarterlySegments.length - 3; i++) {
        const currentQuarter = quarterlySegments[i];
        const previousQuarters = quarterlySegments.slice(i, i + 4);
        
        // Create TTM entry based on current quarter
        const ttmEntry = {
            symbol: currentQuarter.symbol,
            date: currentQuarter.date,
            reported_currency: currentQuarter.reported_currency,
            period: 'TTM',
            segments: {}
        } as T;

        // Get all unique segment names across the 4 quarters
        const segmentNames = new Set<string>();
        previousQuarters.forEach(q => {
            Object.keys(q.segments).forEach(name => segmentNames.add(name));
        });

        // Sum each segment across 4 quarters
        segmentNames.forEach(name => {
            const sum = previousQuarters.reduce((acc, q) => acc + (q.segments[name] || 0), 0);
            ttmEntry.segments[name] = Number(sum.toFixed(2));
        });

        ttmSegments.push(ttmEntry);
    }

    return ttmSegments.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

function filterSegments<T extends RevenueSegment | RevenueGeoSegment>(
    segments: T[] | undefined,
    period: 'annual' | 'quarterly' | 'ttm',
    years: number
): T[] {
    if (!segments) return [];
    
    let periodFiltered: T[];
    
    if (period === 'ttm') {
        periodFiltered = calculateSegmentsTTM(segments);
        if (periodFiltered.length === 0) {
            periodFiltered = segments.filter(stmt => stmt.period !== 'FY' && stmt.period !== 'TTM');
        }
    } else {
        periodFiltered = segments.filter(stmt => 
            period === 'annual' ? stmt.period === 'FY' : stmt.period !== 'FY'
        );
    }

    if (years === 0) return periodFiltered;

    const sorted = [...periodFiltered].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const limit = period === 'annual' ? years : years * 4;
    const filtered = sorted.slice(0, limit);
    
    return filtered;
}

export function filterFinancialStatementsByPeriod(
    data: FinancialData, 
    period: 'annual' | 'quarterly' | 'ttm', 
    years: number
): FinancialData {
    const filterMostRecent = <T extends FinancialStatement>(statements: T[]): T[] => {
        let periodFiltered: T[];
        
        if (period === 'ttm' && !isBalanceSheet(statements[0])) {
            periodFiltered = calculateTTM(statements) as T[];
            if (periodFiltered.length === 0) {
                periodFiltered = statements.filter(stmt => stmt.period !== 'FY' && stmt.period !== 'TTM');
            }
        } else {
            periodFiltered = statements.filter(stmt => 
                period === 'annual' ? stmt.period === 'FY' : stmt.period !== 'FY'
            );
        }

        if (years === 0) return periodFiltered;

        const sorted = [...periodFiltered].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const limit = period === 'annual' ? years : years * 4;
        const filtered = sorted.slice(0, limit);
        
        return filtered;
    };

    return {
        income_statements: filterMostRecent(data.income_statements),
        balance_sheets: filterMostRecent(data.balance_sheets),
        cash_flow_statements: filterMostRecent(data.cash_flow_statements),
        revenue_segments: filterSegments(data.revenue_segments, period, years),
        revenue_geo_segments: filterSegments(data.revenue_geo_segments, period, years)
    };
}
