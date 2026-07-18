import { NextResponse } from "next/server";
import { streamChatCompletion } from "@/lib/ai/openrouter";
import { buildMessages } from "@/lib/ai/promptBuilder";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_PER_DAY = Number(process.env.AI_MAX_REQUESTS_PER_DAY) || 200;
let requestCount = 0;
let countResetAt = startOfNextDay();

function startOfNextDay() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

function withinDailyLimit() {
  if (Date.now() > countResetAt) {
    requestCount = 0;
    countResetAt = startOfNextDay();
  }
  if (requestCount >= MAX_PER_DAY) return false;
  requestCount += 1;
  return true;
}

/** Defensive belt-and-suspenders: the client already excludes isPrivate content. */
function stripPrivateContent(context) {
  const json = JSON.stringify(context);
  if (json.includes('"isPrivate":true')) {
    console.warn(
      "[ai/chat] stripped unexpected isPrivate content from context — client-side exclusion should have prevented this"
    );
    return {};
  }
  return context;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { message, context, history } = body || {};
  if (!message || !String(message).trim()) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
  }

  if (!withinDailyLimit()) {
    return NextResponse.json(
      { error: "Batas permintaan harian tercapai, coba lagi besok." },
      { status: 429 }
    );
  }

  const safeContext = stripPrivateContent(context || {});
  const messages = buildMessages({
    contextPayload: safeContext,
    history: Array.isArray(history) ? history : [],
    userMessage: String(message),
  });

  if (process.env.AI_DEBUG_LOG_CONTEXT === "1") {
    console.log(
      `[ai/chat] modules=${Object.keys(safeContext).join(",")} payloadChars=${JSON.stringify(safeContext).length}`
    );
  }

  try {
    const { stream, modelId } = await streamChatCompletion({ messages });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "X-AI-Model-Used": modelId,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Semua model AI sedang tidak tersedia, coba lagi sebentar lagi." },
      { status: 503 }
    );
  }
}
