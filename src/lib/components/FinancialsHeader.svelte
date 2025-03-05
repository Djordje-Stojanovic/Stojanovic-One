<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { FinancialData } from '$lib/types/financialStatements';
    import { generateAIPrompt } from '$lib/utils/ai-prompt';
    import AISummaryModal from './AISummaryModal.svelte';
    import CompanyInfoModal from './CompanyInfoModal.svelte';
    import ModelSelector from './ModelSelector.svelte';
    import { session } from '$lib/stores/sessionStore';
    import { db } from '$lib/supabaseClient';

    export let symbol: string;
    export let companyName: string | null = null;
    export let loading: boolean = false;
    let wasLoading: boolean = false;
    let syncSuccess: boolean = false;
    let syncSuccessTimeout: ReturnType<typeof setTimeout> | null = null;
    
    // Watch for loading state changes
    $: {
        if (wasLoading && !loading) {
            // Loading just finished
            syncSuccess = true;
            
            // Clear success message after 3 seconds
            if (syncSuccessTimeout) {
                clearTimeout(syncSuccessTimeout);
            }
            syncSuccessTimeout = setTimeout(() => {
                syncSuccess = false;
            }, 3000);
        }
        wasLoading = loading;
    }
    export let numberFormat: NumberFormat;
    export let selectedYears: number = 10;
    export let customYears: string = '';
    export let period: 'annual' | 'quarterly' | 'ttm' = 'annual';
    export let financialData: FinancialData;

    let showAISummary = false;
    let aiSummaryLoading = false;
    let aiSummaryText: string | null = null;
    
    let showCompanyInfo = false;
    let companyInfoLoading = false;
    let stockMetadata: any = null;
    let incomeStatements: any[] = [];
    let selectedModel = 'anthropic/claude-3.7-sonnet';
    const modelParams = {
        'anthropic/claude-3.7-sonnet': {
            temperature: 0.7,
            top_p: 1
        },
        'deepseek/deepseek-r1': {
            temperature: 0.85,
            top_p: 1,
            repetition_penalty: 1
        },
        'google/gemini-2.0-flash-thinking-exp:free': {
            temperature: 0.7,
            top_p: 1
        }
    };

    const dispatch = createEventDispatcher();

    function handleModelChange(event: CustomEvent<{model: string}>) {
        selectedModel = event.detail.model;
    }

    async function handleAISummary() {
        if (!$session) return;
        
        showAISummary = true;
        aiSummaryLoading = true;
        aiSummaryText = null;

        try {
            const response = await fetch(`/api/company-info/${symbol}`, {
                headers: {
                    'Authorization': `Bearer ${$session.access_token}`
                }
            });
            const companyInfo = await response.json();

            const filteredFinancialData = {
                ...financialData,
                income_statements: financialData.income_statements
                    .filter(stmt => stmt.period === 'FY')
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                balance_sheets: financialData.balance_sheets
                    .filter(stmt => stmt.period === 'FY')
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                cash_flow_statements: financialData.cash_flow_statements
                    .filter(stmt => stmt.period === 'FY')
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                revenue_segments: financialData.revenue_segments
                    ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                revenue_geo_segments: financialData.revenue_geo_segments
                    ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            };

            const promptData = {
                symbol,
                companyName,
                financialData: filteredFinancialData,
                stockPriceData: null,
                companyInfo
            };
            
            const prompt = generateAIPrompt(promptData);
            console.log('Generated Prompt:\n', prompt);

            const modelConfig = {
                model: selectedModel,
                messages: [
                    {
                        "role": "system", 
                        "content": "You are a financial analyst providing detailed company analysis. Format your response with clear sections using ** for headers and bullet points (+) for key points."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                max_tokens: 16384,
                stream: false,
                ...modelParams[selectedModel as keyof typeof modelParams]
            };

            console.log('Sending AI request with model:', selectedModel);
            console.log('Model config:', modelConfig);

            const result = await fetch("/api/ai-summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(modelConfig)
            });

            if (!result.ok) {
                const errorText = await result.text();
                console.error('OpenRouter API error:', result.status, errorText);
                throw new Error(`API error: ${result.status} ${errorText}`);
            }

            const data = await result.json();
            aiSummaryText = data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating AI summary:', error);
            aiSummaryText = 'Failed to generate AI summary. Please try again.';
        } finally {
            aiSummaryLoading = false;
        }
    }

    function handleCloseSummary() {
        showAISummary = false;
        aiSummaryText = null;
    }
    
    async function handleCompanyInfo() {
        if (!$session) return;
        
        showCompanyInfo = true;
        companyInfoLoading = true;
        stockMetadata = null;
        incomeStatements = [];

        try {
            const { data: metadataData, error: metadataError } = await db
                .from('stock_metadata')
                .select('*')
                .eq('symbol', symbol)
                .single();
            
            if (metadataError) throw metadataError;
            stockMetadata = metadataData;
            
            const { data: statementsData, error: statementsError } = await db
                .from('income_statements')
                .select('*')
                .eq('symbol', symbol)
                .order('date', { ascending: false });
            
            if (statementsError) throw statementsError;
            incomeStatements = statementsData || [];
            
        } catch (error) {
            console.error('Error loading company info:', error);
        } finally {
            companyInfoLoading = false;
        }
    }
    
    function handleCloseCompanyInfo() {
        showCompanyInfo = false;
        stockMetadata = null;
        incomeStatements = [];
    }

    function handleSync() {
        // Reset success state
        syncSuccess = false;
        
        // Dispatch sync event
        dispatch('sync');
    }

    function handleFormatChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        dispatch('formatChange', select.value);
    }

    function setYearRange(years: number) {
        selectedYears = years;
        customYears = '';
        dispatch('yearChange', { years });
    }

    function handleCustomYears() {
        const years = parseInt(customYears);
        if (!isNaN(years) && years > 0) {
            selectedYears = years;
            dispatch('yearChange', { years });
        }
    }

    function setPeriod(newPeriod: 'annual' | 'quarterly' | 'ttm') {
        period = newPeriod;
        dispatch('periodChange', { period: newPeriod });
    }

    function handleDefaultView() {
        dispatch('defaultView');
    }
</script>

<style>
    /* Custom button active state styles */
    .btn-with-active:active {
        transform: scale(0.95);
        transition: transform 0.1s;
    }
    
    .blue-btn:active {
        background-color: #1d4ed8 !important; /* blue-700 */
    }
    
    .green-btn:active {
        background-color: #15803d !important; /* green-700 */
    }
    
    .purple-btn:active {
        background-color: #7e22ce !important; /* purple-700 */
    }
    
    .cyan-btn:active {
        background-color: #0e7490 !important; /* cyan-700 */
    }
    
    /* Success message animation */
    @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(-10px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    
    .success-message {
        animation: fadeIn 0.3s ease-out;
    }
</style>

<!-- Main header matching the screenshot exactly -->
<div class="bg-[#1F2937] p-4">
    <!-- Company title -->
    <h1 class="text-xl font-semibold text-white mb-4">
        {#if companyName}
            {companyName} ({symbol}) Financial Statements
        {:else}
            {symbol} Financial Statements
        {/if}
    </h1>
    
    <!-- Main action buttons row -->
    <div class="flex flex-col space-y-2 mb-4">
        <div class="flex space-x-4">
            <!-- Sync Data button -->
            <button 
                class="{loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded shadow-sm flex items-center justify-center transition-all duration-300 gap-2 px-4 py-2 btn-with-active blue-btn"
                on:click={handleSync}
                disabled={loading}
            >
                {#if loading}
                    <div class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Syncing...</span>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                    </svg>
                    <span>Sync Data</span>
                {/if}
            </button>

            <!-- Default View button -->
            <button 
                class="bg-green-500 hover:bg-green-600 text-white rounded shadow-sm flex items-center justify-center transition-all duration-300 gap-2 px-4 py-2 btn-with-active green-btn"
                on:click={handleDefaultView}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                <span>Default View</span>
            </button>
        </div>
        
        <!-- Success message -->
        {#if syncSuccess}
            <div class="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-4 py-2 rounded-md flex items-center success-message">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Data synced successfully!</span>
            </div>
        {/if}
    </div>

    <!-- Period selection row -->
    <div class="flex items-center space-x-4 mb-4">
        <!-- Annual/Quarterly/TTM selector -->
        <div class="flex">
            <button 
                class="px-3 py-1 text-sm font-medium rounded-l transition-colors border-r border-gray-700 
                      {period === 'annual' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                on:click={() => setPeriod('annual')}
            >
                Annual
            </button>
            <button 
                class="px-3 py-1 text-sm font-medium transition-colors border-r border-gray-700
                      {period === 'quarterly' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                on:click={() => setPeriod('quarterly')}
            >
                Quarterly
            </button>
            <button 
                class="px-3 py-1 text-sm font-medium rounded-r transition-colors
                      {period === 'ttm' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                on:click={() => setPeriod('ttm')}
            >
                TTM
            </button>
        </div>

        <!-- Year selection -->
        <div class="flex items-center space-x-2">
            <button 
                class="px-3 py-1 text-sm font-medium rounded transition-colors
                      {selectedYears === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                on:click={() => setYearRange(3)}
            >
                3Y
            </button>
            <button 
                class="px-3 py-1 text-sm font-medium rounded transition-colors
                      {selectedYears === 5 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                on:click={() => setYearRange(5)}
            >
                5Y
            </button>
            <button 
                class="px-3 py-1 text-sm font-medium rounded transition-colors
                      {selectedYears === 10 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                on:click={() => setYearRange(10)}
            >
                10Y
            </button>
            <button 
                class="px-3 py-1 text-sm font-medium rounded transition-colors
                      {selectedYears === 20 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                on:click={() => setYearRange(20)}
            >
                20Y
            </button>
            <button 
                class="px-3 py-1 text-sm font-medium rounded transition-colors
                      {selectedYears === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                on:click={() => setYearRange(0)}
            >
                All
            </button>

            <!-- Custom year input -->
            <input 
                type="number" 
                min="1"
                placeholder="Custom years"
                class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-32"
                bind:value={customYears}
                on:change={handleCustomYears}
            />

            <!-- Format selector (K/M/B) -->
            <select
                bind:value={numberFormat}
                on:change={handleFormatChange}
                class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
            >
                <option value="full">Full Numbers</option>
                <option value="abbreviated">K/M/B</option>
            </select>
        </div>
    </div>

    <!-- AI tools row -->
    <div class="flex items-center justify-between">
        <!-- Model selector -->
        <div class="w-[240px]">
            <ModelSelector 
                bind:selectedModel
                on:change={handleModelChange}
            />
        </div>
        
        <div class="flex space-x-2">
            <!-- AI Summary button -->
            <button 
                class="bg-purple-500 hover:bg-purple-600 text-white rounded flex items-center justify-center transition-all duration-300 gap-2 px-4 py-2 btn-with-active purple-btn"
                on:click={handleAISummary}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span>AI Summary</span>
            </button>
            
            <!-- Info button -->
            <button 
                class="bg-cyan-500 hover:bg-cyan-600 text-white rounded flex items-center justify-center transition-all duration-300 gap-2 px-4 py-2 btn-with-active cyan-btn"
                on:click={handleCompanyInfo}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>Info</span>
            </button>
        </div>
    </div>
</div>

<!-- Modals -->
{#if showAISummary}
    <AISummaryModal 
        loading={aiSummaryLoading}
        summary={aiSummaryText}
        {selectedModel}
        on:close={handleCloseSummary}
    />
{/if}

{#if showCompanyInfo}
    <CompanyInfoModal 
        loading={companyInfoLoading}
        {stockMetadata}
        {incomeStatements}
        on:close={handleCloseCompanyInfo}
    />
{/if}
