"use client";

import { useLifeStore } from "@/lib/store";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Check,
  Circle,
  Flame,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Card, Progress } from "@/components/ui";
import {
  monthlyTotals,
  savingsProgress,
  careerReadiness,
  buildInsights,
  skillMomentum,
} from "@/lib/insights";
import {
  formatIDR,
  formatIDRShort,
  formatDateID,
} from "@/lib/format";
import clsx from "clsx";

export default function DashboardPage() {
  const {
    user,
    goals,
    skills,
    transactions,
    reminders,
    commitments,
    activity,
    portfolio,
    careerMilestones,
    reviews,
    reflections,
    settings,
    financeTargets,
    toggleCommitment,
    openQuickAdd,
  } = useLifeStore();

  const osReducedMotion = useReducedMotion();
  const reducedMotion = settings.reducedMotion || osReducedMotion;

  const totals = monthlyTotals(transactions);
  const savings = savingsProgress(goals, transactions, financeTargets);
  const readiness = careerReadiness(goals, skills, portfolio, careerMilestones);
  const momentum = skillMomentum(skills);
  const insights = buildInsights({
    transactions,
    goals,
    skills,
    reminders,
    portfolio,
    milestones: careerMilestones,
    reviews,
    reflections,
  });

  const todaysFocus = commitments.find((c) => !c.done && c.priority === "high") ||
    commitments.find((c) => !c.done);
  const upcoming = commitments.filter((c) => !c.done).slice(0, 5);
  const nextReminders = reminders.filter((r) => r.active).slice(0, 3);

  // Static variants when reduced motion is on — content lands in place, no fade/slide.
  const container = {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: reducedMotion ? {} : { staggerChildren: 0.06 } },
  };
  const item = reducedMotion
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 230, damping: 26, mass: 0.9 } },
      };

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-24">
      {/* HERO ---------------------------------------------------------- */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <div className="eyebrow">Life operating system · {monthLabel()}</div>
        <h1 className="h-display text-[44px] md:text-[64px] leading-[0.98] mt-3">
          {greetingSalute()},{" "}
          <em>{user?.fullName?.split(" ")[0] || "Rafli"}.</em>
          <br />
          <span className="text-ink-soft">
            Bangun hidup yang bergerak <em>ke depan.</em>
          </span>
        </h1>
        <p className="mt-4 max-w-lg text-[14px] text-ink-muted leading-relaxed">
          Uang, momentum belajar, dan langkah karier selanjutnya — dalam satu tempat yang
          tenang. Fokus pada satu hal bermakna hari ini.
        </p>
      </motion.section>

      {/* TOP GRID ----------------------------------------------------- */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Today's Focus */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="h-full bg-gradient-to-br from-forest-500/[0.03] to-lime/[0.14] dark:from-forest-500/10 dark:to-lime/5 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow flex items-center gap-1.5">
                  <Flame className="h-3 w-3" /> Today&rsquo;s focus
                </div>
                <div className="h-display text-[15px] uppercase tracking-wider text-ink-muted mt-2">
                  Satu hal paling bermakna hari ini
                </div>
              </div>
              <button
                onClick={() => openQuickAdd("commitment")}
                className="btn-ghost"
                data-testid="add-focus-btn"
              >
                Tambah <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {todaysFocus ? (
              <button
                onClick={() => toggleCommitment(todaysFocus.id)}
                className="mt-5 w-full text-left group"
                data-testid={`focus-item-${todaysFocus.id}`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={clsx(
                      "mt-1 h-6 w-6 rounded-full grid place-items-center border transition-colors",
                      todaysFocus.done
                        ? "bg-forest-500 border-forest-500 text-white"
                        : "border-forest-400/60 group-hover:border-forest-500"
                    )}
                  >
                    {todaysFocus.done ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2 opacity-0" />}
                  </span>
                  <div className="flex-1">
                    <div className={clsx("h-display text-[24px] md:text-[28px]", todaysFocus.done && "line-through text-ink-muted")}>
                      {todaysFocus.title}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-muted">
                      <span className="chip">{todaysFocus.area}</span>
                      <span>{formatDateID(todaysFocus.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="mt-6 text-[14px] text-ink-muted">
                Belum ada fokus hari ini. Santai dulu, atau langsung
                <button onClick={() => openQuickAdd("commitment")} className="text-forest-500 dark:text-lime underline ml-1">
                  pasang satu target kecil
                </button>.
              </div>
            )}

            <div className="mt-8 border-t border-line dark:border-night-border pt-4 flex items-center justify-between text-[11px] text-ink-muted">
              <span>{commitments.filter(c => !c.done).length} commitment aktif</span>
              <Link href="/goals" className="btn-ghost">Lihat semua <ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>
          </Card>
        </motion.div>

        {/* Life Pulse */}
        <motion.div variants={item}>
          <Card className="h-full">
            <div className="eyebrow">Life pulse</div>
            <div className="h-display text-[18px] mt-1.5">Bagaimana harimu bergerak</div>
            <PulseRow label="Career readiness" value={readiness.overall} />
            <PulseRow label="Skill momentum" value={Math.round(momentum.roleAvg * 20)} tone="lime" />
            <PulseRow label="Saving rate" value={Math.max(0, totals.savingRate)} tone="terra" />
            <PulseRow
              label="Spending score"
              value={totals.spendingScore}
              tone="forest"
            />
          </Card>
        </motion.div>
      </motion.section>

      {/* MID GRID ----------------------------------------------------- */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Career readiness snapshot */}
        <motion.div variants={item} className="md:col-span-2">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow">North star</div>
                <div className="h-display text-[26px] mt-2">
                  Menjadi <em>Data Analyst</em>
                </div>
                <div className="text-[12px] text-ink-muted mt-1">
                  Career readiness dibangun dari skill, bukti kerja, dan konsistensi aksi.
                </div>
              </div>
              <Link href="/career" className="btn-ghost hidden md:inline-flex">
                Buka jalur → <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="text-[52px] font-display font-semibold leading-none text-forest-500 dark:text-lime">
                {readiness.overall}
                <span className="text-[18px] text-ink-muted ml-1">/100</span>
              </div>
              <Progress value={readiness.overall} className="flex-1" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {readiness.parts.slice(0, 6).map((p) => (
                <div key={p.key} className="rounded-xl border border-line dark:border-night-border p-3">
                  <div className="eyebrow text-[9.5px]">{p.label}</div>
                  <div className="h-display text-[18px] mt-1 text-forest-500 dark:text-lime">
                    {Math.round(p.value)}%
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Finance snapshot */}
        <motion.div variants={item}>
          <Card className="bg-forest-700 dark:bg-night-card text-forest-50 border-forest-700 dark:border-night-border overflow-hidden">
            <div className="eyebrow text-forest-100/80">Monthly pulse · finance</div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="h-display text-[30px] text-lime">{formatIDRShort(totals.net)}</div>
              <div className="text-[11px] text-forest-100/70">disimpan</div>
            </div>
            <div className="mt-3 space-y-1.5 text-[12px] text-forest-100/80">
              <div className="flex justify-between"><span>Income</span><span className="font-mono">{formatIDR(totals.income)}</span></div>
              <div className="flex justify-between"><span>Expense</span><span className="font-mono">{formatIDR(totals.expense)}</span></div>
              <div className="flex justify-between border-t border-forest-500/40 pt-1.5"><span>Saving rate</span><span className="font-mono text-lime">{totals.savingRate}%</span></div>
            </div>
            <Link href="/finance" className="mt-5 inline-flex items-center gap-1 text-lime text-[12px] font-semibold">
              Lihat finance <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        </motion.div>
      </motion.section>

      {/* SAVINGS LADDER + INSIGHTS ------------------------------------ */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {savings && (
          <motion.div variants={item} className="md:col-span-2">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <div className="eyebrow">Savings ladder</div>
                  <div className="h-display text-[22px] mt-1.5">Satu milestone dalam satu waktu</div>
                </div>
                <div className="text-right">
                  <div className="h-display text-[20px] text-forest-500 dark:text-lime">{savings.pct}%</div>
                  <div className="eyebrow">menuju Rp {(savings.target/1_000_000).toFixed(0)} jt</div>
                </div>
              </div>
              <div className="relative mt-8 mb-4">
                <div className="progress-track">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${savings.pct}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "block", height: "100%" }}
                    className="progress-fill"
                  />
                </div>
                <div className="mt-4 grid grid-cols-6 gap-1 text-center">
                  {savings.milestones.map((m, i) => (
                    <div key={m.id} className="relative">
                      <div className={clsx(
                        "mx-auto h-3 w-3 rounded-full border-2",
                        m.achieved ? "bg-forest-500 border-forest-500" : "bg-paper border-line dark:bg-night dark:border-night-border"
                      )} />
                      <div className={clsx("font-mono text-[10px] mt-2", m.achieved ? "text-forest-500 dark:text-lime" : "text-ink-muted")}>
                        {(m.target/1_000_000).toFixed(0)}jt
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[12px] text-ink-muted">
                Saat ini <span className="text-ink font-medium">{formatIDR(savings.current)}</span>{" "}
                dari target <span className="text-ink font-medium">{formatIDR(savings.target)}</span>.
                {savings.next && (
                  <> Milestone berikutnya: <span className="text-forest-500 dark:text-lime">Rp {(savings.next.target/1_000_000).toFixed(0)} juta</span>.</>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div variants={item}>
          <Card className="h-full bg-lime/40 dark:bg-forest-800 border-lime/70 dark:border-night-border">
            <div className="eyebrow flex items-center gap-1"><Sparkles className="h-3 w-3" /> Insight</div>
            <div className="h-display text-[20px] mt-2 leading-tight">
              {insights[0]?.title ?? "Kamu sedang membangun sesuatu yang nyata."}
            </div>
            <div className="mt-2 text-[12.5px] text-ink-soft dark:text-lime/90 leading-relaxed">
              {insights[0]?.body ?? "Setiap catatan kecil hari ini jadi bahan cerita kariermu bulan depan. Lanjutkan."}
            </div>
            {insights[0]?.meta && (
              <div className="mt-2 font-mono text-[10.5px] text-ink-soft/70 dark:text-lime/60">
                {insights[0].meta}
              </div>
            )}
            <Link href="/compass" className="mt-4 btn-dark inline-flex bg-forest-700">
              Buka Life Compass
            </Link>
          </Card>
        </motion.div>
      </motion.section>

      {/* COMMITMENTS + REMINDERS -------------------------------------- */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-14 grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-8"
      >
        <motion.div variants={item}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="eyebrow">Minggu ini</div>
              <h2 className="h-display text-[26px] mt-1">Terus melangkah</h2>
            </div>
            <button onClick={() => openQuickAdd("commitment")} className="btn-ghost" data-testid="add-commitment-btn">
              <Plus className="h-3.5 w-3.5" /> Tambah commitment
            </button>
          </div>
          <ul className="divide-y divide-line dark:divide-night-border border-t border-line dark:border-night-border">
            {upcoming.length === 0 && (
              <li className="py-6 text-[13px] text-ink-muted">Belum ada langkah aktif minggu ini. Yuk, mulai dari satu.</li>
            )}
            {upcoming.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3.5" data-testid={`commitment-${c.id}`}>
                <button
                  onClick={() => toggleCommitment(c.id)}
                  className={clsx(
                    "h-5 w-5 rounded-full border grid place-items-center",
                    c.done ? "bg-forest-500 border-forest-500 text-white" : "border-line hover:border-forest-500"
                  )}
                  aria-label="Toggle"
                >
                  {c.done && <Check className="h-3 w-3" />}
                </button>
                <div className={clsx("text-[13.5px] flex-1", c.done && "line-through text-ink-muted")}>
                  {c.title}
                </div>
                <span className="chip capitalize">{c.area}</span>
                <span className="text-[10.5px] font-mono text-ink-muted whitespace-nowrap">
                  {formatDateID(c.dueDate)}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={item}>
          <div className="eyebrow mb-3">Reminders keuangan</div>
          <Card className="!p-4">
            <ul className="space-y-1.5">
              {nextReminders.map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-2 border-b border-line dark:border-night-border last:border-0">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-terracotta" />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{r.title}</div>
                    <div className="text-[11px] text-ink-muted">
                      {r.amount ? formatIDR(r.amount) : "Ikuti pemasukan"} · Setiap tanggal {r.dueDay}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/finance" className="mt-3 btn-ghost text-[11.5px]">
              Kelola semua reminder <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Card>

          <div className="eyebrow mt-8 mb-3">Small wins</div>
          <Card className="!p-4">
            <ul className="space-y-2 text-[12.5px]">
              {activity.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-forest-400" />
                  <span className="text-ink-soft flex-1">{a.message}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </motion.section>

      {/* ALL INSIGHTS ------------------------------------------------- */}
      {insights.length > 1 && (
        <section className="mt-14">
          <div className="eyebrow mb-3">Insight lanjutan</div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {insights.slice(1).map((ins) => (
              <motion.div
                key={ins.key}
                variants={item}
                data-testid={`insight-${ins.key}`}
                className={clsx(
                  "rounded-xl border border-line dark:border-night-border bg-card dark:bg-night-card p-4 border-l-[3px]",
                  ins.tone === "warning"
                    ? "border-l-terracotta"
                    : ins.tone === "positive"
                      ? "border-l-forest-500 dark:border-l-lime"
                      : "border-l-line dark:border-l-night-border"
                )}
              >
                <div className="text-[13.5px] font-semibold leading-snug">{ins.title}</div>
                {ins.body && (
                  <div className="text-[12px] text-ink-muted mt-1 leading-relaxed">{ins.body}</div>
                )}
                {ins.meta && (
                  <div className="mt-2 font-mono text-[10.5px] text-ink-muted/80">{ins.meta}</div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}

function PulseRow({ label, value, tone }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-[11.5px] text-ink-muted">
        <span>{label}</span>
        <span className="font-mono text-forest-500 dark:text-lime">{Math.round(value)}%</span>
      </div>
      <Progress value={value} tone={tone} className="mt-1" />
    </div>
  );
}

function greetingSalute() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

function monthLabel() {
  return new Date().toLocaleString("id-ID", { month: "long" }).toUpperCase();
}
