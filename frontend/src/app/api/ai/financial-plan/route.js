import { NextResponse } from "next/server";
import { getCompletionText } from "@/lib/ai/openrouter";
import { buildFinancialPlanMessages } from "@/lib/ai/financialPlanPrompt";
import { withinDailyLimit } from "@/lib/ai/rateLimit";
import { extractJson } from "@/lib/ai/parseJsonResponse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizePlan(parsed) {
  if (!parsed || typeof parsed !== "object") return null;
  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) return null;

  const tips = Array.isArray(parsed.tips)
    ? parsed.tips.filter((t) => typeof t === "string" && t.trim()).slice(0, 5).map((t) => t.trim())
    : [];

  const categoryAdvice = Array.isArray(parsed.categoryAdvice)
    ? parsed.categoryAdvice
        .filter((c) => c && typeof c.category === "string" && Number.isFinite(Number(c.suggestedLimit)))
        .slice(0, 5)
        .map((c) => ({
          category: c.category,
          suggestedLimit: Math.max(0, Math.round(Number(c.suggestedLimit))),
          reason: typeof c.reason === "string" ? c.reason.trim().slice(0, 160) : "",
        }))
    : [];

  const targetSavingRate = Number.isFinite(Number(parsed.targetSavingRate))
    ? Math.max(0, Math.min(100, Math.round(Number(parsed.targetSavingRate))))
    : null;

  return { summary: parsed.summary.trim().slice(0, 400), targetSavingRate, tips, categoryAdvice };
}

/**
 * Suggest-only: analyzes finance context sent by the client and returns a
 * plan. Never writes to the store — category advice is purely informational
 * (budgets have no category dimension since 2026-07-19, nothing to apply it to).
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { context } = body || {};
  if (!context || typeof context !== "object") {
    return NextResponse.json({ error: "Data keuangan kosong." }, { status: 400 });
  }

  if (!withinDailyLimit()) {
    return NextResponse.json(
      { error: "Batas permintaan AI harian tercapai, coba lagi besok." },
      { status: 429 }
    );
  }

  const messages = buildFinancialPlanMessages({ contextPayload: context });

  let text;
  try {
    text = await getCompletionText({ messages });
  } catch {
    return NextResponse.json(
      { error: "Semua model AI sedang tidak tersedia, coba lagi sebentar lagi." },
      { status: 503 }
    );
  }

  const plan = normalizePlan(extractJson(text));
  if (!plan) {
    return NextResponse.json(
      { error: "AI memberi jawaban yang tidak bisa dibaca — coba generate ulang." },
      { status: 502 }
    );
  }

  return NextResponse.json({ plan });
}
