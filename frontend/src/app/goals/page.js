"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import { Card, Progress, EmptyState } from "@/components/ui";
import {
  Plus, ArrowUpRight, Archive, Target, ChevronRight, X, CheckCircle2,
} from "lucide-react";
import { LIFE_AREAS } from "@/lib/seed";
import { computeGoalProgress, careerReadiness, savingsProgress, goalEvidenceStatus } from "@/lib/insights";
import { formatIDR, formatDateID } from "@/lib/format";
import clsx from "clsx";

export default function GoalsPage() {
  const {
    goals, skills, portfolio, careerMilestones, transactions,
    openQuickAdd, updateGoal, archiveGoal, toggleSavingsMilestone,
  } = useLifeStore();

  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const readiness = careerReadiness(goals, skills, portfolio, careerMilestones);
  const savings = savingsProgress(goals, transactions);
  const ctx = { readiness, savings };

  const filtered = goals
    .filter((g) => g.status !== "archived")
    .filter((g) => (filter === "all" ? true : g.area === filter));

  const active = filtered.filter((g) => g.status !== "completed");
  const completed = filtered.filter((g) => g.status === "completed").length;
  const evidenceOf = (g) => goalEvidenceStatus(g, { skills, careerMilestones, transactions });
  // "On track" needs both progress and recent evidence — an unproven goal can't claim it.
  const onTrack = active.filter(
    (g) => computeGoalProgress(g, ctx) >= 40 && evidenceOf(g).state !== "unproven"
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-24">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="eyebrow">Arah, bukan tekanan</div>
          <h1 className="h-display text-[44px] md:text-[54px] mt-2">
            Goals <em>hidupmu.</em>
          </h1>
        </div>
        <button className="btn-dark" onClick={() => openQuickAdd("goal")} data-testid="new-goal-btn">
          <Plus className="h-3.5 w-3.5" /> New goal
        </button>
      </div>

      {/* summary */}
      <div className="grid grid-cols-3 gap-4 border-y border-line dark:border-night-border py-4 mb-6">
        <SummaryStat value={active.length} label="active goals" />
        <SummaryStat value={onTrack} label="on track" />
        <SummaryStat value={completed} label="completed" />
      </div>

      {/* filter */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>Semua</FilterPill>
        {LIFE_AREAS.map((a) => (
          <FilterPill key={a.key} active={filter === a.key} onClick={() => setFilter(a.key)}>
            {a.label}
          </FilterPill>
        ))}
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Belum ada goal di sini."
          body="Set satu target, sekecil apapun — dari situ arah mulai kelihatan."
          action={
            <button className="btn-dark" onClick={() => openQuickAdd("goal")}>
              <Plus className="h-3.5 w-3.5" /> Buat goal pertama
            </button>
          }
        />
      ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filtered.map((g, i) => {
          const pct = computeGoalProgress(g, ctx);
          const area = LIFE_AREAS.find((a) => a.key === g.area);
          const evidence = evidenceOf(g);
          return (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              onClick={() => setSelected(g)}
              data-testid={`goal-${g.id}`}
              className="text-left card hover:shadow-pop transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow" style={{ color: area?.color }}>
                  {area?.label || g.area}
                </span>
                <span className="flex items-center gap-1.5">
                  {evidence.state === "unproven" && (
                    <span className="chip-muted chip" data-testid={`unproven-${g.id}`} title="Tidak ada aktivitas terkait di area ini dalam 14 hari terakhir">
                      belum ada bukti
                    </span>
                  )}
                  {g.priority === "high" && <span className="chip-warm chip">High</span>}
                </span>
              </div>
              <div className="h-display text-[19px] mt-3 leading-tight">{g.title}</div>
              {g.metric && (
                <div className="mt-2 text-[11.5px] text-ink-muted">
                  {g.metric.unit === "IDR"
                    ? `${formatIDR(g.metric.current)} · target ${formatIDR(g.metric.target)}`
                    : `${g.metric.current} dari ${g.metric.target} ${g.metric.unit}`}
                </div>
              )}
              <div className="mt-6 flex items-center gap-3">
                <Progress value={pct} className="flex-1" />
                <span className="font-mono text-[11.5px] text-forest-500 dark:text-lime">{pct}%</span>
              </div>
              {g.targetDate && (
                <div className="mt-3 text-[10.5px] font-mono text-ink-muted">
                  Target · {formatDateID(g.targetDate)}
                </div>
              )}
            </motion.button>
          );
        })}
      </motion.div>
      )}

      {/* Career breakdown */}
      <section className="mt-16">
        <div className="eyebrow">Career goal breakdown</div>
        <h2 className="h-display text-[28px] mt-2 mb-1">Bagaimana {readiness.overall}% dibangun</h2>
        <p className="text-[13px] text-ink-muted max-w-lg mb-6">
          Kemajuan datang dari bukti, bukan hanya niat.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {readiness.parts.map((p) => (
            <div key={p.key} className="rounded-xl border border-line dark:border-night-border p-4 bg-card dark:bg-night-card">
              <div className="eyebrow">{p.label}</div>
              <div className="h-display text-[24px] mt-1 text-forest-500 dark:text-lime">{Math.round(p.value)}%</div>
              <div className="text-[10.5px] text-ink-muted mt-1">
                Bobot {Math.round(p.weight * 100)}%
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <GoalDetail
            goal={selected}
            ctx={ctx}
            onClose={() => setSelected(null)}
            onArchive={() => { archiveGoal(selected.id); setSelected(null); }}
            onSavingsToggle={(mid) => toggleSavingsMilestone(selected.id, mid)}
            onUpdate={(patch) => { updateGoal(selected.id, patch); setSelected({ ...selected, ...patch }); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryStat({ value, label }) {
  return (
    <div>
      <div className="h-display text-[28px] text-forest-500 dark:text-lime">{value}</div>
      <div className="text-[11.5px] text-ink-muted mt-1">{label}</div>
    </div>
  );
}

function FilterPill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3.5 py-1.5 rounded-full text-[11.5px] font-medium border transition-colors",
        active
          ? "bg-ink text-paper border-ink dark:bg-lime dark:text-forest-800 dark:border-lime"
          : "border-line dark:border-night-border text-ink-muted hover:text-ink dark:hover:text-night-text"
      )}
    >
      {children}
    </button>
  );
}

function GoalDetail({ goal, ctx, onClose, onArchive, onSavingsToggle, onUpdate }) {
  const pct = computeGoalProgress(goal, ctx);
  const area = LIFE_AREAS.find((a) => a.key === goal.area);
  const isSavings = goal.id === "goal-savings-ladder";
  const isCareer = goal.id === "goal-data-analyst";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/50 dark:bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: 480 }}
        animate={{ x: 0 }}
        exit={{ x: 480 }}
        transition={{ type: "spring", damping: 24, stiffness: 240 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-paper dark:bg-night border-l border-line dark:border-night-border overflow-y-auto"
        data-testid="goal-detail-drawer"
      >
        <div className="sticky top-0 flex items-center justify-between p-5 bg-paper/95 dark:bg-night/95 backdrop-blur border-b border-line dark:border-night-border">
          <div className="min-w-0">
            <div className="eyebrow" style={{ color: area?.color }}>{area?.label}</div>
            <div className="h-display text-[22px] mt-1 truncate">{goal.title}</div>
          </div>
          <button onClick={onClose} className="p-1.5 -mr-1 rounded-md hover:bg-line/50" data-testid="close-goal-detail">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div className="h-display text-[42px] text-forest-500 dark:text-lime">{pct}%</div>
              <div className="eyebrow">Progress saat ini</div>
            </div>
            <Progress value={pct} className="mt-2" />
            {goal.why && <p className="mt-4 text-[13px] text-ink-muted italic">&ldquo;{goal.why}&rdquo;</p>}
          </div>

          {goal.metric && !isSavings && (
            <div className="rounded-xl bg-card dark:bg-night-card border border-line dark:border-night-border p-4">
              <div className="eyebrow">Metric</div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="h-display text-[22px]">
                  {goal.metric.unit === "IDR" ? formatIDR(goal.metric.current) : goal.metric.current}
                </div>
                <div className="text-[11.5px] text-ink-muted">
                  dari {goal.metric.unit === "IDR" ? formatIDR(goal.metric.target) : goal.metric.target}
                </div>
              </div>
            </div>
          )}

          {isCareer && ctx?.readiness && (
            <div>
              <div className="eyebrow mb-2">Breakdown kontribusi</div>
              <div className="space-y-2">
                {ctx.readiness.parts.map((p) => (
                  <div key={p.key} className="rounded-lg border border-line dark:border-night-border p-3">
                    <div className="flex justify-between text-[12.5px]">
                      <span className="text-ink-soft">{p.label}</span>
                      <span className="font-mono text-forest-500 dark:text-lime">{Math.round(p.value)}%</span>
                    </div>
                    <Progress value={p.value} className="mt-1.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSavings && ctx?.savings && (
            <div>
              <div className="eyebrow mb-2">Milestone berurutan</div>
              <ul className="space-y-2">
                {ctx.savings.milestones.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-line dark:border-night-border">
                    <button
                      onClick={() => onSavingsToggle(m.id)}
                      className={clsx(
                        "h-5 w-5 rounded-full grid place-items-center border",
                        m.achieved ? "bg-forest-500 border-forest-500 text-white" : "border-line hover:border-forest-500"
                      )}
                      data-testid={`savings-milestone-${m.target}`}
                    >
                      {m.achieved && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                    <div className="flex-1">
                      <div className={clsx("text-[13.5px] font-medium", m.achieved && "line-through text-ink-muted")}>
                        {m.label}
                      </div>
                      {m.achievedAt && (
                        <div className="text-[10.5px] text-ink-muted mt-0.5">
                          Tercapai {formatDateID(m.achievedAt.slice(0,10))}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-ink-muted">
                      {formatIDR(m.target)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {goal.notes && (
            <div>
              <div className="eyebrow mb-2">Catatan</div>
              <p className="text-[13px] leading-relaxed text-ink-soft">{goal.notes}</p>
            </div>
          )}

          <div className="flex gap-2">
            <select
              value={goal.status}
              onChange={(e) => onUpdate({ status: e.target.value })}
              className="input flex-1"
              data-testid="goal-status-select"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={onArchive}
              className="px-3 py-2 rounded-lg border border-line dark:border-night-border text-[12px] text-ink-muted hover:text-terracotta hover:border-terracotta/60"
              data-testid="archive-goal-btn"
            >
              <Archive className="h-3.5 w-3.5 inline mr-1" /> Archive
            </button>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
