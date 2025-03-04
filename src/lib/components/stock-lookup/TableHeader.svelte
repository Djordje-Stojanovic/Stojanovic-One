<script lang="ts">
  import type { StockMetadata } from './Types';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let sortColumn: keyof StockMetadata | null;
  export let sortDirection: 'asc' | 'desc';
  
  function getSortIcon(column: keyof StockMetadata): string {
    if (sortColumn !== column) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  }
</script>

<thead class="bg-[#374151] border-b-2 border-[#4B5563]">
  <tr class="text-xs uppercase tracking-wider">
    <th 
      class="text-left py-4 px-4 text-[#60A5FA] font-semibold cursor-pointer hover:text-blue-400"
      on:click={() => dispatch('sort', 'symbol')}
    >
      Symbol {getSortIcon('symbol')}
    </th>
    <th 
      class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
      on:click={() => dispatch('sort', 'company_name')}
    >
      Company Name {getSortIcon('company_name')}
    </th>
    <th 
      class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
      on:click={() => dispatch('sort', 'sector')}
    >
      Sector {getSortIcon('sector')}
    </th>
    <th 
      class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
      on:click={() => dispatch('sort', 'industry')}
    >
      Industry {getSortIcon('industry')}
    </th>
    <th 
      class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
      on:click={() => dispatch('sort', 'market_cap')}
    >
      Market Cap {getSortIcon('market_cap')}
    </th>
    <th 
      class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
      on:click={() => dispatch('sort', 'pe_ratio')}
    >
      P/E Ratio {getSortIcon('pe_ratio')}
    </th>
    <th 
      class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
      on:click={() => dispatch('sort', 'country')}
    >
      Country {getSortIcon('country')}
    </th>
    <th 
      class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
      on:click={() => dispatch('sort', 'exchange')}
    >
      Exchange {getSortIcon('exchange')}
    </th>
    <th class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151]">Action</th>
  </tr>
</thead>
