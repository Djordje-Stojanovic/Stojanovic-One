import type { ChartStoreState, ChartMetric } from '../types/ChartTypes';

export function handleMetricVisibility(
    state: ChartStoreState,
    metricName: string
): Partial<ChartStoreState> {
    // Only handle visibility for non-margin and non-return metrics
    if (!metricName.includes('Margin') && !['ROIC', 'ROCE', 'ROE', 'ROA'].includes(metricName)) {
        const newVisibility = {
            ...state.metricVisibility,
            [metricName]: !state.metricVisibility[metricName]
        };

        const updatedMetrics = state.selectedMetrics.map(metric => {
            if (metric.name === metricName) {
                return {
                    ...metric,
                    hidden: !newVisibility[metricName]
                };
            }
            return metric;
        });

        return {
            metricVisibility: newVisibility,
            selectedMetrics: updatedMetrics
        };
    }
    return {};
}

export function handleMetricClick(
    state: ChartStoreState,
    name: string,
    values: number[],
    dates: string[]
): Partial<ChartStoreState> {
    const existingIndex = state.selectedMetricNames.indexOf(name);
    const existingMetric = state.selectedMetrics.find(m => m.name === name);

    // If no data provided, remove the metric
    if (!values.length || !dates.length) {
        const newMetrics = state.selectedMetrics.filter(m => m.name !== name);
        const newMetricNames = state.selectedMetricNames.filter(n => n !== name);
        const newVisibility = { ...state.metricVisibility };
        delete newVisibility[name];

        return {
            selectedMetrics: newMetrics,
            selectedMetricNames: newMetricNames,
            showChart: newMetrics.length > 0,
            metricVisibility: newVisibility
        };
    }

    // Create or update metric
    const newMetric: ChartMetric = {
        name,
        data: dates.map((date, i) => ({
            date,
            value: values[i]
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        hidden: existingMetric ? existingMetric.hidden : false
    };

    let newMetrics: ChartMetric[];
    let newMetricNames: string[];

    if (existingIndex !== -1) {
        // Remove existing metric
        newMetrics = state.selectedMetrics.filter(m => m.name !== name);
        newMetricNames = state.selectedMetricNames.filter(n => n !== name);
        const newVisibility = { ...state.metricVisibility };
        delete newVisibility[name];

        return {
            selectedMetrics: newMetrics,
            selectedMetricNames: newMetricNames,
            showChart: newMetrics.length > 0,
            metricVisibility: newVisibility
        };
    } else {
        // Add new metric
        newMetrics = [...state.selectedMetrics, newMetric];
        newMetricNames = [...state.selectedMetricNames, name];

        return {
            selectedMetrics: newMetrics,
            selectedMetricNames: newMetricNames,
            showChart: true,
            metricVisibility: {
                ...state.metricVisibility,
                [name]: true
            }
        };
    }
}
