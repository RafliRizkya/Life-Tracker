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

const ROW_HEIGHT = 128;
const X_ANCHORS = [22, 50, 78]; // zigzag: left, center, right (% of trail width)

/** Smooth S-curve through a sequence of {x,y} points — flowchart-style bezier per segment. */
function buildPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }
  return d;
}

/**
 * Single-track "skill map" trail: a winding path (SVG S-curve through fixed
 * zigzag anchor points) with game-style circular nodes, one track rendered
 * at a time (`track` prop) — the caller (career/page.js) switches tracks via
 * a segmented control instead of showing both side by side.
 *
 * Motion is state-tied (Linear reference): only milestones added *during this
 * session* pop in; the initial render lands static. The in-progress node
 * pulses to read as "you are here" on the map; the path itself is solid up
 * to the last non-planned node and dashed/muted beyond it (locked ahead).
 */
export default function CareerTrail({ milestones, track, onSelect, selectedId }) {
  const storeReducedMotion = useLifeStore((s) => s.settings.reducedMotion);
  const osReducedMotion = useReducedMotion();
  const reducedMotion = storeReducedMotion || osReducedMotion;

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

  const items = useMemo(() => {
    const experience = [];
    const milestone = [];
    for (const m of milestones) {
      (trackOf(m) === "experience" ? experience : milestone).push(m);
    }
    experience.sort(byStart);
    milestone.sort(byStart);
    return track === "experience" ? experience : milestone;
  }, [milestones, track]);

  const points = useMemo(
    () =>
      items.map((m, i) => ({
        m,
        x: X_ANCHORS[i % X_ANCHORS.length],
        y: i * ROW_HEIGHT + ROW_HEIGHT / 2,
      })),
    [items]
  );

  const totalHeight = items.length * ROW_HEIGHT;
  const lastActiveIdx = points.reduce((acc, p, i) => (p.m.status !== "planned" ? i : acc), -1);

  const fullPathD = useMemo(() => buildPath(points), [points]);
  const activePathD = useMemo(
    () => (lastActiveIdx > 0 ? buildPath(points.slice(0, lastActiveIdx + 1)) : ""),
    [points, lastActiveIdx]
  );

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line dark:border-night-border p-8 text-center text-[12px] text-ink-muted">
        Belum ada catatan di jalur ini.
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-md" style={{ height: totalHeight }}>
      {points.length > 1 && (
        <svg
          className="absolute inset-0"
          width="100%"
          height={totalHeight}
          viewBox={`0 0 100 ${totalHeight}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={fullPathD}
            fill="none"
            className="text-line dark:text-night-border"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 9"
            vectorEffect="non-scaling-stroke"
          />
          {activePathD && (
            <path
              d={activePathD}
              fill="none"
              stroke="#315d48"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      )}
      <ul className="relative list-none m-0 p-0">
        <AnimatePresence mode="sync">
          {points.map(({ m, x, y }) => (
            <TrailCard
              key={m.id}
              milestone={m}
              x={x}
              y={y}
              isNew={newIds.has(m.id)}
              isSelected={m.id === selectedId}
              reducedMotion={reducedMotion}
              onSelect={onSelect}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
