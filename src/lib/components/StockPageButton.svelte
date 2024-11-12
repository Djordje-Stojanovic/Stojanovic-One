<script lang="ts">
  export let variant: 'primary' | 'disabled' | 'danger' | 'secondary' = 'primary';
  export let onClick: (() => void) | undefined = undefined;
  
  const baseClasses = "px-3 py-2 text-sm font-medium rounded-[0.375rem] shadow-sm transition-all duration-300 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800";
  const variantClasses = {
    primary: "bg-[#3B82F6] hover:bg-[#2563EB] text-white focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
    disabled: "bg-gray-600 hover:bg-gray-700 text-white cursor-default focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
  };
  
  $: classes = `${baseClasses} ${variantClasses[variant]}`;
</script>

<button 
  class={classes}
  on:click={onClick}
  disabled={variant === 'disabled'}
  {...$$restProps}
>
  <slot />
</button>
