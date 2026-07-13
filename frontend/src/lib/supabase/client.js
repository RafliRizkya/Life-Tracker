/**
 * Supabase client (browser).
 *
 * The client is created lazily and only if NEXT_PUBLIC_SUPABASE_URL is
 * configured. Every mutation in `lib/store.js` transparently falls back
 * to the local `.data` json store when this returns null.
 */

"use client";

import { createClient } from "@supabase/supabase-js";

let cached = null;

export function getSupabase() {
  if (cached !== null) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return (cached = null);
  cached = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: {
      headers: { "x-application-name": "rafli-life-tracker" },
    },
  });
  return cached;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
