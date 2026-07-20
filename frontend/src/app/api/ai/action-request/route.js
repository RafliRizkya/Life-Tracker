import { NextResponse } from "next/server";
import { getCompletionText } from "@/lib/ai/openrouter";
import { buildActionRequestMessages } from "@/lib/ai/actionRequestPrompt";
import { withinDailyLimit } from "@/lib/ai/rateLimit";
import { extractJson } from "@/lib/ai/parseJsonResponse";
import { ACTION_DEFS } from "@/lib/ai/actionSchema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ACTIONS = 5;

/**
 * Suggest-only write path for the /ai chat assistant (2026-07-20). Never
 * writes to the store itself — returns validated action proposals for the
 * client to show as an approve/reject card; applying one is a normal
 * useLifeStore action call (see actionSchema.js#applyAction), same trust
 * boundary as ActionPlanPanel/FinancialPlanCard.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { message, actionContext } = body || {};
  if (!message || !String(message).trim()) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
  }

  if (!withinDailyLimit()) {
    return NextResponse.json(
      { error: "Batas permintaan AI harian tercapai, coba lagi besok." },
      { status: 429 }
    );
  }

  const messages = buildActionRequestMessages({
    message: String(message),
    actionContext: actionContext && typeof actionContext === "object" ? actionContext : {},
  });

  let text;
  try {
    text = await getCompletionText({ messages });
  } catch {
    return NextResponse.json(
      { error: "Semua model AI sedang tidak tersedia, coba lagi sebentar lagi." },
      { status: 503 }
    );
  }

  const parsed = extractJson(text);
  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json(
      { error: "AI memberi jawaban yang tidak bisa dibaca — coba lagi." },
      { status: 502 }
    );
  }

  const rawActions = Array.isArray(parsed.actions) ? parsed.actions.slice(0, MAX_ACTIONS) : [];
  const actions = [];
  const rejected = [];
  for (const raw of rawActions) {
    const def = raw && typeof raw.type === "string" ? ACTION_DEFS[raw.type] : null;
    if (!def) {
      rejected.push({ type: raw?.type || "unknown" });
      continue;
    }
    const params = def.normalize(raw, actionContext || {});
    if (!params) {
      rejected.push({ type: raw.type });
      continue;
    }
    actions.push({ type: raw.type, params, summary: def.describe(params) });
  }

  const reply = typeof parsed.reply === "string" ? parsed.reply.trim().slice(0, 600) : "";

  return NextResponse.json({ actions, rejected, reply });
}
