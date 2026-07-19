import { NextResponse } from "next/server";
import { getCompletionText } from "@/lib/ai/openrouter";
import { buildReflectionResponseMessages } from "@/lib/ai/reflectionResponsePrompt";
import { withinDailyLimit } from "@/lib/ai/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * SCOPED EXCEPTION to the "raw reflection text never reaches an LLM" rule
 * (CLAUDE.md AI section). Confirmed directly with the user (2026-07-19,
 * AskUserQuestion) that a genuinely empathetic response needs the actual
 * words written, not just mood/stress numbers. Boundaries of the exception,
 * enforced here:
 *  - Only the single entry the client sends in this one request — never
 *    history, never other reflections. The client only ever sends the
 *    entry that was *just* submitted (see AIReflectionResponse.jsx).
 *  - Nothing is logged or persisted server-side beyond the model call.
 *  - This route is entirely separate from /api/ai/chat's context pipeline
 *    — it never touches contextBuilder.js, so the isPrivate stripping
 *    there is untouched and still applies to the chat assistant, action
 *    plans, and financial planner.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { text, moodWord, energyLevel, stressLevel } = body || {};
  if (!text || !String(text).trim()) {
    return NextResponse.json({ error: "Tidak ada isi untuk direspons." }, { status: 400 });
  }

  if (!withinDailyLimit()) {
    return NextResponse.json(
      { error: "Batas permintaan AI harian tercapai, coba lagi besok." },
      { status: 429 }
    );
  }

  const messages = buildReflectionResponseMessages({
    text: String(text).slice(0, 4000),
    moodWord,
    energyLevel,
    stressLevel,
  });

  let response;
  try {
    response = await getCompletionText({ messages });
  } catch {
    return NextResponse.json(
      { error: "Semua model AI sedang tidak tersedia, coba lagi sebentar lagi." },
      { status: 503 }
    );
  }

  if (!response.trim()) {
    return NextResponse.json({ error: "AI tidak memberi respons — coba lagi." }, { status: 502 });
  }

  return NextResponse.json({ response: response.trim() });
}
