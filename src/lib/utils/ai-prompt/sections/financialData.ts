import type { CompanyData } from '../types';
import { formatCurrency } from '../helpers';

export function generateFinancialData(data: CompanyData): string {
    const { financialData } = data;
    
    // Sort financial statements in reverse chronological order
    const reversedIncome = [...financialData.income_statements]
        .filter(stmt => stmt.period === 'FY')  // Only use annual statements
        .sort((a, b) => new Date(b.calendar_year).getTime() - new Date(a.calendar_year).getTime());
    const reversedBalance = [...financialData.balance_sheets]
        .filter(stmt => stmt.period === 'FY')  // Only use annual statements
        .sort((a, b) => new Date(b.calendar_year).getTime() - new Date(a.calendar_year).getTime());
    const reversedCashFlow = [...financialData.cash_flow_statements]
        .filter(stmt => stmt.period === 'FY')  // Only use annual statements
        .sort((a, b) => new Date(b.calendar_year).getTime() - new Date(a.calendar_year).getTime());

    return `Financial Data (Last ${financialData.income_statements.length} Quarters):

Financial Performance (Last 10 Years):

Annual Growth & Margins:
${reversedIncome
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
    const latest = reversedBalance[0];
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
- Return on Equity: ${((parseFloat(reversedIncome[0].net_income.toString()) / totalEquity) * 100).toFixed(1)}%
- Return on Assets: ${((parseFloat(reversedIncome[0].net_income.toString()) / totalAssets) * 100).toFixed(1)}%`;
})()}

Cash Flow & Shareholder Returns (Latest Annual):
${(() => {
    const latest = reversedCashFlow[0];
    const freeCashFlow = parseFloat(latest.free_cash_flow.toString());
    const operatingCashFlow = parseFloat(latest.operating_cash_flow.toString());
    const capex = parseFloat(latest.capital_expenditure.toString());
    const dividendsPaid = parseFloat(latest.dividends_paid.toString());
    const stockRepurchased = parseFloat(latest.common_stock_repurchased.toString());
    const revenue = parseFloat(reversedIncome[0].revenue.toString());
    
    return `
- Operating Cash Flow: ${formatCurrency(operatingCashFlow.toString())}
- Free Cash Flow: ${formatCurrency(freeCashFlow.toString())}
- FCF Margin: ${((freeCashFlow / revenue) * 100).toFixed(1)}%
- Capital Expenditure: ${formatCurrency(Math.abs(capex).toString())}
- Dividends Paid: ${formatCurrency(Math.abs(dividendsPaid).toString())}
- Stock Buybacks: ${formatCurrency(Math.abs(stockRepurchased).toString())}
- Total Shareholder Return: ${formatCurrency((Math.abs(dividendsPaid) + Math.abs(stockRepurchased)).toString())}`;
})()}`;
}
