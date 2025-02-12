import type { CompanyData } from './types';
import { generateCompanyProfile } from './sections/companyProfile';
import { generateFinancialData } from './sections/financialData';
import { generateRevenueMix } from './sections/revenueMix';
import {
    analysisRequirements,
    analysisStyle,
    writingStyle,
    reportStructure,
    businessQualityRating,
    contentGuidelines
} from './templates';

export function generateAIPrompt(data: CompanyData): string {
    const { companyName, symbol } = data;
    
    return `As a buy-side investment analyst at a high-quality value investment firm, provide a comprehensive business analysis and investment thesis for ${companyName || symbol}. Focus on understanding the business model deeply, competitive advantages, and long-term value creation potential.

${analysisRequirements}

${analysisStyle}

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

${generateCompanyProfile(data)}

${generateFinancialData(data)}

${generateRevenueMix(data)}

${writingStyle}

${reportStructure}

${businessQualityRating}

${contentGuidelines}`;
}

// Re-export types
export * from './types';
