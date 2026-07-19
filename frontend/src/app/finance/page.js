"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import { Card, Progress } from "@/components/ui";
import {
  monthlyTotals, last6MonthsSeries, spendingByCategory, savingsProgress, budgetWeeklyBreakdown,
  fundCurrent,
} from "@/lib/insights";
import { TX_CATEGORIES } from "@/lib/seed";
import { formatIDR, formatIDRShort, formatDateID, currentMonthKey, formatMonthYear } from "@/lib/format";
import {
  Plus, Trash2, Download, TrendingUp, TrendingDown, AlertTriangle, PowerOff, Power, ChevronDown,
  Sparkles, Loader2, Pencil, Check as CheckIcon, X as XIcon,
} from "lucide-react";
import { buildContext } from "@/lib/ai/contextBuilder";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import clsx from "clsx";

const CATEGORY_LABELS = Object.fromEntries(
  [...TX_CATEGORIES.income, ...TX_CATEGORIES.expense].map((c) => [c.key, c.label])
);

const PIE_COLORS = ["#315d48", "#eb9b63", "#8a9a5b", "#a8c845", "#c9743c", "#7ba888", "#d7a06c", "#4d8265"];

export default function FinancePage() {
  const {
    transactions, budgets, reminders, goals, financeTargets,
    openQuickAdd, updateTransaction, removeTransaction,
    toggleReminder, removeReminder, updateReminder, setWeeklyBudget, removeWeeklyBudget, setFinanceTarget,
  } = useLifeStore();

  const totals = monthlyTotals(transactions);
  const series = last6MonthsSeries(transactions);
  const catPie = spendingByCategory(transactions);
  const savings = savingsProgress(goals, transactions, financeTargets);
  const emergencyFundCurrent = fundCurrent(transactions, "emergency_fund");

  const [monthOpen, setMonthOpen] = useState(true);
  const storeReducedMotion = useLifeStore((s) => s.settings.reducedMotion);
  const osReducedMotion = useReducedMotion();
  const reducedMotion = storeReducedMotion || osReducedMotion;

  const prev = monthlyTotals(transactions, previousMonthKey());
  const trendPct = prev.income ? Math.round(((totals.income - prev.income) / prev.income) * 100) : 0;

  const weeklyBudget = useMemo(
    () => budgetWeeklyBreakdown(budgets, transactions),
    [budgets, transactions]
  );
  const monthLimitTotal = weeklyBudget.reduce((s, w) => s + (w.limit || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-24">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="eyebrow">Money with intention</div>
          <h1 className="h-display text-[44px] md:text-[54px] mt-2">Financial <em>clarity.</em></h1>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-[12px]" onClick={() => exportCSV(transactions)} data-testid="export-csv-btn">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button className="btn-dark" onClick={() => openQuickAdd("transaction")} data-testid="add-tx-btn">
            <Plus className="h-3.5 w-3.5" /> Transaksi
          </button>
        </div>
      </div>

      {/* Hero — Tabungan now has its own KPI card below, so this no longer
          needs a redundant ring; shows top spending categories instead. */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-forest-700 dark:bg-night-card text-forest-50 p-6 md:p-8 mb-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center"
      >
        <div>
          <div className="eyebrow text-forest-100/80">Net savings · bulan ini</div>
          <div className="h-display text-[36px] md:text-[46px] mt-2 text-lime">
            {formatIDR(totals.net)}
          </div>
          <div className="mt-1 text-[12.5px] text-forest-100/80">
            {totals.savingRate}% dari income · income {formatIDR(totals.income)}
          </div>
          <div className="mt-3 text-[12px]">
            {trendPct >= 0 ? (
              <span className="inline-flex items-center gap-1 text-lime">
                <TrendingUp className="h-3.5 w-3.5" /> +{trendPct}% income vs bulan lalu
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-terracotta">
                <TrendingDown className="h-3.5 w-3.5" /> {trendPct}% income vs bulan lalu
              </span>
            )}
          </div>
        </div>
        {catPie.length > 0 && (
          <div className="w-full md:w-[220px]" data-testid="hero-top-categories">
            <div className="eyebrow text-forest-100/80 mb-2">Pengeluaran terbesar</div>
            <div className="space-y-2.5">
              {catPie.slice(0, 3).map((c) => {
                const pct = catPie[0].amount > 0 ? Math.round((c.amount / catPie[0].amount) * 100) : 0;
                return (
                  <div key={c.category}>
                    <div className="flex justify-between text-[11px] text-forest-100/90 mb-1">
                      <span>{CATEGORY_LABELS[c.category] || c.category}</span>
                      <span className="font-mono">{formatIDRShort(c.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-forest-500/40 overflow-hidden">
                      <div className="h-full bg-lime rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.section>

      {/* Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Scorecard
          label="Income"
          value={formatIDRShort(totals.income)}
          hint={monthLimitTotal > 0
            ? `${formatIDRShort(monthLimitTotal)} dialokasikan mingguan · sisa ${formatIDRShort(Math.max(0, totals.income - monthLimitTotal))}`
            : "vs goal Rp 10 jt"}
        />
        <Scorecard label="Expense" value={formatIDRShort(totals.expense)} hint={`${Math.round((totals.expense/(totals.income||1))*100)}% dari income`} />
        <Scorecard label="Saving rate" value={`${totals.savingRate}%`} hint="dari income bulan ini" tone="forest" />
        <Scorecard label="Spending score" value={`${totals.spendingScore}/100`} hint="lebih tinggi lebih baik" tone="lime" />
      </div>

      {/* Dana Darurat & Tabungan — tracked separately from spending, own targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FundCard
          testId="emergency-fund"
          label="Dana Darurat"
          current={emergencyFundCurrent}
          target={financeTargets.emergencyFund.target}
          onSetTarget={(t) => setFinanceTarget("emergencyFund", t)}
        />
        {savings && (
          <FundCard
            testId="savings"
            label="Tabungan"
            current={savings.current}
            target={savings.target}
            editTarget={savings.grandTarget}
            onSetTarget={(t) => setFinanceTarget("savings", t)}
            milestones={savings.milestones}
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mb-8">
        <Card>
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="eyebrow">Cashflow trend</div>
              <div className="h-display text-[22px] mt-1">Income vs expense</div>
            </div>
            <div className="text-[10.5px] text-ink-muted">6 bulan terakhir</div>
          </div>
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#718078" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => formatIDRShort(v)}
                  contentStyle={{ background: "#fffdf8", border: "1px solid #dddcd4", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="income" fill="#315d48" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#eb9b63" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="eyebrow">Spending by category</div>
          <div className="h-display text-[20px] mt-1 mb-2">Kemana uangmu pergi</div>
          {catPie.length === 0 ? (
            <div className="h-[180px] grid place-items-center text-[13px] text-ink-muted text-center px-4">
              Belum ada pengeluaran tercatat. Begitu kamu mulai, semuanya bakal muncul di sini.
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-[130px] h-[130px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={catPie} dataKey="amount" nameKey="category" innerRadius={35} outerRadius={60} paddingAngle={2}>
                      {catPie.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(v) => formatIDR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-1.5 text-[11.5px]">
                {catPie.slice(0, 6).map((c, i) => (
                  <li key={c.category} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="flex-1">{CATEGORY_LABELS[c.category] || c.category}</span>
                    <span className="font-mono text-ink-muted">{formatIDRShort(c.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* AI Financial Planner */}
      <FinancialPlanCard />

      {/* Budgets */}
      <section className="mb-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="eyebrow">Budget bulan ini</div>
            <h2 className="h-display text-[24px] mt-1">Batas yang bijak</h2>
          </div>
        </div>

        <div className="rounded-2xl border border-line dark:border-night-border overflow-hidden bg-card dark:bg-night-card">
          <button
            type="button"
            onClick={() => setMonthOpen((v) => !v)}
            className="w-full flex items-center gap-3 p-4 text-left min-h-[44px]"
            data-testid="budget-month-toggle"
            aria-expanded={monthOpen}
          >
            <span className="flex-1 text-[14px] font-medium">
              {formatMonthYear(new Date().getMonth() + 1, new Date().getFullYear())}
            </span>
            <span className="text-[11px] text-ink-muted font-mono">
              {monthLimitTotal > 0 ? `${formatIDR(monthLimitTotal)} total limit` : "Belum diatur"}
            </span>
            <ChevronDown className={clsx("h-4 w-4 text-ink-muted transition-transform flex-none", monthOpen && "rotate-180")} />
          </button>

          <AnimatePresence initial={false}>
            {monthOpen && (
              <motion.div
                initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <ul className="border-t border-line dark:border-night-border divide-y divide-line dark:divide-night-border">
                  {weeklyBudget.map((w) => {
                    const pct = w.limit ? Math.min(100, Math.round((w.spent / w.limit) * 100)) : 0;
                    const over = w.limit != null && w.spent > w.limit;
                    return (
                      <li key={w.key} className="p-4" data-testid={`budget-week-${w.key}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[13px]">
                              {w.label}{" "}
                              <span className="text-ink-muted font-normal">· tgl {w.startDay}–{w.endDay}</span>
                            </div>
                            {w.income > 0 && (
                              <div className="text-[10.5px] text-ink-muted mt-0.5">
                                Pemasukan {formatIDR(w.income)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={clsx("font-mono text-[12px] tabular-nums", over ? "text-terracotta" : "text-ink-muted")}>
                              {formatIDR(w.spent)} /
                            </span>
                            <WeeklyLimitEditor
                              limit={w.limit}
                              over={over}
                              onSave={(amount) => setWeeklyBudget(currentMonthKey(), w.key, amount)}
                              onClear={() => w.budgetId && removeWeeklyBudget(w.budgetId)}
                            />
                          </div>
                        </div>
                        {w.limit != null ? (
                          <Progress value={pct} tone={over ? "terra" : "forest"} className="mt-2" />
                        ) : (
                          <div className="mt-2 h-1.5 rounded-full border border-dashed border-line dark:border-night-border" title="Belum ada limit — transaksi tetap tercatat, atur limit untuk lihat persentase pemakaian" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Reminders + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="eyebrow">Money reminders</div>
              <h2 className="h-display text-[22px] mt-1">Life admin</h2>
            </div>
            <button className="btn-ghost text-[12px]" onClick={() => openQuickAdd("reminder")} data-testid="add-reminder-btn">
              <Plus className="h-3.5 w-3.5" /> Tambah
            </button>
          </div>
          <ul className="space-y-2">
            {reminders.map((r) => (
              <ReminderRow
                key={r.id}
                reminder={r}
                onToggle={() => toggleReminder(r.id)}
                onSave={(patch) => updateReminder(r.id, patch)}
                onRemove={() => removeReminder(r.id)}
              />
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="eyebrow">Recent activity</div>
              <h2 className="h-display text-[22px] mt-1">Semua transaksi</h2>
            </div>
          </div>
          <ul className="divide-y divide-line dark:divide-night-border border-y border-line dark:border-night-border max-h-[520px] overflow-y-auto scrollbar-thin">
            {transactions.slice(0, 60).map((t) => (
              <li key={t.id} className="flex items-center gap-4 py-3.5" data-testid={`tx-${t.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] truncate">{t.title}</div>
                  <div className="text-[10.5px] text-ink-muted mt-0.5">
                    {CATEGORY_LABELS[t.category] || t.category} · {formatDateID(t.date)}
                  </div>
                </div>
                <div className={clsx(
                  "font-mono text-[13.5px] font-medium whitespace-nowrap tabular-nums",
                  t.type === "income" ? "text-forest-500 dark:text-lime" : "text-ink"
                )}>
                  {t.type === "income" ? "+" : "−"} {formatIDR(t.amount)}
                </div>
                <button
                  onClick={() => removeTransaction(t.id)}
                  className="grid place-items-center h-11 w-11 -my-1.5 rounded-md hover:bg-line/50 text-ink-muted hover:text-terracotta"
                  aria-label="Hapus"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/**
 * AI financial planner — suggest-only, purely informational. Category
 * advice used to have a "Terapkan" button wired to a per-category budget,
 * but budgets are now a single flat weekly limit (no category dimension —
 * see FR-FIN-05 2026-07-19), so there's nothing left to apply it to.
 */
function FinancialPlanCard() {
  const [status, setStatus] = useState("idle"); // idle | loading | error | ready
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  async function generate() {
    setStatus("loading");
    setError("");
    try {
      const storeSnapshot = useLifeStore.getState();
      const { payload } = buildContext(storeSnapshot, new Set(["finance", "goals"]));
      const res = await fetch("/api/ai/financial-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: payload }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Gagal generate rencana keuangan.");
        setStatus("error");
        return;
      }
      setPlan(body.plan);
      setStatus("ready");
    } catch {
      setError("Koneksi gagal — coba lagi.");
      setStatus("error");
    }
  }

  return (
    <Card className="mb-8" data-testid="financial-plan-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> AI Financial Planner</div>
          <div className="h-display text-[22px] mt-1">Rencana keuangan</div>
        </div>
        {status !== "loading" && (
          <button type="button" onClick={generate} className="btn-ghost text-[12px]" data-testid="generate-financial-plan-btn">
            <Sparkles className="h-3.5 w-3.5" /> {status === "ready" ? "Generate ulang" : "Generate"}
          </button>
        )}
      </div>

      {status === "idle" && (
        <p className="text-[12.5px] text-ink-muted mt-3">
          Analisis kondisi keuanganmu bulan ini dan dapat saran alokasi dana, target saving rate, dan tips berhemat.
        </p>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-2 text-[12.5px] text-ink-muted mt-3" data-testid="financial-plan-loading">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menganalisis kondisi keuanganmu...
        </div>
      )}

      {status === "error" && (
        <p className="text-[12.5px] text-terracotta mt-3" data-testid="financial-plan-error">{error}</p>
      )}

      {status === "ready" && plan && (
        <div className="mt-4 space-y-4">
          <p className="text-[13px] text-ink-soft leading-relaxed">{plan.summary}</p>

          {plan.targetSavingRate != null && (
            <div className="text-[12.5px]">
              <span className="text-ink-muted">Target saving rate: </span>
              <span className="font-mono font-medium text-forest-500 dark:text-lime">{plan.targetSavingRate}%</span>
            </div>
          )}

          {plan.tips.length > 0 && (
            <ul className="space-y-1.5">
              {plan.tips.map((tip, i) => (
                <li key={i} className="text-[12.5px] text-ink-soft flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-forest-400 flex-none" />
                  {tip}
                </li>
              ))}
            </ul>
          )}

          {plan.categoryAdvice.length > 0 && (
            <div className="space-y-2">
              <div className="eyebrow">Saran per kategori</div>
              {plan.categoryAdvice.map((c) => (
                <div key={c.category} className="flex items-center gap-3 rounded-lg border border-line dark:border-night-border p-3" data-testid={`financial-plan-category-${c.category}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium">{CATEGORY_LABELS[c.category] || c.category}</div>
                    {c.reason && <div className="text-[11px] text-ink-muted mt-0.5">{c.reason}</div>}
                  </div>
                  <div className="font-mono text-[12.5px] text-ink-muted whitespace-nowrap">{formatIDR(c.suggestedLimit)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/** Click the limit amount to type a weekly spending cap; clearing it removes the limit entirely. */
function WeeklyLimitEditor({ limit, over, onSave, onClear }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(limit ?? ""));

  function commit() {
    const trimmed = draft.trim();
    if (trimmed === "" || Number(trimmed) === 0) {
      onClear();
    } else {
      onSave(Number(trimmed));
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        type="number"
        min="0"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") setEditing(false);
        }}
        className="input !py-1 !px-2 w-24 text-[12px] font-mono"
        data-testid="weekly-allocation-input"
      />
    );
  }

  if (limit == null) {
    return (
      <button
        type="button"
        onClick={() => { setDraft(""); setEditing(true); }}
        className="font-mono text-ink-muted underline decoration-dotted underline-offset-2 hover:text-ink dark:hover:text-night-text"
        data-testid="weekly-allocation-display"
      >
        atur limit
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setDraft(String(limit)); setEditing(true); }}
      className={clsx(
        "font-mono tabular-nums underline decoration-dotted underline-offset-2",
        over ? "text-terracotta" : "text-ink-muted hover:text-ink dark:hover:text-night-text"
      )}
      title="Klik untuk ubah limit minggu ini"
      data-testid="weekly-allocation-display"
    >
      {formatIDR(limit)}
    </button>
  );
}

/** Dana Darurat / Tabungan KPI card — separate from spending, own user-set target. */
/**
 * `target` drives the progress bar/big number — for Tabungan this is the
 * staged (next-milestone) target, not the grand total, so progress climbs
 * 0→100% per stage instead of crawling toward a distant ceiling the whole
 * time. `editTarget` (defaults to `target`) is what the click-to-edit
 * field actually writes to `financeTargets` — for Tabungan that must stay
 * the grand total, or editing the currently-displayed "Rp10jt" stage would
 * silently overwrite the real Rp100jt goal.
 */
function FundCard({ testId, label, current, target, editTarget, onSetTarget, milestones }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <Card data-testid={`fund-card-${testId}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="eyebrow">{label}</div>
        <TargetEditor target={editTarget ?? target} onSave={onSetTarget} testId={testId} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="h-display text-[26px] text-forest-500 dark:text-lime">{formatIDRShort(current)}</div>
        <div className="text-[11px] text-ink-muted">dari {formatIDRShort(target)}</div>
      </div>
      <Progress value={pct} className="mt-3" tone="forest" />
      {milestones && milestones.length > 0 && (
        <div className="mt-4 flex justify-between gap-1">
          {milestones.map((m) => (
            <div key={m.target} className="text-center flex-1">
              <div className={clsx("mx-auto h-2.5 w-2.5 rounded-full", m.achieved ? "bg-forest-500 dark:bg-lime" : "bg-line dark:bg-night-border")} />
              <div className={clsx("font-mono text-[9px] mt-1", m.achieved ? "text-forest-500 dark:text-lime" : "text-ink-muted")}>
                {(m.target / 1_000_000).toFixed(0)}jt
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TargetEditor({ target, onSave, testId }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(target));

  function commit() {
    const n = Number(draft.trim());
    if (n > 0) onSave(n);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        type="number"
        min="0"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") setEditing(false);
        }}
        className="input !py-1 !px-2 w-28 text-[11px] font-mono"
        data-testid={`fund-target-input-${testId}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setDraft(String(target)); setEditing(true); }}
      className="text-[10.5px] text-ink-muted underline decoration-dotted underline-offset-2 hover:text-ink dark:hover:text-night-text"
      data-testid={`fund-target-display-${testId}`}
    >
      target {formatIDR(target)}
    </button>
  );
}

const REMINDER_CADENCES = [
  { key: "monthly", label: "monthly" },
  { key: "quarterly", label: "quarterly" },
  { key: "yearly", label: "yearly" },
  { key: "once", label: "once" },
];

function ReminderRow({ reminder: r, onToggle, onSave, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  function startEdit() {
    setDraft({ title: r.title, amount: r.amount ?? "", dueDay: r.dueDay, cadence: r.cadence });
    setEditing(true);
  }

  function commit() {
    if (!draft.title.trim()) return;
    onSave({
      title: draft.title.trim(),
      amount: draft.amount === "" ? null : Number(draft.amount),
      dueDay: Number(draft.dueDay) || 1,
      cadence: draft.cadence,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-forest-500/50 dark:border-lime/50 p-4 grid gap-2" data-testid={`reminder-edit-${r.id}`}>
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="input"
          placeholder="Judul reminder"
          data-testid="reminder-edit-title"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            min="0"
            value={draft.amount}
            onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
            className="input"
            placeholder="Nominal (opsional)"
            data-testid="reminder-edit-amount"
          />
          <input
            type="number"
            min="1"
            max="31"
            value={draft.dueDay}
            onChange={(e) => setDraft({ ...draft, dueDay: e.target.value })}
            className="input"
            data-testid="reminder-edit-dueday"
          />
          <select
            value={draft.cadence}
            onChange={(e) => setDraft({ ...draft, cadence: e.target.value })}
            className="input"
            data-testid="reminder-edit-cadence"
          >
            {REMINDER_CADENCES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={commit} className="btn-dark text-[12px]" data-testid="reminder-edit-save">
            <CheckIcon className="h-3.5 w-3.5" /> Simpan
          </button>
          <button onClick={() => setEditing(false)} className="btn-ghost text-[12px]" data-testid="reminder-edit-cancel">
            <XIcon className="h-3.5 w-3.5" /> Batal
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className={clsx(
      "rounded-xl border p-4 flex items-start gap-3",
      r.active ? "border-line dark:border-night-border bg-card dark:bg-night-card" : "border-line/50 opacity-60"
    )}>
      <span className={clsx("mt-1 h-2.5 w-2.5 rounded-full", r.active ? "bg-terracotta" : "bg-line")} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium">{r.title}</div>
        <div className="text-[11px] text-ink-muted">
          {r.amount ? formatIDR(r.amount) : "Ikuti nominal masukan"} · setiap tanggal {r.dueDay} · {r.cadence}
        </div>
      </div>
      <button onClick={startEdit} className="grid place-items-center h-11 w-11 -my-2 rounded-md hover:bg-line/50 text-ink-muted hover:text-ink dark:hover:text-night-text" aria-label="Edit" data-testid={`edit-reminder-${r.id}`}>
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button onClick={onToggle} className="grid place-items-center h-11 w-11 -my-2 rounded-md hover:bg-line/50" aria-label="Toggle">
        {r.active ? <Power className="h-3.5 w-3.5 text-forest-500" /> : <PowerOff className="h-3.5 w-3.5 text-ink-muted" />}
      </button>
      <button onClick={onRemove} className="grid place-items-center h-11 w-11 -my-2 rounded-md hover:bg-line/50 text-ink-muted hover:text-terracotta" aria-label="Hapus">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function Scorecard({ label, value, hint, tone }) {
  return (
    <div className="rounded-xl border border-line dark:border-night-border p-5 bg-card dark:bg-night-card">
      <div className="eyebrow">{label}</div>
      <div className={clsx(
        "h-display text-[24px] mt-1.5 tabular-nums",
        tone === "forest" && "text-forest-500 dark:text-lime",
        tone === "lime" && "text-forest-500 dark:text-lime",
      )}>
        {value}
      </div>
      <div className="text-[10.5px] text-ink-muted mt-1.5">{hint}</div>
    </div>
  );
}

function previousMonthKey() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function exportCSV(transactions) {
  const rows = [
    ["id", "date", "type", "category", "title", "amount", "notes"],
    ...transactions.map((t) => [
      t.id, t.date, t.type, t.category, JSON.stringify(t.title), t.amount, JSON.stringify(t.notes || ""),
    ]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rafli-transactions-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
