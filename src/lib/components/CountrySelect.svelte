<script lang="ts">
  export let value: string = '';
  export let countries: string[] = [];

  let isOpen = false;
  let containerRef: HTMLDivElement;

  function handleClickOutside(event: MouseEvent) {
    if (containerRef && !containerRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false;
    }
  }

  function handleOptionKeydown(event: KeyboardEvent, country: string = '') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      value = country;
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div class="relative" bind:this={containerRef}>
  <button
    type="button"
    class="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
    on:click={() => isOpen = !isOpen}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    {#if value}
      <div class="flex items-center">
        <span class="fi fi-{value.toLowerCase()}"></span>
        <span class="ml-2">{value}</span>
      </div>
    {:else}
      <span>All Countries</span>
    {/if}
    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <div 
      class="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto"
      role="listbox"
      aria-label="Select a country"
    >
      <button
        type="button"
        class="w-full px-4 py-2 text-left hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
        on:click={() => {
          value = '';
          isOpen = false;
        }}
        on:keydown={(e) => handleOptionKeydown(e)}
        role="option"
        aria-selected={value === ''}
      >
        All Countries
      </button>
      {#each countries as country}
        <button
          type="button"
          class="w-full px-4 py-2 text-left hover:bg-gray-600 focus:outline-none focus:bg-gray-600 flex items-center"
          on:click={() => {
            value = country;
            isOpen = false;
          }}
          on:keydown={(e) => handleOptionKeydown(e, country)}
          role="option"
          aria-selected={value === country}
        >
          <span class="fi fi-{country.toLowerCase()}"></span>
          <span class="ml-2">{country}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
