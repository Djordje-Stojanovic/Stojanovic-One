import type { FinancialData } from '$lib/types/financialStatements';
import type { StockPriceData } from '$lib/types/stockPrices';

interface CompanyInfo {
    ceo?: string;
    sector?: string;
    industry?: string;
    marketCap?: number;
    beta?: number;
    exchange?: string;
    currency?: string;
    lastDividend?: number;
    priceRange?: string;
    employees?: number;
    ipoDate?: string;
    location?: string;
    description?: string;
    website?: string;
    price?: number;
}

interface CompanyData {
    symbol: string;
    companyName: string | null;
    financialData: FinancialData;
    stockPriceData: StockPriceData | null;
    companyInfo?: CompanyInfo;
}


export function generateAIPrompt(data: CompanyData): string {
    const { symbol, companyName, financialData, stockPriceData } = data;
    
    return `As an expert financial analyst, provide a detailed investment analysis for ${companyName || symbol}.

Company Profile:
Symbol: ${symbol}
Name: ${companyName || 'N/A'}
CEO: ${data.companyInfo?.ceo || 'N/A'}
Sector: ${data.companyInfo?.sector || 'N/A'}
Industry: ${data.companyInfo?.industry || 'N/A'}
Market Cap: ${data.companyInfo?.marketCap ? formatCurrency(data.companyInfo.marketCap.toString()) : 'N/A'}
Stock Price: ${data.companyInfo?.price ? formatCurrency(data.companyInfo.price.toString()) : 'N/A'}
Employees: ${data.companyInfo?.employees ? formatEmployees(data.companyInfo.employees) : 'N/A'}
Location: ${data.companyInfo?.location || 'N/A'}
Exchange: ${data.companyInfo?.exchange || 'N/A'}
Beta: ${data.companyInfo?.beta || 'N/A'}
52-Week Range: ${data.companyInfo?.priceRange || 'N/A'}
Last Dividend: ${data.companyInfo?.lastDividend ? formatCurrency(data.companyInfo.lastDividend.toString()) : 'N/A'}

Financial Data (Last ${financialData.income_statements.length} Quarters):

Financial Performance (Last 10 Years):

Annual Growth & Margins:
${financialData.income_statements
    .filter(stmt => stmt.period === 'TTM')
    .slice(0, 10)
            .map((stmt) => {
        const revenue = parseFloat(stmt.revenue.toString());
        const operatingIncome = parseFloat(stmt.operating_income.toString());
        const netIncome = parseFloat(stmt.net_income.toString());
        
        return `
${stmt.calendar_year}:
- Revenue: ${formatCurrency(revenue.toString())}
- Operating Income: ${formatCurrency(operatingIncome.toString())}
- Net Income: ${formatCurrency(netIncome.toString())}
- Operating Margin: ${((operatingIncome / revenue) * 100).toFixed(1)}%
- Net Margin: ${((netIncome / revenue) * 100).toFixed(1)}%`;
    }).join('\n')}

Balance Sheet Metrics (Latest):
${(() => {
    const latest = financialData.balance_sheets[0];
    const totalEquity = parseFloat(latest.total_equity.toString());
    const totalAssets = parseFloat(latest.total_assets.toString());
    const totalDebt = parseFloat(latest.total_debt.toString());
    const netDebt = parseFloat(latest.net_debt.toString());
    
    return `
- Total Assets: ${formatCurrency(totalAssets.toString())}
- Total Debt: ${formatCurrency(totalDebt.toString())}
- Net Debt: ${formatCurrency(netDebt.toString())}
- Total Equity: ${formatCurrency(totalEquity.toString())}
- Debt/Equity: ${(totalDebt / totalEquity).toFixed(2)}
- Return on Equity: ${formatCurrency(((parseFloat(financialData.income_statements[0].net_income) / totalEquity) * 100).toFixed(1) + '%')}
- Return on Assets: ${formatCurrency(((parseFloat(financialData.income_statements[0].net_income) / totalAssets) * 100).toFixed(1) + '%')}`;
})()}

Cash Flow & Shareholder Returns (Latest Annual):
${(() => {
    const latest = financialData.cash_flow_statements[0];
    const freeCashFlow = parseFloat(latest.free_cash_flow.toString());
    const operatingCashFlow = parseFloat(latest.operating_cash_flow.toString());
    const capex = parseFloat(latest.capital_expenditure.toString());
    const dividendsPaid = parseFloat(latest.dividends_paid.toString());
    const stockRepurchased = parseFloat(latest.common_stock_repurchased.toString());
    const revenue = parseFloat(financialData.income_statements[0].revenue.toString());
    
    return `
- Operating Cash Flow: ${formatCurrency(operatingCashFlow.toString())}
- Free Cash Flow: ${formatCurrency(freeCashFlow.toString())}
- FCF Margin: ${((freeCashFlow / revenue) * 100).toFixed(1)}%
- Capital Expenditure: ${formatCurrency(Math.abs(capex).toString())}
- Dividends Paid: ${formatCurrency(Math.abs(dividendsPaid).toString())}
- Stock Buybacks: ${formatCurrency(Math.abs(stockRepurchased).toString())}
- Total Shareholder Return: ${formatCurrency((Math.abs(dividendsPaid) + Math.abs(stockRepurchased)).toString())}`;
})()}

Revenue Mix (Latest Annual):
${(() => {
    const latestSegment = financialData.revenue_segments?.[0];
    const latestGeo = financialData.revenue_geo_segments?.[0];
    
    let segmentText = 'No segment data available.';
    if (latestSegment) {
        const total = Object.values(latestSegment.segments).reduce((sum, val) => sum + parseFloat(val.toString()), 0);
        segmentText = Object.entries(latestSegment.segments)
            .map(([name, value]) => {
                const amount = parseFloat(value.toString());
                return `- ${name}: ${((amount / total) * 100).toFixed(1)}%`;
            })
            .join('\n');
    }
    
    let geoText = 'No geographic data available.';
    if (latestGeo) {
        const total = Object.values(latestGeo.segments).reduce((sum, val) => sum + parseFloat(val.toString()), 0);
        geoText = Object.entries(latestGeo.segments)
            .map(([region, value]) => {
                const amount = parseFloat(value.toString());
                return `- ${region}: ${((amount / total) * 100).toFixed(1)}%`;
            })
            .join('\n');
    }
    
    return `
Business Segments:
${segmentText}

Geographic Mix:
${geoText}`;
})()}

Stock Price History:
${stockPriceData?.historical.slice(0, 5).map(price => `- ${price.date}: ${formatCurrency(price.adj_close?.toString() || 'N/A')}`).join('\n')}

Company Description:
${data.companyInfo?.description || 'No description available.'}

Please provide a comprehensive analysis with the following sections (use ** for section headers):

**Business Overview**
- Core business model explanation
- How the company makes money (unit economics)
- Key revenue streams and pricing strategy
- Main products/services

**Financial Analysis**
- Revenue and profitability trends
- Cash flow analysis
- Balance sheet strength
- Key financial ratios and metrics

**Market Position**
- Competitive advantages
- Market share and industry position
- Key competitors
- Barriers to entry

**Growth Strategy**
- Current growth initiatives
- Market expansion opportunities
- R&D and innovation focus
- M&A strategy (if applicable)

**Risk Analysis**
- Key business risks
- Industry challenges
- Regulatory concerns
- Competitive threats

**Investment Thesis**
- Key investment merits
- Growth catalysts
- Valuation perspective
- Potential red flags

Format the response with clear sections using ** headers and bullet points for easy reading. Focus on providing actionable insights for investors.`;
}

function formatEmployees(value: number): string {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toString();
}

function formatCurrency(value: number | string | null | undefined): string {
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
