<script lang="ts">
    import type { ChartMetric } from './types';
    import type { BaseFinancialStatement } from '$lib/types/financialStatements';
    import { saveSelectedMetrics, saveShowChart, updateChartMetrics } from './state/chartState';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let selectedMetrics: ChartMetric[] = [];
    export let selectedMetricNames: string[] = [];
    export let statements: BaseFinancialStatement[] = [];
    export let showChart = false;

    let previousStatements = '';
    let previousMetricNames = '';

    function handleMetricClick(name: string, values: number[], dates: string[]) {
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

<slot {handleMetricClick} {clearMetrics} {selectedMetricNames} />
