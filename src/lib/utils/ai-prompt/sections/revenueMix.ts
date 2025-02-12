import type { CompanyData } from '../types';

export function generateRevenueMix(data: CompanyData): string {
    const { financialData } = data;
    
    // Filter for annual statements and sort in reverse chronological order
    const reversedSegments = financialData.revenue_segments ? 
        [...financialData.revenue_segments]
            .filter(seg => seg.period === 'FY')  // Only use annual statements
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ) : null;
    const reversedGeoSegments = financialData.revenue_geo_segments ?
        [...financialData.revenue_geo_segments]
            .filter(seg => seg.period === 'FY')  // Only use annual statements
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ) : null;
    
    const latestSegment = reversedSegments?.[0];
    const latestGeo = reversedGeoSegments?.[0];
    
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
    
    return `Revenue Mix (Latest Annual):

Business Segments:
${segmentText}

Geographic Mix:
${geoText}`;
}
