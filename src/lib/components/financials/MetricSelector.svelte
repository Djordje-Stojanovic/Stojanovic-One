<script lang="ts">
    import type { ChartMetric } from './types';
    import type { BaseFinancialStatement } from '$lib/types/financialStatements';
    import { saveSelectedMetrics, saveShowChart, updateChartMetrics } from './state/chartState';
    import { createEventDispatcher } from 'svelte';
    import LoadingSpinner from '../LoadingSpinner.svelte';

    const dispatch = createEventDispatcher();

    export let selectedMetrics: ChartMetric[] = [];
    export let selectedMetricNames: string[] = [];
    export let statements: BaseFinancialStatement[] = [];
    export let showChart = false;

    let previousStatements = '';
    let previousMetricNames = '';

    let isLoading = false;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function handleMetricClick(name: string, values: number[], dates: string[]) {
        if (!statements.length) {
            console.warn('Financial statements not loaded yet');
            return;
        }

        if (isLoading) return;
        
        isLoading = true;
        clearTimeout(retryTimeout);

        try {
            const existingIndex = selectedMetricNames.indexOf(name);
            
            if (existingIndex !== -1) {
                // Remove metric
                selectedMetrics = selectedMetrics.filter(m => m.name !== name);
                selectedMetricNames = selectedMetricNames.filter(n => n !== name);
            } else {
                // Add new metric
                const newMetric = {
                    name,
                    data: dates.map((date, i) => ({
                        date,
                        value: values[i]
                    }))
                };

                selectedMetrics = [...selectedMetrics, newMetric];
                selectedMetricNames = [...selectedMetricNames, name];
            }

            updateMetrics();
        } catch (error) {
            console.error('Error updating metrics:', error);
            // Retry after a short delay
            retryTimeout = setTimeout(() => {
                isLoading = false;
                handleMetricClick(name, values, dates);
            }, 500);
        } finally {
            isLoading = false;
        }
    }

    function clearMetrics() {
        selectedMetrics = [];
        selectedMetricNames = [];
        showChart = false;
        saveShowChart(false);
        saveSelectedMetrics([]);
        
        dispatch('metricsUpdate', {
            metrics: [],
            metricNames: [],
            showChart: false
        });
    }

    function updateMetrics() {
        if (selectedMetricNames.length > 0 && statements.length > 0) {
            selectedMetrics = updateChartMetrics(selectedMetricNames, statements);
            showChart = selectedMetrics.length > 0;
            saveShowChart(showChart);
            saveSelectedMetrics(selectedMetricNames);

            dispatch('metricsUpdate', {
                metrics: selectedMetrics,
                metricNames: selectedMetricNames,
                showChart
            });
        }
    }

    // Only update when statements or selectedMetricNames actually change
    $: {
        const currentStatements = JSON.stringify(statements);
        const currentMetricNames = JSON.stringify(selectedMetricNames);
        
        if (currentStatements !== previousStatements || 
            currentMetricNames !== previousMetricNames) {
            previousStatements = currentStatements;
            previousMetricNames = currentMetricNames;
            
            if (statements.length > 0 && selectedMetricNames.length > 0) {
                updateMetrics();
            }
        }
    }
</script>

<slot {handleMetricClick} {clearMetrics} {selectedMetricNames} {isLoading} />
