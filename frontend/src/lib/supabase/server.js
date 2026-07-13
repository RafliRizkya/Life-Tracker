/**
 * Supabase server client (App Router).
 *
 * Uses the SSR helpers so that in the future — when Auth is turned on —
 * server components + route handlers can share the same authenticated
 * user without any refactor.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const jar = cookies();
  return createServerClient(url, key, {
    cookies: {
      get: (name) => jar.get(name)?.value,
      set: (name, value, options) => {
        try {
          jar.set({ name, value, ...options });
        } catch {
          // Called from Server Component render; safe to ignore.
        }
      },
      remove: (name, options) => {
        try {
          jar.set({ name, value: "", ...options });
        } catch {
          // ignore
        }
      },
    },
  });
}
