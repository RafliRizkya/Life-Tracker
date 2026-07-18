/**
 * Supabase service-role client (server-only).
 *
 * Bypasses RLS — only for trusted server-side code with no user session
 * (the WhatsApp webhook, its pull route). Never import from a
 * "use client" file or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */

import { createClient } from "@supabase/supabase-js";

let cached = null;

export function getSupabaseAdmin() {
  if (cached !== null) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return (cached = null);
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
