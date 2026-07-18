"use client";

import { motion } from "framer-motion";
import { formatMonthRange, formatDuration } from "@/lib/format";
import { TYPE_ICON, STATUS_META } from "./constants";
import clsx from "clsx";

export default function TrailCard({ milestone: m, variant, isNew, isSelected, reducedMotion, onSelect }) {
  const meta = STATUS_META[m.status] || STATUS_META.planned;
  const Icon = TYPE_ICON[m.type] || TYPE_ICON.project;
  const isGhost = m.status === "planned";
  const dateRange = formatMonthRange(m.month, m.year, m.endMonth, m.endYear, m.ongoing);
  const duration = formatDuration(m.month, m.year, m.endMonth, m.endYear, m.ongoing);

  // State-tied motion only: freshly-added milestones animate in ("the app
  // responded"); everything else — including the initial page load — lands still.
  const animateEntrance = isNew && !reducedMotion;

  const baseShadow =
    variant === "milestone" && m.status !== "planned"
      ? `0 0 0 1px ${meta.color}30, 0 0 16px ${meta.color}20`
      : "";
  const selectedShadow = isSelected ? `0 0 0 2px ${meta.color}55` : "";
  const boxShadow = [selectedShadow, baseShadow].filter(Boolean).join(", ") || undefined;

  return (
    <motion.li
      layout={!reducedMotion}
      initial={animateEntrance ? { opacity: 0, scale: 0.96, y: 8 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="relative pl-6 -ml-px list-none"
    >
      {/* connector dot — "lands" on the line when the milestone is new */}
      <motion.span
        initial={animateEntrance ? { scale: 0 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 18, delay: animateEntrance ? 0.1 : 0 }}
        className="absolute -left-[7px] top-2 rounded-full border-2"
        style={{
          width: 12,
          height: 12,
          background: isGhost ? "var(--paper, #f5f2ea)" : meta.color,
          borderColor: meta.color,
          borderStyle: isGhost ? "dashed" : "solid",
          boxShadow: m.status === "in_progress" ? `0 0 0 4px ${meta.color}30` : undefined,
        }}
        aria-hidden
      />
      {animateEntrance && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0.5 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="absolute -left-[7px] top-2 rounded-full pointer-events-none"
          style={{ width: 12, height: 12, background: meta.color }}
          aria-hidden
        />
      )}
      <motion.button
        type="button"
        onClick={() => onSelect(m)}
        data-testid={`milestone-${m.id}`}
        whileHover={reducedMotion ? undefined : { y: -2 }}
        whileTap={reducedMotion ? undefined : { scale: 0.99 }}
        className={clsx(
          "w-full text-left border shadow-card transition-shadow hover:shadow-pop",
          variant === "experience"
            ? "rounded-xl p-4 border-l-4 bg-card dark:bg-night-card"
            : "rounded-2xl p-4 bg-card dark:bg-night-card"
        )}
        style={{
          borderColor: variant === "experience" ? meta.color : undefined,
          borderLeftColor: variant === "experience" ? meta.color : undefined,
          boxShadow,
          borderStyle: variant === "milestone" && isGhost ? "dashed" : "solid",
          borderWidth: variant === "milestone" ? 1 : undefined,
        }}
      >
        <div className="flex items-start gap-2.5">
          <span
            className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full"
            style={{ background: `${meta.color}18` }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[14px] font-semibold leading-tight">{m.title}</div>
              {m.ongoing && (
                <span
                  className="chip text-[9.5px]"
                  style={{ background: `${meta.color}18`, color: meta.color }}
                >
                  Berlangsung
                </span>
              )}
            </div>
            {(m.organization || m.location) && (
              <div className="text-[12px] text-ink-muted mt-0.5 truncate">
                {[m.organization, m.location].filter(Boolean).join(" · ")}
              </div>
            )}
            <div className="font-mono text-[10.5px] text-ink-muted mt-1">
              {dateRange}
              {duration && variant === "experience" && <span> · {duration}</span>}
            </div>
            {m.description && (
              <p className="text-[12.5px] text-ink-soft mt-2 leading-relaxed line-clamp-2">
                {m.description}
              </p>
            )}
            {m.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {m.skills.slice(0, 4).map((s) => (
                  <span key={s} className="chip-muted chip text-[9.5px]">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.button>
    </motion.li>
  );
}
