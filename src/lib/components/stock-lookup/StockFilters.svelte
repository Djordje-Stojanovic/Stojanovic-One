<script lang="ts">
  import CountrySelect from '$lib/components/CountrySelect.svelte';

  export let searchQuery = '';
  export let marketCapFilter = '';
  export let sectorFilter = '';
  export let exchangeFilter = '';
  export let countryFilter = '';
  export let sectors: string[] = [];
  export let exchanges: string[] = [];
  export let countries: string[] = [];
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
  <input
    type="text"
    placeholder="Search by symbol or company name..."
    bind:value={searchQuery}
    class="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  
  <select
    bind:value={marketCapFilter}
    class="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">All Market Caps</option>
    <option value="Mega">Mega Cap (>$500B)</option>
    <option value="Large">Large Cap ($50B-$500B)</option>
    <option value="Mid">Mid Cap ($10B-$50B)</option>
    <option value="Small">Small Cap ($2B-$10B)</option>
    <option value="Micro">Micro Cap (&lt;$2B)</option>
  </select>

  <select
    bind:value={sectorFilter}
    class="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">All Sectors</option>
    {#each sectors as sector}
      <option value={sector}>{sector}</option>
    {/each}
  </select>
  
  <select
    bind:value={exchangeFilter}
    class="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">All Exchanges</option>
    {#each exchanges as exchange}
      <option value={exchange}>{exchange}</option>
    {/each}
  </select>

  <CountrySelect bind:value={countryFilter} {countries} />
</div>
