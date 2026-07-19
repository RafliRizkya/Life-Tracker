import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Must always hit Supabase live — Next.js caches GET route handlers by
// default, which would silently serve a stale snapshot after a push from
// another device. See docs/features/whatsapp-integration.md "Known issue"
// for the same gotcha on the sibling /api/whatsapp/pull route.
export const dynamic = "force-dynamic";

const USER_ID = process.env.NEXT_PUBLIC_SEED_USER_ID || "rafli-akbar";

/** Returns the last-synced app state so another device can hydrate from it. */
export async function GET() {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ state: null, updatedAt: null });

  const { data, error } = await admin
    .from("app_state")
    .select("state, updated_at")
    .eq("user_id", USER_ID)
    .maybeSingle();

  if (error) {
    console.error("[sync GET] query failed:", error.message);
    return NextResponse.json({ state: null, updatedAt: null });
  }
  return NextResponse.json({
    state: data?.state ?? null,
    updatedAt: data?.updated_at ?? null,
  });
}

/** Upserts the whole app state blob — called (debounced) after every local mutation. */
export async function POST(req) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ ok: false });

  const body = await req.json().catch(() => null);
  if (!body?.state) {
    return NextResponse.json({ error: "missing state" }, { status: 400 });
  }

  const { error } = await admin
    .from("app_state")
    .upsert({ user_id: USER_ID, state: body.state, updated_at: new Date().toISOString() });

  if (error) {
    console.error("[sync POST] upsert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
