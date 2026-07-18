import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Must always hit Supabase live — Next.js caches GET route handlers by
// default, which would silently serve stale transactions after a delete
// or a new WhatsApp message.
export const dynamic = "force-dynamic";

const USER_ID = process.env.NEXT_PUBLIC_SEED_USER_ID || "rafli-akbar";

/** Returns WhatsApp-originated transactions so the client store can merge them in. */
export async function GET() {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json([]);

  const { data, error } = await admin
    .from("transactions")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("source", "whatsapp")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[whatsapp/pull] query failed:", error.message);
    return NextResponse.json([]);
  }
  return NextResponse.json(data || []);
}
