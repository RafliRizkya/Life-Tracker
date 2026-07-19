"use client";

import { motion } from "framer-motion";
import { formatMonthRange } from "@/lib/format";
import { TYPE_ICON, STATUS_META } from "./constants";
import clsx from "clsx";

const NODE_WIDTH = 132;

export default function TrailCard({ milestone: m, x, y, isNew, isSelected, reducedMotion, onSelect }) {
  const meta = STATUS_META[m.status] || STATUS_META.planned;
  const Icon = TYPE_ICON[m.type] || TYPE_ICON.project;
  const isLocked = m.status === "planned";
  const isCurrent = m.status === "in_progress";
  const dateRange = formatMonthRange(m.month, m.year, m.endMonth, m.endYear, m.ongoing);

  // State-tied motion only: freshly-added milestones pop in ("the app
  // responded"); everything else — including the initial page load — lands still.
  const animateEntrance = isNew && !reducedMotion;

  return (
    <motion.li
      layout={!reducedMotion}
      initial={animateEntrance ? { opacity: 0, scale: 0.4 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.2 } }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="absolute flex flex-col items-center gap-2"
      style={{ left: `${x}%`, top: y, x: "-50%", y: "-50%", width: NODE_WIDTH }}
    >
      {isCurrent && !reducedMotion && (
        <motion.span
          className="absolute rounded-full pointer-events-none"
          style={{ width: 60, height: 60, top: 0, background: meta.color }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}
      <motion.button
        type="button"
        onClick={() => onSelect(m)}
        data-testid={`milestone-${m.id}`}
        whileHover={reducedMotion ? undefined : { scale: 1.08, y: -2 }}
        whileTap={reducedMotion ? undefined : { scale: 0.94 }}
        className="relative grid h-14 w-14 place-items-center rounded-full border-[3px] shadow-card transition-shadow hover:shadow-pop bg-card dark:bg-night-card"
        style={{
          background: isLocked ? undefined : meta.color,
          borderColor: meta.color,
          borderStyle: isLocked ? "dashed" : "solid",
          boxShadow: isSelected ? `0 0 0 4px ${meta.color}45` : undefined,
        }}
        aria-label={`${m.title}${isLocked ? " (planned)" : ""}`}
      >
        <Icon className="h-5 w-5" style={{ color: isLocked ? meta.color : "#fffdf8" }} />
        {m.ongoing && (
          <span
            className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-paper dark:border-night"
            style={{ background: meta.color }}
            aria-hidden
          />
        )}
      </motion.button>

      <div className="text-center px-1 max-w-full">
        <div
          className={clsx(
            "text-[11.5px] font-semibold leading-tight line-clamp-2",
            isLocked ? "text-ink-muted" : "text-ink dark:text-night-text"
          )}
        >
          {m.title}
        </div>
        <div className="font-mono text-[9.5px] text-ink-muted mt-0.5">{dateRange}</div>
      </div>
    </motion.li>
  );
}
