/// <reference types="@sveltejs/kit" />
import type { Session } from '@supabase/supabase-js';

declare global {
    namespace App {
        interface Locals {
            session: Session | null;
            getSession(): Promise<Session | null>;
        }
        type PageData = Record<string, unknown>;
        type Error = Record<string, unknown>;
        type Platform = Record<string, unknown>;
    }
}

export {};
