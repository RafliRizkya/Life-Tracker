"use client";

import { useEffect, useState } from "react";
import { useLifeStore } from "@/lib/store";
import { useAiStore } from "@/lib/aiStore";
import { detectIntent, buildContext } from "@/lib/ai/contextBuilder";
import { SectionHeader, EmptyState } from "@/components/ui";
import ChatThread from "@/components/ai/ChatThread";
import ChatInput from "@/components/ai/ChatInput";
import { Bot, Lock } from "lucide-react";

const STARTER_PROMPTS = [
  "Ringkas kondisi keuanganku bulan ini",
  "Sejauh apa aku menuju target Data Analyst?",
  "Skill apa yang paling lama tidak kulatih?",
];

async function streamInto({ text, storeSnapshot, priorHistory, aiStore, setWaiting }) {
  const intent = detectIntent(text);
  const { payload, manifest } = buildContext(storeSnapshot, intent);

  let res;
  try {
    res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, context: payload, history: priorHistory }),
    });
  } catch {
    setWaiting(false);
    aiStore.addMessage("assistant", "Gagal terhubung ke server. Coba lagi.", manifest);
    return;
  }

  if (!res.ok) {
    setWaiting(false);
    let errMsg = "Terjadi kesalahan, coba lagi.";
    try {
      const body = await res.json();
      if (body?.error) errMsg = body.error;
    } catch {
      /* ignore parse failure, use default message */
    }
    aiStore.addMessage("assistant", errMsg, manifest);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let placed = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop();
    for (const evt of events) {
      const line = evt.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }
      const delta = parsed.choices?.[0]?.delta?.content;
      if (!delta) continue;
      if (!placed) {
        setWaiting(false);
        aiStore.addMessage("assistant", delta, manifest);
        placed = true;
      } else {
        aiStore.appendToLastMessage(delta);
      }
    }
  }

  setWaiting(false);
  if (!placed) {
    aiStore.addMessage("assistant", "Tidak ada respons diterima. Coba lagi.", manifest);
  } else {
    aiStore.finalizeLastMessage();
  }
}

export default function AiPage() {
  const hydrated = useAiStore((s) => s.hydrated);
  const messages = useAiStore((s) => s.messages);
  const hydrate = useAiStore((s) => s.hydrate);
  const streaming = useAiStore((s) => s.streaming);
  const setStreaming = useAiStore((s) => s.setStreaming);
  const [waitingForFirstToken, setWaitingForFirstToken] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function sendMessage(text) {
    const aiStore = useAiStore.getState();
    const priorHistory = aiStore.messages.map((m) => ({ role: m.role, content: m.content }));
    aiStore.addMessage("user", text);
    setStreaming(true);
    setWaitingForFirstToken(true);

    const storeSnapshot = useLifeStore.getState();
    await streamInto({
      text,
      storeSnapshot,
      priorHistory,
      aiStore,
      setWaiting: setWaitingForFirstToken,
    });
    setStreaming(false);
  }

  if (!hydrated) return null;

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-10 pb-24 flex flex-col min-h-[calc(100vh-64px)]">
      <SectionHeader eyebrow="Asisten AI" title="Tanya apa saja." subtitle="Jawaban berdasarkan datamu sendiri — Finance, Goals, Career, Skills, Life Compass." />

      <div className="flex-1">
        {messages.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="Mulai percakapan"
            body="Aku hanya bisa menjawab, belum bisa mengubah data. Coba salah satu ini:"
            action={
              <div className="flex flex-wrap gap-2 justify-center">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => sendMessage(p)}
                    className="surface-soft border-dashed px-3 py-2 min-h-[44px] text-[13px] font-reflect italic text-ink-soft hover:border-forest-500/50 dark:hover:border-lime/40 transition-colors"
                  >
                    &ldquo;{p}&rdquo;
                  </button>
                ))}
              </div>
            }
          />
        ) : (
          <ChatThread messages={messages} waitingForFirstToken={waitingForFirstToken} />
        )}
      </div>

      <div className="sticky bottom-4 mt-4">
        <ChatInput onSend={sendMessage} disabled={streaming} />
        <div className="eyebrow mt-2 text-center text-ink-muted flex items-center justify-center gap-1.5">
          <Lock className="h-2.5 w-2.5" /> Read-only — asisten hanya membaca datamu, tidak pernah mengubahnya
        </div>
      </div>
    </div>
  );
}
