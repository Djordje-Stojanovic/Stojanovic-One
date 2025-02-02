import type { ValuationMetricConfig } from './types';

export const metricConfigs: Record<string, ValuationMetricConfig> = {
    pe: {
        name: 'P/E Ratio',
        color: 'rgb(147, 51, 234)',
        bgColor: 'rgba(147, 51, 234, 0.1)'
    },
    fcfYield: {
        name: 'FCF Yield',
        color: 'rgb(6, 182, 212)',
        bgColor: 'rgba(6, 182, 212, 0.1)'
    },
    ps: {
        name: 'P/S Ratio',
        color: 'rgb(245, 158, 11)',
        bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    evEbitda: {
        name: 'EV/EBITDA',
        color: 'rgb(59, 130, 246)',
        bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    pgp: {
        name: 'P/GP Ratio',
        color: 'rgb(16, 185, 129)',
        bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    pb: {
        name: 'P/B Ratio',
        color: 'rgb(220, 38, 38)', // Red-600
        bgColor: 'rgba(220, 38, 38, 0.1)'
    },
    ptb: {
        name: 'P/Tangible B',
        color: 'rgb(219, 39, 119)', // Pink-600
        bgColor: 'rgba(219, 39, 119, 0.1)'
    }
};
