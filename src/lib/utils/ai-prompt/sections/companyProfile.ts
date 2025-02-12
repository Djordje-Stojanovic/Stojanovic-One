import type { CompanyData } from '../types';
import { formatCurrency, formatEmployees } from '../helpers';

export function generateCompanyProfile(data: CompanyData): string {
    const { symbol, companyName, companyInfo } = data;
    
    return `Company Profile:
Symbol: ${symbol}
Name: ${companyName || 'N/A'}
CEO: ${companyInfo?.ceo || 'N/A'}
Sector: ${companyInfo?.sector || 'N/A'}
Industry: ${companyInfo?.industry || 'N/A'}
Market Cap: ${companyInfo?.marketCap ? formatCurrency(companyInfo.marketCap.toString()) : 'N/A'}
Stock Price: ${companyInfo?.price ? formatCurrency(companyInfo.price.toString()) : 'N/A'}
Employees: ${companyInfo?.employees ? formatEmployees(companyInfo.employees) : 'N/A'}
Location: ${companyInfo?.location || 'N/A'}
Exchange: ${companyInfo?.exchange || 'N/A'}
Beta: ${companyInfo?.beta || 'N/A'}
52-Week Range: ${companyInfo?.priceRange || 'N/A'}
Last Dividend: ${companyInfo?.lastDividend ? formatCurrency(companyInfo.lastDividend.toString()) : 'N/A'}

Company Description:
${companyInfo?.description || 'No description available.'}`;
}
