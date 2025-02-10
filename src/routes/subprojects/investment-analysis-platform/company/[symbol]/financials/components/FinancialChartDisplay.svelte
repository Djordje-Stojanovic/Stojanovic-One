<script lang="ts">
    import type { FinancialData } from '$lib/types/financialStatements';
    import ChartSection from '$lib/components/financials/ChartSection.svelte';

    export let financialData: FinancialData;
</script>

<ChartSection 
    {financialData} 
    on:metricClick
/>
