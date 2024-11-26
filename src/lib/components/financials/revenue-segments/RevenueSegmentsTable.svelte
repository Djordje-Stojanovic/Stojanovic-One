<script lang="ts">
    import type { RevenueSegment } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import BaseFinancialTable from '../base/BaseFinancialTable.svelte';
    import MetricRow from '../base/MetricRow.svelte';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let data: RevenueSegment[] = [];
    export let numberFormat: NumberFormat = 'abbreviated';
    export let selectedMetricNames: string[] = [];

    $: segments = data.length > 0 
        ? Object.keys(data[0].segments).sort()
        : [];

    $: totalRevenue = data.map(period => 
        Object.values(period.segments).reduce((sum, value) => sum + value, 0)
    );

    $: dates = data.map(period => period.date);
</script>

<SectionStyles />

<BaseFinancialTable statements={data} tableName="revenue_segments">
    <div class="financial-section">
        <div class="section-header">
            <h3>Revenue Segments</h3>
        </div>

        {#each segments as segment}
            <MetricRow
                name={segment}
                values={data.map(period => period.segments[segment] || 0)}
                {dates}
                {numberFormat}
                isSelected={selectedMetricNames.includes(segment)}
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
    </div>
</BaseFinancialTable>
