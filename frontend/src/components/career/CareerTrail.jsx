"use client";

import { useMemo, useRef } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import TrailCard from "./TrailCard";

function trackOf(m) {
  return m.track || (m.type === "experience" ? "experience" : "milestone");
}

function byStart(a, b) {
  return a.year * 12 + (a.month || 0) - (b.year * 12 + (b.month || 0));
}

/**
 * Dual-track career map: Professional Path (jobs) on the left, Milestones
 * Path (education/certificates/other) on the right — each its own simple
 * vertical timeline with a connector line and card, so title/date/preview
 * are always visible without a click.
 *
 * Motion is state-tied (Linear reference): only milestones added *during this
 * session* animate in; the initial render lands static. The card that opened
 * the drawer stays visibly selected while it's open.
 */
export default function CareerTrail({ milestones, onSelect, selectedId }) {
  const storeReducedMotion = useLifeStore((s) => s.settings.reducedMotion);
  const osReducedMotion = useReducedMotion();
  const reducedMotion = storeReducedMotion || osReducedMotion;

  // Milestones not present on the previous render are "new" — nothing is new
  // on first mount, so the initial page load stays still.
  const idsKey = milestones.map((m) => m.id).join(",");
  const prevIdsRef = useRef(null);
  if (prevIdsRef.current === null || prevIdsRef.current.key !== idsKey) {
    const prevIds = prevIdsRef.current?.ids || null;
    const newIds = new Set();
    if (prevIds) {
      for (const m of milestones) {
        if (!prevIds.has(m.id)) newIds.add(m.id);
      }
    }
    prevIdsRef.current = { key: idsKey, ids: new Set(milestones.map((m) => m.id)), newIds };
  }
  const newIds = prevIdsRef.current.newIds;

  const { experience, milestone } = useMemo(() => {
    const experience = [];
    const milestone = [];
    for (const m of milestones) {
      (trackOf(m) === "experience" ? experience : milestone).push(m);
    }
    experience.sort(byStart);
    milestone.sort(byStart);
    return { experience, milestone };
  }, [milestones]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
      <TrailLane
        label="Jejak Profesional"
        hint="Pengalaman kerja, kronologis"
        items={experience}
        variant="experience"
        onSelect={onSelect}
        selectedId={selectedId}
        newIds={newIds}
        reducedMotion={reducedMotion}
      />
      <TrailLane
        label="Milestone & Pencapaian"
        hint="Pendidikan, sertifikasi, capaian lain"
        items={milestone}
        variant="milestone"
        onSelect={onSelect}
        selectedId={selectedId}
        newIds={newIds}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}

function TrailLane({ label, hint, items, variant, onSelect, selectedId, newIds, reducedMotion }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="text-[11px] text-ink-muted mt-0.5">{hint}</div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-line dark:border-night-border p-6 text-center text-[12px] text-ink-muted">
          Belum ada catatan di jalur ini.
        </div>
      ) : (
        <ul className="mt-4 border-l-2 border-line dark:border-night-border ml-1.5 space-y-4">
          <AnimatePresence mode="sync">
            {items.map((m) => (
              <TrailCard
                key={m.id}
                milestone={m}
                variant={variant}
                isNew={newIds.has(m.id)}
                isSelected={m.id === selectedId}
                reducedMotion={reducedMotion}
                onSelect={onSelect}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
