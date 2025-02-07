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
    
    return `As a buy-side investment analyst at a high-quality value investment firm, provide a comprehensive business analysis and investment thesis for ${companyName || symbol}. Focus on understanding the business model deeply, competitive advantages, and long-term value creation potential.

Key Analysis Requirements:
- Deep dive into how the business actually works and makes money
- Focus on unit economics and value creation at the operational level
- Identify and analyze sustainable competitive advantages (moats)
- Understand the industry structure and competitive dynamics
- Evaluate management's capital allocation and reinvestment opportunities
- Assess the durability and sustainability of the business model
- Identify key risks to the business model and competitive position

Analysis Style:
- Write as if you're researching and then presenting a potential long-term investment to Warren Buffett or telling him why you're not interested
- Focus on business quality and competitive position rather than short-term metrics
- Emphasize understanding the business model over technical analysis
- Look for evidence of pricing power and high returns on invested capital
- Consider both qualitative and quantitative factors that drive long-term success
- Provide the latest developments and news that may impact the investment thesis

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
- Operating Margin: ${((operatingIncome / revenue) * 100).toFixed(1).toString()}%
- Net Margin: ${((netIncome / revenue) * 100).toFixed(1).toString()}%`;
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
- Debt/Equity: ${(totalDebt / totalEquity).toFixed(2).toString()}
- Return on Equity: ${((parseFloat(financialData.income_statements[0].net_income) / totalEquity) * 100).toFixed(1).toString()}%
- Return on Assets: ${((parseFloat(financialData.income_statements[0].net_income) / totalAssets) * 100).toFixed(1).toString()}%`;
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
- FCF Margin: ${((freeCashFlow / revenue) * 100).toFixed(1).toString()}%
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

Format your analysis as a professional buy-side equity research report. Follow these formatting guidelines:

Writing Style:
- Write in clear, well-structured paragraphs for main analysis and insights
- Use bullet points (starting with +) only for listing specific metrics, features, or brief points
- Keep paragraphs focused and concise (3-4 sentences)
- Use data and specific examples to support your analysis

Section Structure:
- Use ** for main section headers (e.g., **Executive Summary**)
- Use * ** for subsection headers (e.g., * **Growth Drivers**)
- Include a blank line between sections and paragraphs
- Start each main section with a brief overview paragraph

Structure your report as follows:

**Executive Summary**
* **Investment Recommendation**
- Concise overview of the business and investment thesis
- Key competitive advantages and market position
- Primary growth drivers and risks
- Clear buy/hold/sell recommendation with price target rationale

**Business Analysis**
* **Business Model**
+ Detailed explanation of the business model and how value is created
+ Core revenue streams and pricing strategy
+ Customer acquisition and retention model
+ Key partnerships and supplier relationships

* **Unit Economics**
+ Revenue model and pricing structure
+ Cost structure and margins
+ Customer lifetime value analysis
+ Operational efficiency metrics

* **Competitive Position**
+ Sustainable competitive advantages (moats)
+ Market share and industry position
+ Competitive landscape analysis
+ Barriers to entry and defensibility

**Financial Analysis**
* **Capital Allocation**
+ Historical returns on invested capital
+ Capital deployment strategy
+ Dividend and buyback history
+ M&A track record

* **Balance Sheet Analysis**
+ Financial flexibility and liquidity
+ Debt structure and coverage ratios
+ Working capital efficiency
+ Asset quality assessment

* **Cash Flow Analysis**
+ Cash flow generation consistency
+ Free cash flow conversion metrics
+ Working capital management
+ Quality of earnings analysis

**Growth Opportunities**
* **Organic Growth**
* **Strategic Initiatives**
* **Market Expansion**
- Organic growth initiatives and market expansion plans
- R&D pipeline and innovation strategy
- M&A opportunities and capital deployment strategy
- Market size and penetration potential
- Long-term secular trends supporting growth

**Risk Assessment**
* **Business Risks**
* **Financial Risks**
* **Market Risks**
- Business model risks and competitive threats
- Industry disruption potential
- Regulatory and compliance concerns
- Financial risks and leverage considerations
- Management and governance risks

**Investment Thesis**
* **Value Drivers**
* **Catalysts**
* **Valuation**
- Clear articulation of why this is a compelling investment
- Key catalysts and timeline for value realization
- Valuation framework and methodology
- Downside protection and margin of safety
- Expected returns and investment horizon

Content Guidelines:
- Write in a clear, professional style suitable for sophisticated investors
- Support all assertions with specific data and examples
- Focus on long-term value creation rather than short-term metrics
- Provide concrete examples of competitive advantages and their durability
- Include specific numbers and metrics when discussing financial performance
- Emphasize quality of the business over short-term price movements
- Conclude with a clear, actionable investment recommendation

Your analysis should reflect deep business understanding and focus on fundamental value drivers rather than market sentiment or technical factors.`;
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
