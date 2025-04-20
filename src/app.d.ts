/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			session: import('@supabase/supabase-js').Session | null;
		}
		// interface PageData {}
		// interface Platform {}
	}

	namespace NodeJS {
		interface ProcessEnv {
			VITE_PUBLIC_SUPABASE_URL: string;
			VITE_PUBLIC_SUPABASE_ANON_KEY: string;
			SUPABASE_SERVICE_ROLE_KEY: string;
			FINNHUB_API_KEY: string;
			VITE_SITE_URL: string;
		}
	}
}

export {};
