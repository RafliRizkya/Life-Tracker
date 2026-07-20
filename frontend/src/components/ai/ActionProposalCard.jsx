"use client";

import { useState } from "react";
import { Sparkles, Check, X } from "lucide-react";
import clsx from "clsx";
import { useLifeStore } from "@/lib/store";
import { useAiStore } from "@/lib/aiStore";
import { applyAction } from "@/lib/ai/actionSchema";

/**
 * Inline approve/reject card for the chat assistant's write-proposal path
 * (2026-07-20) — same suggest-only shape as ActionPlanPanel: the model's
 * proposal is already validated server-side (actionSchema.js#normalize),
 * this only decides which checked actions actually run, and running one
 * is a normal useLifeStore action call, never a bespoke write path.
 */
export default function ActionProposalCard({ messageId, proposal }) {
  const { actions = [], rejected = [], status } = proposal;
  const [checked, setChecked] = useState(() => Object.fromEntries(actions.map((_, i) => [i, true])));

  if (actions.length === 0) return null;

  function approve() {
    const store = useLifeStore.getState();
    const selected = actions.filter((_, i) => checked[i]);
    if (selected.length === 0) return;
    for (const action of selected) {
      try {
        applyAction(action, store);
      } catch {
        /* one bad action shouldn't block the rest — normalize() already
           validated shape, this only guards an unexpected store error */
      }
    }
    useAiStore.getState().setProposalStatus(messageId, "approved");
  }

  function reject() {
    useAiStore.getState().setProposalStatus(messageId, "dismissed");
  }

  return (
    <div className="mt-3 rounded-xl border border-dashed border-line dark:border-night-border p-4" data-testid="action-proposal-card">
      <div className="eyebrow flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" /> Usulan perubahan — review dulu sebelum disimpan
      </div>
      <ul className="space-y-2 mt-3">
        {actions.map((a, i) => (
          <li key={i} className="flex items-start gap-2.5" data-testid={`action-proposal-item-${i}`}>
            <input
              type="checkbox"
              checked={!!checked[i]}
              disabled={status !== "pending"}
              onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))}
              className="mt-1"
            />
            <div className="text-[12.5px]">{a.summary}</div>
          </li>
        ))}
      </ul>
      {rejected.length > 0 && (
        <p className="text-[11px] text-ink-muted mt-2">
          {rejected.length} usulan lain dilewati karena datanya tidak lengkap/valid.
        </p>
      )}

      {status === "pending" && (
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={approve} className="btn-dark text-[12px]" data-testid="approve-action-proposal-btn">
            <Check className="h-3.5 w-3.5" /> Terapkan
          </button>
          <button type="button" onClick={reject} className="btn-ghost text-[12px]" data-testid="reject-action-proposal-btn">
            <X className="h-3.5 w-3.5" /> Abaikan
          </button>
        </div>
      )}
      {status === "approved" && (
        <div className="text-[12px] text-forest-500 dark:text-lime flex items-center gap-1.5 mt-3" data-testid="action-proposal-applied">
          <Check className="h-3.5 w-3.5" /> Diterapkan.
        </div>
      )}
      {status === "dismissed" && (
        <div className="text-[12px] text-ink-muted mt-3" data-testid="action-proposal-dismissed">
          Diabaikan — tidak ada perubahan disimpan.
        </div>
      )}
    </div>
  );
}
