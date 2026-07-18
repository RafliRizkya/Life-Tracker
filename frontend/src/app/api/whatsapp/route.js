import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { parseMessage } from "@/lib/whatsapp/parser";
import { verifySignature, isAllowedSender } from "@/lib/whatsapp/verify";

// Never cache — the GET handshake must always be evaluated live against
// the current WHATSAPP_VERIFY_TOKEN, and POST must never be memoized.
export const dynamic = "force-dynamic";

const USER_ID = process.env.NEXT_PUBLIC_SEED_USER_ID || "rafli-akbar";

/** Meta's webhook verification handshake. */
export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse(null, { status: 403 });
}

/** Incoming WhatsApp message → parsed transaction, inserted into Supabase. */
export async function POST(request) {
  const rawBody = await request.text();

  const signature = request.headers.get("x-hub-signature-256");
  if (!verifySignature(rawBody, signature, process.env.WHATSAPP_APP_SECRET)) {
    console.warn("[whatsapp] rejected: bad signature");
    return new NextResponse(null, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) {
    // Status callback (delivered/read) or unrelated event — Meta requires 200 or it retries.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!isAllowedSender(message.from)) {
    console.warn(`[whatsapp] ignored message from disallowed sender: ${message.from}`);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const text = message.text?.body || "";
  const parsed = parseMessage(text);
  if (!parsed.matched) {
    console.warn(`[whatsapp] could not parse amount from message: "${text}"`);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("[whatsapp] Supabase admin client not configured");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { error } = await admin.from("transactions").insert({
    user_id: USER_ID,
    title: parsed.title,
    type: parsed.type,
    category: parsed.category,
    amount: parsed.amount,
    date: parsed.date,
    notes: parsed.notes,
    recurring: parsed.recurring,
    source: "whatsapp",
    raw_message: text,
    wa_message_id: message.id,
  });

  if (error && error.code !== "23505") {
    // 23505 = unique_violation on wa_message_id — duplicate delivery, already processed.
    console.error("[whatsapp] insert failed:", error.message);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
