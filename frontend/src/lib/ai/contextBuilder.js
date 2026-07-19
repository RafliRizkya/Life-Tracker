"use client";

/**
 * Client-side context builder for the AI assistant. Pure functions, no
 * store import — takes plain data slices, mirrors insights.js's shape so
 * it stays easy to reason about and test in isolation.
 *
 * HARD PRIVACY RULE: raw reflection/letter body text is never assembled
 * into outbound context, regardless of intent. Only the aggregated,
 * non-quoting output of reflectionInsights() is available to the model.
 * This is a stated MVP default, not a bug — see docs/features/ai-assistant.md.
 */

import {
  monthlyTotals,
  spendingByCategory,
  savingsProgress,
  careerReadiness,
  skillMomentum,
  reflectionInsights,
  reviewInsights,
  computeGoalProgress,
  goalKind,
} from "../insights";
import { formatIDR, formatDateID, currentMonthKey } from "../format";

export const MODULE_KEYWORDS = {
  finance: /uang|budget|anggaran|pengeluaran|pemasukan|tabungan|belanja|transaksi|gaji|hemat|saving/i,
  goals: /\bgoal\b|target|impian|milestone/i,
  career: /karir|karier|kerja\b|\bjob\b|portfolio|pekerjaan|linkedin/i,
  skills: /\bskill\b|belajar|sql|python|latihan|kursus/i,
  reflection: /refleksi|perasaan|\bmood\b|jurnal|berbenah/i,
  review: /weekly review|review mingguan|minggu ini|minggu lalu/i,
};

const SUMMARY_WORDS = /ringkas|overview|semua|summary|rangkum|kondisi(ku)?\b/i;

/** Returns a Set of module keys relevant to the message, or {"all"} for broad/summary asks. */
export function detectIntent(message) {
  const text = message || "";
  if (SUMMARY_WORDS.test(text)) return new Set(["all"]);

  const matched = new Set();
  for (const [key, re] of Object.entries(MODULE_KEYWORDS)) {
    if (re.test(text)) matched.add(key);
  }
  if (matched.size === 0) return new Set(["all"]);
  return matched;
}

function prevMonthKey() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildFinance(store) {
  const { transactions = [], goals = [], financeTargets } = store;
  const cur = monthlyTotals(transactions);
  const prev = monthlyTotals(transactions, prevMonthKey());
  const byCategory = spendingByCategory(transactions).slice(0, 6);
  const savings = savingsProgress(goals, transactions, financeTargets);

  const twoMonthKeys = new Set([currentMonthKey(), prevMonthKey()]);
  const recentTx = transactions
    .filter((t) => twoMonthKeys.has(String(t.date).slice(0, 7)))
    .slice(0, 40)
    .map((t) => ({
      title: t.title,
      type: t.type,
      category: t.category,
      amount: formatIDR(t.amount),
      date: formatDateID(t.date),
    }));

  return {
    bulanIni: {
      pemasukan: formatIDR(cur.income),
      pengeluaran: formatIDR(cur.expense),
      net: formatIDR(cur.net),
      savingRate: `${cur.savingRate}%`,
      spendingScore: cur.spendingScore,
    },
    bulanLalu: {
      pemasukan: formatIDR(prev.income),
      pengeluaran: formatIDR(prev.expense),
      net: formatIDR(prev.net),
    },
    pengeluaranPerKategori: byCategory.map((c) => ({
      kategori: c.category,
      jumlah: formatIDR(c.amount),
    })),
    tabungan: savings
      ? {
          terkumpul: formatIDR(savings.current),
          target: formatIDR(savings.target),
          persen: `${savings.pct}%`,
        }
      : null,
    transaksiTerbaru: recentTx,
  };
}

function buildGoals(store, ctx) {
  const { goals = [] } = store;
  return goals
    .filter((g) => g.status !== "archived")
    .map((g) => ({
      title: g.title,
      area: g.area,
      kind: goalKind(g),
      status: g.status,
      priority: g.priority,
      why: g.why,
      targetDate: g.targetDate ? formatDateID(g.targetDate) : null,
      progress: `${computeGoalProgress(g, ctx)}%`,
    }));
}

function buildCareer(store) {
  const { goals = [], skills = [], portfolio = [], careerMilestones = [] } = store;
  const readiness = careerReadiness(goals, skills, portfolio, careerMilestones);
  const recentMilestones = careerMilestones.slice(0, 6).map((m) => ({
    title: m.title,
    type: m.type,
    status: m.status,
    when: formatDateYearMonth(m.month, m.year),
  }));
  return {
    careerReadinessOverall: `${readiness.overall}%`,
    breakdown: readiness.parts.map((p) => ({ label: p.label, persen: `${Math.round(p.value)}%` })),
    portfolio: portfolio.map((p) => ({ title: p.title, status: p.status, tools: p.tools })),
    milestonesTerbaru: recentMilestones,
  };
}

function formatDateYearMonth(month, year) {
  if (!month || !year) return null;
  return formatDateID(`${year}-${String(month).padStart(2, "0")}-01`).replace(/^\d+\s/, "");
}

function buildSkills(store) {
  const { skills = [] } = store;
  const momentum = skillMomentum(skills);
  return {
    rataRataLevel: momentum.avg,
    rataRataLevelPeranRole: momentum.roleAvg,
    palingLamaTidakLatihan: momentum.stagnant.map((s) => ({ nama: s.name, hari: s.days })),
    daftarSkillTerkaitRole: skills
      .filter((s) => s.relatedToRole)
      .map((s) => ({ nama: s.name, level: s.level, target: s.target })),
  };
}

function buildReflection(store) {
  // Aggregated only — reflectionInsights() reads raw text internally but
  // returns only counts/top-words/top-links, never quotes. Raw
  // `reflections`/`letters` arrays are NEVER touched here.
  const { reflections = [], wins = [], goals = [], skills = [] } = store;
  const agg = reflectionInsights(reflections, wins, goals, skills);
  return {
    jumlahRefleksi30Hari: agg.in30dCount,
    polaKataUtama: agg.topWords.map(([word, count]) => ({ kata: word, jumlah: count })),
    goalPalingSeringDisebut: agg.topGoal?.title || null,
    skillPalingSeringDisebut: agg.topSkill?.name || null,
    actionMenunggu: agg.pending.length,
  };
}

function buildReview(store) {
  // Aggregated only — same privacy shape as buildReflection(). Raw highlights/
  // blockers/finance/careerProgress text is never assembled into outbound context.
  const { reviews = [] } = store;
  const agg = reviewInsights(reviews);
  return {
    jumlahRitualMingguan30Hari: agg.in30dCount,
    rataRataEnergi30Hari: agg.avgEnergyLevel30d,
    rataRataStres30Hari: agg.avgStressLevel30d,
    ritualTerakhir: agg.lastWeekOf ? formatDateID(agg.lastWeekOf) : null,
  };
}

const BUILDERS = {
  finance: (store) => buildFinance(store),
  goals: (store, ctx) => buildGoals(store, ctx),
  career: (store) => buildCareer(store),
  skills: (store) => buildSkills(store),
  reflection: (store) => buildReflection(store),
  review: (store) => buildReview(store),
};

/**
 * Builds a trimmed, privacy-filtered context payload for the given intent.
 * @param {object} store - plain slices from useLifeStore.getState()
 * @param {Set<string>} intent - from detectIntent()
 */
export function buildContext(store, intent) {
  const modules = intent.has("all") ? Object.keys(BUILDERS) : [...intent];
  const readiness = careerReadiness(
    store.goals || [],
    store.skills || [],
    store.portfolio || [],
    store.careerMilestones || []
  );
  const savings = savingsProgress(store.goals || [], store.transactions || [], store.financeTargets);
  const ctx = { readiness, savings, transactions: store.transactions || [] };

  const payload = {};
  for (const key of modules) {
    if (BUILDERS[key]) payload[key] = BUILDERS[key](store, ctx);
  }

  return { payload, manifest: modules };
}
