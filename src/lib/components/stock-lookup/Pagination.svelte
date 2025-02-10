<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let currentPage = 1;
  export let totalPages: number;
  export let itemsPerPage = 100;
  export let totalItems: number;

  $: startItem = (currentPage - 1) * itemsPerPage + 1;
  $: endItem = Math.min(currentPage * itemsPerPage, totalItems);

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      dispatch('pageChange', page);
    }
  }

  $: visiblePages = getVisiblePages(currentPage, totalPages);

  function getVisiblePages(current: number, total: number): number[] {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number | undefined;

    range.push(1);

    for (let i = current - delta; i <= current + delta; i++) {
      if (i < total && i > 1) {
        range.push(i);
      }
    }

    if (total > 1) {
      range.push(total);
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-1); // Represents dots
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }
</script>

<div class="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
  <div class="text-sm text-[#9CA3AF]">
    Showing <span class="font-medium text-[#F9FAFB]">{startItem}</span> to <span class="font-medium text-[#F9FAFB]">{endItem}</span> of <span class="font-medium text-[#F9FAFB]">{totalItems}</span> stocks
  </div>

  <div class="flex items-center gap-2">
    <button
      class="px-3 py-2 text-sm font-medium text-[#F9FAFB] bg-[#1F2937] rounded-[0.375rem] border border-[#4B5563] hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      on:click={() => goToPage(currentPage - 1)}
      disabled={currentPage === 1}
    >
      Previous
    </button>

    <div class="flex items-center gap-2">
      {#each visiblePages as page}
        {#if page === -1}
          <span class="px-3 py-2 text-[#9CA3AF]">...</span>
        {:else}
          <button
            class="px-3 py-2 text-sm font-medium rounded-[0.375rem] border transition-colors duration-200 {page === currentPage ? 'bg-[#3B82F6] text-white border-[#3B82F6]' : 'text-[#F9FAFB] bg-[#1F2937] border-[#4B5563] hover:bg-[#374151]'}"
            on:click={() => goToPage(page)}
          >
            {page}
          </button>
        {/if}
      {/each}
    </div>

    <button
      class="px-3 py-2 text-sm font-medium text-[#F9FAFB] bg-[#1F2937] rounded-[0.375rem] border border-[#4B5563] hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      on:click={() => goToPage(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
</div>
