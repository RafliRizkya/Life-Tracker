"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";

/**
 * Empathetic AI response shown right after a reflection/ritual entry is
 * submitted. `payload` changes (new object identity) each time a submit
 * happens — that's the trigger. See docs/features/life-compass-rework.md
 * for the privacy-exception scope this deliberately operates under.
 */
export default function AIReflectionResponse({ payload }) {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!payload) return;
    let cancelled = false;
    setStatus("loading");
    setError("");

    fetch("/api/ai/reflection-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(body.error || "Gagal mendapat respons AI.");
          setStatus("error");
          return;
        }
        setResponse(body.response);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setError("Koneksi gagal — coba lagi.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [payload]);

  if (!payload || status === "idle") return null;

  return (
    <div
      className="rounded-2xl border border-forest-500/30 dark:border-lime/30 bg-forest-500/5 dark:bg-lime/5 p-5"
      data-testid="ai-reflection-response"
    >
      <div className="eyebrow flex items-center gap-1.5 text-forest-500 dark:text-lime">
        <Sparkles className="h-3 w-3" /> Untukmu
      </div>
      {status === "loading" && (
        <div className="flex items-center gap-2 text-[12.5px] text-ink-muted mt-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyusun respons...
        </div>
      )}
      {status === "error" && (
        <p className="text-[12px] text-terracotta mt-2" data-testid="ai-reflection-response-error">{error}</p>
      )}
      {status === "ready" && (
        <p className="mt-2 font-reflect italic text-[16px] leading-[1.8] text-ink-soft whitespace-pre-wrap">
          {response}
        </p>
      )}
    </div>
  );
}
