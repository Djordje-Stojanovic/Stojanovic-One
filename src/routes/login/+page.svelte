<script lang="ts">
    import { supabase, testDbConnection } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import { onMount } from 'svelte';
    import { sessionStore } from '$lib/stores/sessionStore';

    let email = '';
    let password = '';
    let errorMessage = '';
    let loading = false;

    let returnUrl = '';
    $: {
        const params = $page.url.searchParams;
        returnUrl = params.get('returnUrl') || params.get('from') || '/';
        // Prevent redirect loops
        if (returnUrl.includes('/auth/callback') || returnUrl.includes('/login')) {
            returnUrl = '/';
        }
    }

    onMount(async () => {
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // Test database connection silently
            await testDbConnection();
            goto(returnUrl);
        }
    });

    async function signInWithGoogle() {
        try {
            loading = true;
            errorMessage = '';
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { 
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });
            
            if (error) throw error;
        } catch (error: unknown) {
            errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex min-h-screen items-center justify-center bg-secondary-50 px-4 py-12 dark:bg-secondary-900 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
        <h2 class="mt-6 text-center text-3xl font-extrabold">Sign in to your account</h2>
        {#if $page.url.searchParams.has('error')}
            <div class="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900">
                <p class="text-sm text-red-700 dark:text-red-200">
                    Authentication failed. Please try again.
                </p>
            </div>
        {/if}
        {#if errorMessage}
            <ErrorMessage message={errorMessage} />
        {/if}

        <div class="mt-4">
            <button
                on:click={signInWithGoogle}
                disabled={loading}
                class="btn-secondary flex w-full items-center justify-center space-x-2 rounded-md px-4 py-2 text-sm font-medium"
            >
                {#if loading}
                    <LoadingSpinner size="w-5 h-5" />
                {:else}
                    <img src="/google-logo.svg" alt="Google logo" class="h-5 w-5" />
                    <span>Sign in with Google</span>
                {/if}
            </button>
        </div>
    </div>
</div>
