<script lang="ts">
    import type { RevenueGeoSegment } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import BaseFinancialTable from '../base/BaseFinancialTable.svelte';
    import MetricRow from '../base/MetricRow.svelte';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let data: RevenueGeoSegment[] = [];
    export let numberFormat: NumberFormat = 'abbreviated';
    export let selectedMetricNames: string[] = [];

    // Sort statements by date (ascending - oldest to newest)
    $: sortedData = [...data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get all unique geographic regions across all periods
    $: regions = sortedData.length > 0 
        ? [...new Set(sortedData.flatMap(period => Object.keys(period.segments)))]
            .sort((a, b) => {
                // Sort by most recent total value (descending)
                const latestPeriod = sortedData[sortedData.length - 1];
                const aValue = latestPeriod.segments[a] || 0;
                const bValue = latestPeriod.segments[b] || 0;
                return bValue - aValue;
            })
        : [];

    $: totalRevenue = sortedData.map(period => 
        Object.values(period.segments).reduce((sum, value) => sum + value, 0)
    );

    $: dates = sortedData.map(period => period.date);
</script>

<SectionStyles />

<BaseFinancialTable statements={sortedData} tableName="Geographic Revenue">
    <tbody>
        {#each regions as region}
            <MetricRow
                name={region}
                values={sortedData.map(period => period.segments[region] || 0)}
                {dates}
                {numberFormat}
                isSelected={selectedMetricNames.includes(region)}
                on:metricClick
            />
        {/each}

        <MetricRow
            name="Total Revenue"
            values={totalRevenue}
            {dates}
            {numberFormat}
            isTotal={true}
            isSelected={selectedMetricNames.includes('Total Revenue')}
            on:metricClick
        />
    </tbody>
</BaseFinancialTable>
