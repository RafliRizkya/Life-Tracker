"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import { Card, Progress } from "@/components/ui";
import {
  monthlyTotals, last6MonthsSeries, spendingByCategory, savingsProgress, budgetWeeklyBreakdown,
} from "@/lib/insights";
import { TX_CATEGORIES } from "@/lib/seed";
import { formatIDR, formatIDRShort, formatDateID, currentMonthKey, formatMonthYear } from "@/lib/format";
import {
  Plus, Trash2, Download, TrendingUp, TrendingDown, AlertTriangle, PowerOff, Power, ChevronDown,
} from "lucide-react";
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
    transactions, budgets, reminders, goals,
    openQuickAdd, updateTransaction, removeTransaction, upsertBudget, removeBudget,
    toggleReminder, removeReminder,
  } = useLifeStore();

  const totals = monthlyTotals(transactions);
  const series = last6MonthsSeries(transactions);
  const catPie = spendingByCategory(transactions);
  const savings = savingsProgress(goals, transactions);

  const [budgetDraft, setBudgetDraft] = useState({ category: "food", limit: "" });
  const [monthOpen, setMonthOpen] = useState(true);
  const [openWeek, setOpenWeek] = useState(null);
  const storeReducedMotion = useLifeStore((s) => s.settings.reducedMotion);
  const osReducedMotion = useReducedMotion();
  const reducedMotion = storeReducedMotion || osReducedMotion;

  const prev = monthlyTotals(transactions, previousMonthKey());
  const trendPct = prev.income ? Math.round(((totals.income - prev.income) / prev.income) * 100) : 0;

  const weeklyBudget = useMemo(
    () => budgetWeeklyBreakdown(budgets, transactions),
    [budgets, transactions]
  );
  const monthBudgetCount = budgets.filter((b) => b.month === currentMonthKey()).length;

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

      {/* Hero + savings ring */}
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
        {savings && (
          <div className="grid place-items-center">
            <SavingsRing pct={savings.pct} />
            <div className="text-center mt-2 text-[10.5px] font-mono text-forest-100/80">
              menuju Rp {(savings.target/1_000_000).toFixed(0)} jt
            </div>
          </div>
        )}
      </motion.section>

      {/* Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Scorecard label="Income" value={formatIDRShort(totals.income)} hint={`vs goal Rp 10 jt`} />
        <Scorecard label="Expense" value={formatIDRShort(totals.expense)} hint={`${Math.round((totals.expense/(totals.income||1))*100)}% dari income`} />
        <Scorecard label="Saving rate" value={`${totals.savingRate}%`} hint="dari income bulan ini" tone="forest" />
        <Scorecard label="Spending score" value={`${totals.spendingScore}/100`} hint="lebih tinggi lebih baik" tone="lime" />
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

      {/* Budgets */}
      <section className="mb-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="eyebrow">Budget bulan ini</div>
            <h2 className="h-display text-[24px] mt-1">Batas yang bijak</h2>
          </div>
        </div>

        <div className="rounded-2xl border border-line dark:border-night-border overflow-hidden mb-3 bg-card dark:bg-night-card">
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
            <span className="text-[11px] text-ink-muted font-mono">{monthBudgetCount} kategori</span>
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
                <div className="border-t border-line dark:border-night-border divide-y divide-line dark:divide-night-border">
                  {weeklyBudget.length === 0 ? (
                    <div className="p-4 text-[12.5px] text-ink-muted">
                      Belum ada budget bulan ini. Tambahkan lewat form di bawah.
                    </div>
                  ) : (
                    weeklyBudget.map((w) => {
                      const weekOpen = openWeek === w.key;
                      const weekSpent = w.categories.reduce((s, c) => s + c.spent, 0);
                      const weekAllocated = w.categories.reduce((s, c) => s + c.allocated, 0);
                      const weekOver = weekSpent > weekAllocated;
                      return (
                        <div key={w.key}>
                          <button
                            type="button"
                            onClick={() => setOpenWeek(weekOpen ? null : w.key)}
                            className="w-full flex items-center gap-3 p-4 pl-6 text-left min-h-[44px]"
                            data-testid={`budget-week-toggle-${w.key}`}
                            aria-expanded={weekOpen}
                          >
                            <span className="flex-1 text-[13px]">
                              {w.label}{" "}
                              <span className="text-ink-muted font-normal">· tgl {w.startDay}–{w.endDay}</span>
                            </span>
                            <span className={clsx("font-mono text-[11.5px] tabular-nums", weekOver ? "text-terracotta" : "text-ink-muted")}>
                              {formatIDRShort(weekSpent)} / {formatIDRShort(weekAllocated)}
                            </span>
                            <ChevronDown className={clsx("h-3.5 w-3.5 text-ink-muted transition-transform flex-none", weekOpen && "rotate-180")} />
                          </button>
                          <AnimatePresence initial={false}>
                            {weekOpen && (
                              <motion.div
                                initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                                transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <ul className="pl-10 pr-4 pb-4 space-y-3">
                                  {w.categories.map((c) => {
                                    const pct = c.allocated > 0 ? Math.min(100, Math.round((c.spent / c.allocated) * 100)) : 0;
                                    const over = c.spent > c.allocated;
                                    return (
                                      <li key={c.category}>
                                        <div className="flex items-center justify-between gap-2 text-[12px]">
                                          <span className="flex-1 truncate">{CATEGORY_LABELS[c.category] || c.category}</span>
                                          <span className={clsx("font-mono tabular-nums", over ? "text-terracotta" : "text-ink-muted")}>
                                            {formatIDR(c.spent)} / {formatIDR(c.allocated)}
                                          </span>
                                          <button
                                            onClick={() => removeBudget(c.budgetId)}
                                            className="grid place-items-center h-8 w-8 -my-1 -mr-1 rounded-md hover:bg-line/50 text-ink-muted hover:text-terracotta flex-none"
                                            aria-label={`Hapus budget ${CATEGORY_LABELS[c.category] || c.category}`}
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                        <Progress value={pct} tone={over ? "terra" : "forest"} className="mt-1.5" />
                                      </li>
                                    );
                                  })}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!budgetDraft.limit) return;
            upsertBudget({
              category: budgetDraft.category,
              limit: Number(budgetDraft.limit),
              month: currentMonthKey(),
            });
            setBudgetDraft({ category: "food", limit: "" });
          }}
          className="rounded-xl border border-dashed border-line dark:border-night-border p-4 flex flex-col gap-2 justify-center max-w-md"
          data-testid="budget-form"
        >
          <div className="eyebrow">Tambah budget baru</div>
          <div className="flex gap-2">
            <select
              value={budgetDraft.category}
              onChange={(e) => setBudgetDraft({ ...budgetDraft, category: e.target.value })}
              className="input"
              data-testid="budget-category"
            >
              {TX_CATEGORIES.expense.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              value={budgetDraft.limit}
              onChange={(e) => setBudgetDraft({ ...budgetDraft, limit: e.target.value })}
              placeholder="Limit (Rp)"
              className="input"
              data-testid="budget-limit"
            />
            <button className="btn-dark" type="submit" data-testid="budget-submit">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
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
              <li key={r.id} className={clsx(
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
                <button onClick={() => toggleReminder(r.id)} className="grid place-items-center h-11 w-11 -my-2 rounded-md hover:bg-line/50" aria-label="Toggle">
                  {r.active ? <Power className="h-3.5 w-3.5 text-forest-500" /> : <PowerOff className="h-3.5 w-3.5 text-ink-muted" />}
                </button>
                <button onClick={() => removeReminder(r.id)} className="grid place-items-center h-11 w-11 -my-2 rounded-md hover:bg-line/50 text-ink-muted hover:text-terracotta" aria-label="Hapus">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
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

function SavingsRing({ pct }) {
  const size = 118;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#3d5f4d" strokeWidth={stroke} fill="none" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="#d5eb7e" strokeWidth={stroke} fill="none" strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="52%" textAnchor="middle" fontFamily="Playfair Display" fontSize="24" fill="#f5f2ea">
        {pct}%
      </text>
    </svg>
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
