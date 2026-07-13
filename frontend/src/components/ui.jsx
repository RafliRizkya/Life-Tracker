"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

/**
 * Simple animated progress bar. Respects reduced-motion.
 */
export function Progress({ value = 0, max = 100, className, tone = "forest", showLabel = false }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tones = {
    forest: "bg-forest-500",
    lime: "bg-lime-deep",
    terra: "bg-terracotta",
    warm: "bg-terracotta-deep",
  };
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div className="progress-track flex-1">
        <motion.span
          className={clsx("progress-fill", tones[tone])}
          initial={{ width: "0%" }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "block", height: "100%", borderRadius: "inherit" }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-[11px] text-forest-500 dark:text-lime">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

export function Card({ children, className, as: As = "article", ...props }) {
  return (
    <As className={clsx("card", className)} {...props}>
      {children}
    </As>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, action, className }) {
  return (
    <div className={clsx("flex items-end justify-between gap-4 mb-5", className)}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        {title && <h2 className="h-display text-[26px] md:text-[30px] mt-1.5">{title}</h2>}
        {subtitle && (
          <p className="text-[13px] text-ink-muted mt-2 max-w-lg">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="h-display text-[24px] mt-1">{value}</div>
      {hint && <div className="text-[11px] text-ink-muted mt-1">{hint}</div>}
    </div>
  );
}

export function EmptyState({ title, body, icon: Icon, action, className }) {
  return (
    <div className={clsx("text-center py-14 px-6", className)}>
      {Icon && (
        <div className="mx-auto h-10 w-10 rounded-full bg-forest-500/10 grid place-items-center mb-3">
          <Icon className="h-4 w-4 text-forest-500 dark:text-lime" />
        </div>
      )}
      <div className="h-display text-[22px]">{title}</div>
      {body && <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
