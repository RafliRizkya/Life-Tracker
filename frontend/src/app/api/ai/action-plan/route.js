import { NextResponse } from "next/server";
import { getCompletionText } from "@/lib/ai/openrouter";
import { buildActionPlanMessages } from "@/lib/ai/actionPlanPrompt";
import { withinDailyLimit } from "@/lib/ai/rateLimit";
import { extractJson } from "@/lib/ai/parseJsonResponse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizeSteps(parsed) {
  if (!Array.isArray(parsed)) return null;
  const steps = parsed
    .filter((s) => s && typeof s.title === "string" && s.title.trim())
    .slice(0, 8)
    .map((s) => ({
      title: s.title.trim().slice(0, 80),
      note: typeof s.note === "string" ? s.note.trim().slice(0, 160) : "",
    }));
  return steps.length ? steps : null;
}

/**
 * Suggest-only: returns step suggestions for the client to review. Never
 * writes to the store itself — saving them as commitments is a normal
 * user-triggered addCommitment() call, same trust boundary as a manual add.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { title, area, why, kind, context } = body || {};
  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "Judul goal/skill kosong." }, { status: 400 });
  }

  if (!withinDailyLimit()) {
    return NextResponse.json(
      { error: "Batas permintaan AI harian tercapai, coba lagi besok." },
      { status: 429 }
    );
  }

  const messages = buildActionPlanMessages({
    title: String(title),
    area,
    why,
    kind,
    context: context === "skill" ? "skill" : "goal",
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

  const steps = normalizeSteps(extractJson(text));
  if (!steps) {
    return NextResponse.json(
      { error: "AI memberi jawaban yang tidak bisa dibaca — coba generate ulang." },
      { status: 502 }
    );
  }

  return NextResponse.json({ steps });
}
