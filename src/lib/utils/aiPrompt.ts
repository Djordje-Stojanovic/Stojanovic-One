import type { FinancialData } from '$lib/types/financialStatements';
import type { StockPriceData } from '$lib/types/stockPrices';

interface CompanyData {
    symbol: string;
    companyName: string | null;
    financialData: FinancialData;
    stockPriceData: StockPriceData | null;
    companyInfo?: {
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
    };
}

export function generateAIPrompt(data: CompanyData): string {
    const { symbol, companyName, financialData, stockPriceData } = data;
    
    // Get latest financial data
    const latestIncomeStatement = financialData.income_statements[0];
    const latestBalanceSheet = financialData.balance_sheets[0];
    const latestCashFlow = financialData.cash_flow_statements[0];
    
    // Get latest stock price
    const latestPrice = stockPriceData?.historical[0];

    return `As an expert financial analyst, provide a detailed investment analysis for ${companyName || symbol}.

Company Profile:
Symbol: ${symbol}
Name: ${companyName || 'N/A'}
CEO: ${data.companyInfo?.ceo || 'N/A'}
Sector: ${data.companyInfo?.sector || 'N/A'}
Industry: ${data.companyInfo?.industry || 'N/A'}
Market Cap: ${data.companyInfo?.marketCap ? formatCurrency(data.companyInfo.marketCap) : 'N/A'}
Stock Price: ${latestPrice?.adj_close ? formatCurrency(latestPrice.adj_close) : 'N/A'}
Employees: ${data.companyInfo?.employees ? formatEmployees(data.companyInfo.employees) : 'N/A'}
Location: ${data.companyInfo?.location || 'N/A'}

Financial Snapshot:
Revenue: ${formatCurrency(latestIncomeStatement?.revenue)}
Net Income: ${formatCurrency(latestIncomeStatement?.netIncome)}
Total Assets: ${formatCurrency(latestBalanceSheet?.totalAssets)}
Total Liabilities: ${formatCurrency(latestBalanceSheet?.totalLiabilities)}
Free Cash Flow: ${formatCurrency(latestCashFlow?.freeCashFlow)}

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
