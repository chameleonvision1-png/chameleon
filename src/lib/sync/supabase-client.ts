/**
 * SYNC Store - Supabase Browser Client
 * 
 * This is the client-side Supabase instance for SYNC.
 * Uses SYNC-specific env vars (separate from Chameleon's future Supabase).
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createSyncClient() {
  const url = process.env.NEXT_PUBLIC_SYNC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SYNC_SUPABASE_ANON_KEY;

  // During build-time prerendering env vars may not be available.
  // Return a placeholder client that will be replaced at runtime.
  if (!url || !key) {
    return createBrowserClient<Database>(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }

  return createBrowserClient<Database>(url, key, {
    auth: {
      // Disable the default navigator.locks helper which has known deadlock issues
      // in certain mobile and multi-tab browser environments.
      lock: async (name, acquireTimeout, fn) => {
        return await fn();
      },
    },
  });
}
