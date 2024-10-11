<script lang="ts">
  import CompanyInfo from '$lib/components/CompanyInfo.svelte';
  import WikiSection from '$lib/components/WikiSection.svelte';
  import FileUploader from '$lib/components/FileUploader.svelte';

  import { page } from '$app/stores';

  let symbol = '';
  $: symbol = $page.params.symbol;
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
  <div class="container mx-auto px-4 py-8">
    <!-- Company Info -->
    <CompanyInfo {symbol} />

    <!-- Wiki Sections -->
    <WikiSection {symbol} section="History" />
    <WikiSection {symbol} section="Business Model" />
    <WikiSection {symbol} section="Competitors" />
    <WikiSection {symbol} section="Risks" />

    <!-- File Upload -->
    <FileUploader {symbol} />
  </div>
</div>
