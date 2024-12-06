<script lang="ts">
  import CountrySelect from '$lib/components/CountrySelect.svelte';
  import ModernSelect from './ModernSelect.svelte';
  import { listNames, type ListName } from '$lib/constants/listNames';

  export let searchQuery = '';
  export let marketCapFilter = '';
  export let sectorFilter = '';
  export let exchangeFilter = '';
  export let countryFilter = '';
  export let listFilter: ListName | '' = '';
  export let sectors: string[] = [];
  export let exchanges: string[] = [];
  export let countries: string[] = [];

  const marketCapOptions = [
    { value: '', label: 'All Market Caps' },
    { value: 'Mega', label: 'Mega Cap (>$500B)' },
    { value: 'Large', label: 'Large Cap ($50B-$500B)' },
    { value: 'Mid', label: 'Mid Cap ($10B-$50B)' },
    { value: 'Small', label: 'Small Cap ($2B-$10B)' },
    { value: 'Micro', label: 'Micro Cap (<$2B)' }
  ];

  $: sectorOptions = [
    { value: '', label: 'All Sectors' },
    ...sectors.map(sector => ({ value: sector, label: sector }))
  ];

  $: exchangeOptions = [
    { value: '', label: 'All Exchanges' },
    ...exchanges.map(exchange => ({ value: exchange, label: exchange }))
  ];

  $: listOptions = [
    { value: '', label: 'All Lists' },
    ...listNames.map(list => ({ value: list, label: list }))
  ];
</script>

<div class="bg-[#374151] rounded-[0.375rem] border-2 border-[#4B5563] p-6 mb-6">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
    <input
      type="text"
      placeholder="Search by symbol or company name..."
      bind:value={searchQuery}
      class="w-full px-4 py-3 rounded-[0.375rem] bg-[#1F2937] text-[#F9FAFB] placeholder-gray-400 border border-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors duration-200"
    />
    
    <ModernSelect
      bind:value={marketCapFilter}
      options={marketCapOptions}
      placeholder="All Market Caps"
    />

    <ModernSelect
      bind:value={sectorFilter}
      options={sectorOptions}
      placeholder="All Sectors"
    />
    
    <ModernSelect
      bind:value={exchangeFilter}
      options={exchangeOptions}
      placeholder="All Exchanges"
    />

    <CountrySelect bind:value={countryFilter} {countries} />

    <ModernSelect
      bind:value={listFilter}
      options={listOptions}
      placeholder="All Lists"
    />
  </div>
</div>
