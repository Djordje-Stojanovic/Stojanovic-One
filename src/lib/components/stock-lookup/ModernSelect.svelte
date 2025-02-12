<script lang="ts">
  export let value: string = '';
  export let options: { value: string; label: string }[] = [];
  export let placeholder = '';
  export let disabled = false;

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

  function handleOptionKeydown(event: KeyboardEvent, optionValue: string = '') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      value = optionValue;
      isOpen = false;
    }
  }

  function toggleDropdown() {
    if (!disabled) {
      isOpen = !isOpen;
    }
  }

  $: selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div class="relative" bind:this={containerRef}>
  <button
    type="button"
    class="w-full px-4 py-3 rounded-[0.375rem] bg-[#1F2937] text-[#F9FAFB] border border-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors duration-200 text-left flex items-center justify-between {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
    on:click={toggleDropdown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    {disabled}
  >
    <span>{selectedLabel}</span>
    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen && !disabled}
    <div 
      class="absolute z-50 w-full mt-1 bg-[#1F2937] border border-[#4B5563] rounded-[0.375rem] shadow-lg max-h-60 overflow-y-auto"
      role="listbox"
      aria-label="Select an option"
    >
      {#each options as option}
        <button
          type="button"
          class="w-full px-4 py-2 text-left text-[#F9FAFB] hover:bg-[#374151] focus:outline-none focus:bg-[#374151] transition-colors duration-200"
          on:click={() => {
            value = option.value;
            isOpen = false;
          }}
          on:keydown={(e) => handleOptionKeydown(e, option.value)}
          role="option"
          aria-selected={value === option.value}
        >
          {option.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
