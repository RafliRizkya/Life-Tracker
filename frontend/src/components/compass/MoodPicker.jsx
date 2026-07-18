"use client";

import { REFLECTION_MOOD_WORDS } from "@/lib/seed";
import clsx from "clsx";

export function MoodPicker({ value, onChange, label = "Satu kata untuk hari ini" }) {
  return (
    <div>
      <div className="eyebrow mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {REFLECTION_MOOD_WORDS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onChange(value === w ? "" : w)}
            data-testid={`mood-${w}`}
            className={clsx(
              "px-3 py-1.5 rounded-full text-[11.5px] font-medium border transition-colors",
              value === w
                ? "border-forest-500 bg-forest-500/10 text-forest-500 dark:border-lime dark:text-lime"
                : "border-line dark:border-night-border text-ink-muted hover:text-ink dark:hover:text-night-text"
            )}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
