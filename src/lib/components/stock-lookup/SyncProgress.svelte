<script lang="ts">
  export let syncing = false;
  export let statusMessage = '';
  export let syncProgress = 0;
  export let currentStock = '';
  export let countdownSeconds = 0;
  export let syncErrors: string[] = [];
  export let cycleTimeRemaining = 0;
  export let apiCallCount = 0;

  $: cycleTimeDisplay = cycleTimeRemaining > 0 
    ? `${Math.ceil(cycleTimeRemaining / 1000)}s until next API cycle (${apiCallCount}/220 calls)`
    : '';
</script>

{#if syncing || statusMessage}
  <div class="mb-6 p-4 bg-blue-900 rounded-lg">
    <div class="flex flex-col gap-2">
      <span class="text-blue-200">
        {#if countdownSeconds > 0}
          {statusMessage}
        {:else}
          {currentStock ? `Syncing ${currentStock}` : ''} 
          {statusMessage}
        {/if}
      </span>
      {#if cycleTimeDisplay}
        <span class="text-blue-300 text-sm">
          {cycleTimeDisplay}
        </span>
      {/if}
    </div>
    <div class="w-full bg-blue-950 rounded-full h-4 mt-2">
      <div 
        class="bg-blue-500 h-4 rounded-full transition-all duration-300"
        style="width: {syncProgress}%"
      ></div>
    </div>
    {#if syncErrors.length > 0}
      <div class="mt-2 text-red-400 text-sm">
        Failed: {syncErrors.join(', ')}
      </div>
    {/if}
  </div>
{/if}
