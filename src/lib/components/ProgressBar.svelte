<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let currentStatus: string;
  
    const successSteps = [
      'Watchlist',
      'Due Diligence',
      'Buy Ready',
      'Core Holdings',
      'Regular Review',
      'Sell Ready',
      'Sold'
    ];
  
    const extrasSteps = [
      'Too Expensive',
      'Pass For Now',
      'Permanent Pass'
    ];
  
    // Reactive variable to update currentStepIndex whenever currentStatus changes
    $: currentStepIndex = successSteps.indexOf(currentStatus);
  
    // Determine if the currentStatus is part of extrasSteps
    $: isExtras = extrasSteps.includes(currentStatus);
</script>
  
<style>
    .step-circle {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
    }
    .extra-step-circle {
      background-color: #ef4444; /* Red for extras */
    }
</style>
  
<div class="mb-6">
    <!-- Success Progress Bar -->
    <div class="mb-4">
      <div class="flex items-center">
        {#each successSteps as step, index}
          <div class="flex flex-col items-center flex-1">
            <div
              class={`step-circle ${
                index < currentStepIndex
                  ? 'bg-green-500'
                  : index === currentStepIndex
                  ? 'bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <span class="mt-2 text-xs text-center text-gray-700 dark:text-gray-300">{step}</span>
          </div>
          {#if index < successSteps.length - 1}
            <div
              class={`flex-auto border-t-2 ${
                index < currentStepIndex - 1
                  ? 'border-green-500'
                  : index === currentStepIndex - 1
                  ? 'border-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            ></div>
          {/if}
        {/each}
      </div>
    </div>
  
    <!-- Extras Progress Bar -->
    <div>
      <div class="flex items-center">
        {#each extrasSteps as step, index}
          <div class="flex flex-col items-center flex-1">
            <div
              class={`step-circle ${
                step === currentStatus
                  ? 'extra-step-circle'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <span class="mt-2 text-xs text-center text-gray-700 dark:text-gray-300">{step}</span>
          </div>
          {#if index < extrasSteps.length - 1}
            <div class="flex-auto border-t-2 border-gray-300 dark:border-gray-600"></div>
          {/if}
        {/each}
      </div>
    </div>
</div>