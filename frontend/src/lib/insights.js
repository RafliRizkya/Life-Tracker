/**
 * Selectors + derived calculations.
 *
 * Kept pure and deterministic — easy to test.
 */

import { currentMonthKey, monthKey } from "./format";

/* ---------- Finance ---------- */

export function monthlyTotals(transactions, mk = currentMonthKey()) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (monthKey(t.date) !== mk) continue;
    if (t.type === "income") income += Number(t.amount) || 0;
    else expense += Number(t.amount) || 0;
  }
  const net = income - expense;
  const savingRate = income > 0 ? Math.round((net / income) * 100) : 0;
  // Spending score: lower spending share → higher score, cap 100
  const spendingScore =
    income > 0
      ? Math.max(0, Math.min(100, Math.round(100 - (expense / income) * 65)))
      : 0;
  return { income, expense, net, savingRate, spendingScore };
}

export function last6MonthsSeries(transactions) {
  const now = new Date();
  const out = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("id-ID", { month: "short" });
    const t = monthlyTotals(transactions, mk);
    out.push({ month: label, mk, income: t.income, expense: t.expense, net: t.net });
  }
  return out;
}

export function spendingByCategory(transactions, mk = currentMonthKey()) {
  const map = new Map();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    if (monthKey(t.date) !== mk) continue;
    map.set(t.category, (map.get(t.category) || 0) + Number(t.amount));
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function savingsProgress(goals, transactions) {
  const savingsGoal = goals.find((g) => g.id === "goal-savings-ladder");
  if (!savingsGoal) return null;
  const totalSaved = transactions
    .filter((t) => t.type === "expense" && t.category === "saving")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const baseline = savingsGoal.metric?.current ?? 0;
  const current = baseline + totalSaved;
  const target = savingsGoal.metric?.target ?? 100_000_000;
  const pct = Math.max(0, Math.min(100, Math.round((current / target) * 100)));
  // Which ladder step are we on?
  const milestones = (savingsGoal.milestones || []).map((m) => ({
    ...m,
    achieved: current >= m.target || m.achieved,
  }));
  const nextIdx = milestones.findIndex((m) => !m.achieved);
  const next = nextIdx >= 0 ? milestones[nextIdx] : null;
  return { current, target, pct, milestones, next };
}

/* ---------- Career readiness ---------- */

export function careerReadiness(goals, skills, portfolio, milestones) {
  const goal = goals.find((g) => g.id === "goal-data-analyst");
  const roleSkills = skills.filter((s) => s.relatedToRole);
  const skillsAvg =
    roleSkills.length === 0
      ? 0
      : (roleSkills.reduce((a, s) => a + (s.level / s.target), 0) /
          roleSkills.length) *
        100;
  const portfolioPct = Math.min(
    100,
    (portfolio.filter((p) => p.status === "shipped").length / 5) * 100
  );
  const experienceCount = milestones.filter(
    (m) => m.type === "experience" && m.status !== "planned"
  ).length;
  const experiencePct = Math.min(100, experienceCount * 30);
  const certPct = Math.min(
    100,
    milestones.filter((m) => m.type === "certificate" && m.status === "completed").length * 35
  );
  const networkPct = Math.min(
    100,
    (goals.find((g) => g.id === "goal-network")?.progress ?? 0) +
      (goals.find((g) => g.id === "goal-linkedin")?.progress ?? 0)
  );
  const applicationPct = goals.find((g) => g.id === "goal-first-data-job")?.progress ?? 0;

  const parts = [
    { key: "skills", label: "Core skills", weight: 0.25, value: skillsAvg },
    { key: "portfolio", label: "Portfolio projects", weight: 0.25, value: portfolioPct },
    { key: "experience", label: "Experience", weight: 0.2, value: experiencePct },
    { key: "certificates", label: "Certificates", weight: 0.1, value: certPct },
    { key: "network", label: "Network / brand", weight: 0.1, value: networkPct },
    { key: "applications", label: "Job readiness", weight: 0.1, value: applicationPct },
  ];
  const overall = Math.round(
    parts.reduce((a, p) => a + p.value * p.weight, 0)
  );
  return { overall, parts, goal };
}

/* ---------- Skills momentum ---------- */

export function skillMomentum(skills) {
  const total = skills.length;
  const avg = total ? skills.reduce((a, s) => a + s.level, 0) / total : 0;
  const roleAvg =
    skills.filter((s) => s.relatedToRole).reduce((a, s) => a + s.level, 0) /
    Math.max(1, skills.filter((s) => s.relatedToRole).length);
  const stagnant = skills
    .filter((s) => s.relatedToRole)
    .map((s) => ({
      ...s,
      days: s.lastPracticedAt
        ? Math.floor(
            (Date.now() - new Date(s.lastPracticedAt).getTime()) / 86400000
          )
        : 999,
    }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 3);
  return {
    avg: Number(avg.toFixed(1)),
    roleAvg: Number(roleAvg.toFixed(1)),
    stagnant,
  };
}

/* ---------- Rule-based insights ---------- */

export function buildInsights({ transactions, goals, skills, reminders, portfolio, milestones }) {
  const insights = [];
  const cur = monthlyTotals(transactions);
  const now = new Date();
  const mkPrev = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();
  const prev = monthlyTotals(transactions, mkPrev);

  // Savings movement
  if (cur.net > prev.net && prev.net >= 0) {
    insights.push({
      key: "savings-up",
      tone: "positive",
      title: "Tabunganmu naik dibanding bulan lalu",
      body: `Net saving naik dari ${prev.net.toLocaleString("id-ID")} jadi ${cur.net.toLocaleString("id-ID")}. Pertahankan pola.`,
    });
  } else if (cur.net < prev.net && cur.net >= 0) {
    insights.push({
      key: "savings-down",
      tone: "warning",
      title: "Net saving bulan ini lebih rendah",
      body: `Ada penurunan ~ Rp ${Math.abs(prev.net - cur.net).toLocaleString("id-ID")}. Cek kategori pengeluaran terbesar.`,
    });
  }

  // Learning spend supports career goal
  const learningSpend = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.category === "learning" &&
        monthKey(t.date) === currentMonthKey()
    )
    .reduce((a, t) => a + t.amount, 0);
  if (learningSpend > 0) {
    insights.push({
      key: "learning-support",
      tone: "positive",
      title: "Pengeluaran belajar bulan ini mendukung goal Data Analyst",
      body: `Rp ${learningSpend.toLocaleString("id-ID")} dialokasikan untuk skill—kontribusi langsung ke Career Readiness.`,
    });
  }

  // SQL practice stagnation
  const sql = skills.find((s) => /sql/i.test(s.name));
  if (sql && sql.lastPracticedAt) {
    const days = Math.floor(
      (Date.now() - new Date(sql.lastPracticedAt).getTime()) / 86400000
    );
    if (days >= 3) {
      insights.push({
        key: "sql-stale",
        tone: "warning",
        title: `${sql.name} belum disentuh ${days} hari`,
        body: "Jadwalkan satu sesi 30 menit hari ini agar momentum tidak hilang.",
      });
    }
  }

  // Portfolio progress
  const shipped = portfolio.filter((p) => p.status === "shipped").length;
  if (shipped >= 2 && shipped < 5) {
    insights.push({
      key: "portfolio-progress",
      tone: "positive",
      title: `${shipped} dari 5 portfolio project selesai`,
      body: "Tambah case study berikutnya untuk memperkuat Career Readiness.",
    });
  }

  // BPJS reminder soon
  const bpjs = reminders.find((r) => r.category === "bpjs" && r.active);
  if (bpjs) {
    const today = new Date();
    const day = today.getDate();
    const dueDay = bpjs.dueDay || 20;
    if (dueDay - day <= 5 && dueDay - day >= 0) {
      insights.push({
        key: "bpjs-soon",
        tone: "warning",
        title: `BPJS Kesehatan jatuh tempo dalam ${dueDay - day} hari`,
        body: `Rp ${(bpjs.amount || 150_000).toLocaleString("id-ID")} · siapkan pembayaran.`,
      });
    }
  }

  return insights;
}

/* ---------- Goal progress helper ---------- */

export function computeGoalProgress(goal, ctx) {
  if (goal.status === "completed") return 100;
  if (goal.id === "goal-data-analyst" && ctx?.readiness) {
    return ctx.readiness.overall;
  }
  if (goal.id === "goal-savings-ladder" && ctx?.savings) {
    return ctx.savings.pct;
  }
  if (goal.metric) {
    const pct = Math.round(
      ((goal.metric.current || 0) / (goal.metric.target || 1)) * 100
    );
    return Math.max(0, Math.min(100, pct));
  }
  if (goal.contributions) {
    const total = goal.contributions.reduce(
      (a, c) => a + (c.value * c.weight) / 100,
      0
    );
    return Math.round(total);
  }
  return Math.round(goal.progress ?? 0);
}
