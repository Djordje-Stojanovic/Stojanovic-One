<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { supabase, testDbConnection } from '$lib/supabaseClient';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

    let message = 'Completing sign in...';

    onMount(() => {
        // The supabase client will automatically handle the OAuth callback
        // and exchange the code for a session
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Test database connection after successful sign in
                const result = await testDbConnection();
                console.log('Database connection test after auth:', result);
                
                // Redirect to home page
                goto('/');
            }
        });
    });
</script>

<div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
        <LoadingSpinner size="w-8 h-8" />
        <p class="mt-4">{message}</p>
    </div>
</div>
