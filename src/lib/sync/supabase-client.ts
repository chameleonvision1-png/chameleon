/**
 * SYNC Store - Supabase Browser Client
 * 
 * This is the client-side Supabase instance for SYNC.
 * Uses SYNC-specific env vars (separate from Chameleon's future Supabase).
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createSyncClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SYNC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SYNC_SUPABASE_ANON_KEY!
  );
}
