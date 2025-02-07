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
Focus your analysis on these critical elements:

Business Quality:
- Explain how the business makes money in simple terms
- Identify any monopoly-like characteristics or dominant market positions
- Analyze pricing power and ability to raise prices
- Evaluate customer lock-in and switching costs
- Assess network effects and flywheel dynamics
- Look for evidence of scale advantages

Competitive Position:
- Identify and analyze sustainable competitive advantages (moats)
- Evaluate barriers to entry and competitive threats
- Assess brand strength and market leadership
- Analyze vendor/supplier relationships and bargaining power
- Understand customer concentration and relationships

Unit Economics & Profitability:
- Break down revenue streams and their quality
- Analyze gross margins and operating leverage
- Evaluate capital intensity and reinvestment needs
- Assess free cash flow generation and conversion
- Look for evidence of pricing power in financial metrics

Analysis Requirements & Style:
Be bold and objective in your analysis:

+ Brutal Honesty About Weaknesses
- If a business is bad, say it clearly and explain why
- Don't try to find silver linings in fundamentally broken businesses
- Call out weak competitive positions or failing strategies directly
- Identify paths to irrelevance or decline if you see them
- Be direct about pricing power weakness or competitive threats
- Point out when management is making poor decisions

+ Strong Recognition of Excellence
- When a business is truly exceptional, explain exactly why
- Highlight genuine competitive advantages and their durability
- Praise superior business models and execution when deserved
- Recognize truly excellent management teams and capital allocation
- Identify real moats and sustainable market leadership
- Call out genuine pricing power and growth runways

+ Clear, Bold Opinions
- Take strong positions based on evidence
- Don't sit on the fence - make clear judgments
- Support both positive and negative views with specific examples
- Be bold in predicting future competitive position
- Call out both strengthening and weakening moats
- Distinguish between truly great and merely average businesses

Analysis Style:
- Write as if you're a skeptical buy-side analyst evaluating a potential investment
- Focus on long-term business fundamentals and competitive position
- Emphasize understanding the business model and unit economics
- Look for evidence of real competitive advantages and pricing power
- Pay special attention to management quality and capital allocation
- Incorporate latest news and developments that impact the business

Current Events & News:
- Include recent significant developments affecting the business
- Analyze management's response to challenges and opportunities
- Consider industry trends and competitive moves
- Evaluate impact of macro factors on the business model
- Look for evidence of strengthening or weakening competitive position

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

* **Market Structure & Competition**
Analyze the competitive landscape in detail:

+ Market Structure
- Is it a monopoly, duopoly, oligopoly, or fragmented market?
- Market concentration and key players' market shares
- Barriers to entry and regulatory environment
- Industry profit pool distribution

+ Competitor Analysis
- Direct competitors and their relative strengths/weaknesses
- Product/service comparison with competitors
- Competitor market shares and growth trends
- Who is gaining/losing share and why?

+ Competitive Dynamics
- Price competition vs. differentiation
- Innovation and R&D capabilities comparison
- Distribution and scale advantages
- Customer relationships and loyalty

+ Consolidation Potential
- Fragmentation and roll-up opportunities
- History of M&A in the industry
- Potential acquisition targets
- Benefits of being a serial acquirer

* **Competitive Advantages**
Evaluate the company's competitive position:

+ Moat Analysis
- Network effects and their strength
- Switching costs and customer lock-in
- Scale advantages and operating leverage
- Brand strength and IP protection
- Regulatory or standard-setting advantages

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

**Management & Leadership Analysis**
* **CEO & Management Team**
- CEO's background, track record, and leadership style
- Management team's experience and capabilities
- Capital allocation history and decision-making
- Alignment with shareholder interests
- Communication style and transparency

* **Corporate Culture & Governance**
- Company culture and values
- Board composition and effectiveness
- Insider ownership and incentives
- Related party transactions
- ESG considerations and risks

**Investment Thesis**
* **Value Drivers**
- Key factors driving business value
- Competitive advantages and their durability
- Growth opportunities and reinvestment potential
- Management's ability to execute

* **Catalysts & Risks**
- Near-term and long-term catalysts
- Key risks and mitigating factors
- Industry headwinds and tailwinds
- Regulatory and competitive threats

* **Valuation & Return Potential**
- Current valuation metrics
- Historical valuation ranges
- Peer comparison analysis
- Expected return scenarios

**Business Quality Rating**
Based on the comprehensive analysis above, assign one of these five ratings and provide detailed justification:

1. Leader & Disruptor
- Dominant market position
- Strong and expanding moat
- Superior management and execution
- High returns on capital
- Clear path to continued growth

2. Compounder & Future Leader
- Strong competitive position
- Growing market share
- Good management and execution
- Above-average returns
- Solid growth prospects

3. Average Business
- Moderate competitive position
- Stable market share
- Adequate management
- Average returns
- Limited growth potential

4. Laggard or Disruptee
- Weak competitive position
- Losing market share
- Poor execution
- Below-average returns
- Facing disruption

5. Value Destroyer
- No sustainable competitive advantage
- Broken business model
- Poor management
- Negative returns
- High risk of failure

Provide specific evidence and examples to support the assigned rating. Be brutally honest - if the business is poor quality, say so directly and explain why.

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
