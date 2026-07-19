"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import clsx from "clsx";

/**
 * AI action-plan generator, shared by Goal and Skill detail drawers.
 * Suggest-only by design: generating never writes anything — the caller's
 * onApply() runs a normal store action (addCommitment / plan text update),
 * only after the user reviews and clicks Apply. Mirrors CLAUDE.md's
 * "AI never writes on its own" boundary for the chat assistant.
 */
export default function ActionPlanPanel({ title, area, why, kind, context, onApply, applyLabel }) {
  const [status, setStatus] = useState("idle"); // idle | loading | error | ready | applied
  const [steps, setSteps] = useState([]);
  const [checked, setChecked] = useState({});
  const [error, setError] = useState("");

  async function generate() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/ai/action-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, area, why, kind, context }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Gagal generate action plan.");
        setStatus("error");
        return;
      }
      setSteps(body.steps);
      setChecked(Object.fromEntries(body.steps.map((_, i) => [i, true])));
      setStatus("ready");
    } catch {
      setError("Koneksi gagal — coba lagi.");
      setStatus("error");
    }
  }

  function apply() {
    const selected = steps.filter((_, i) => checked[i]);
    if (selected.length === 0) return;
    onApply(selected);
    setStatus("applied");
  }

  return (
    <div className="rounded-xl border border-dashed border-line dark:border-night-border p-4" data-testid="action-plan-panel">
      {status === "idle" && (
        <button type="button" onClick={generate} className="btn-ghost text-[12px]" data-testid="generate-action-plan-btn">
          <Sparkles className="h-3.5 w-3.5" /> Generate action plan dengan AI
        </button>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-2 text-[12px] text-ink-muted" data-testid="action-plan-loading">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyusun langkah-langkah...
        </div>
      )}

      {status === "error" && (
        <div className="space-y-2">
          <p className="text-[12px] text-terracotta" data-testid="action-plan-error">{error}</p>
          <button type="button" onClick={generate} className="btn-ghost text-[12px]">
            <Sparkles className="h-3.5 w-3.5" /> Coba lagi
          </button>
        </div>
      )}

      {(status === "ready" || status === "applied") && (
        <div className="space-y-3">
          <div className="eyebrow flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Saran langkah dari AI — review dulu sebelum dipakai
          </div>
          <ul className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5" data-testid={`action-plan-step-${i}`}>
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  disabled={status === "applied"}
                  onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))}
                  className="mt-1"
                />
                <div>
                  <div className="text-[12.5px] font-medium">{s.title}</div>
                  {s.note && <div className="text-[11px] text-ink-muted mt-0.5">{s.note}</div>}
                </div>
              </li>
            ))}
          </ul>
          {status === "ready" ? (
            <button type="button" onClick={apply} className="btn-dark text-[12px]" data-testid="apply-action-plan-btn">
              {applyLabel}
            </button>
          ) : (
            <div className={clsx("text-[12px] text-forest-500 dark:text-lime flex items-center gap-1.5")} data-testid="action-plan-applied">
              <Check className="h-3.5 w-3.5" /> Diterapkan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
