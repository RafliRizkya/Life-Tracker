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

/**
 * Month → Week (4 buckets, contiguous day ranges) → Category budget breakdown.
 * Week limits are computed by prorating each category's monthly limit by the
 * bucket's share of days — no separate per-week budget schema needed.
 */
export function budgetWeeklyBreakdown(budgets, transactions, mk = currentMonthKey()) {
  const monthBudgets = budgets.filter((b) => b.month === mk);
  if (monthBudgets.length === 0) return [];

  const [year, month] = mk.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const bucketSize = Math.ceil(daysInMonth / 4);

  const weeks = [];
  for (let w = 0; w < 4; w++) {
    const startDay = w * bucketSize + 1;
    if (startDay > daysInMonth) break;
    const endDay = Math.min(daysInMonth, startDay + bucketSize - 1);
    weeks.push({ key: `W${w + 1}`, label: `Minggu ${w + 1}`, startDay, endDay });
  }

  return weeks.map((w) => {
    const daysInWeek = w.endDay - w.startDay + 1;
    const categories = monthBudgets.map((b) => {
      const spent = transactions
        .filter((t) => {
          if (t.type !== "expense" || t.category !== b.category) return false;
          if (monthKey(t.date) !== mk) return false;
          const day = Number(t.date.slice(8, 10));
          return day >= w.startDay && day <= w.endDay;
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      // A user-set weekly amount overrides the auto-prorated default —
      // "budgeting shouldn't feel rigid" was the explicit ask.
      const override = b.weeklyOverrides?.[w.key];
      const prorated = Math.round((b.limit * daysInWeek) / daysInMonth);
      const allocated = override != null ? override : prorated;
      return { category: b.category, budgetId: b.id, allocated, spent, isOverride: override != null };
    });
    return { ...w, categories };
  });
}

/**
 * A quantitative goal's metric.current can either be a plain hand-edited
 * number, or — if `linkedCategory` is set — auto-track a Finance expense
 * category: metric.current becomes a baseline, and every matching
 * transaction adds on top. Generalizes what used to be a goal-savings-ladder
 * special case so any finance goal can opt in (Goals <> Finance sync).
 */
export function linkedGoalCurrent(goal, transactions) {
  if (!goal.linkedCategory) return goal.metric?.current ?? 0;
  const baseline = goal.metric?.current ?? 0;
  const tracked = transactions
    .filter((t) => t.type === "expense" && t.category === goal.linkedCategory)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  return baseline + tracked;
}

/**
 * Kuantitatif = has a hard numeric target (metric) or a weighted breakdown
 * (contributions); kualitatif = concept/self-development goal tracked by a
 * hand-set `progress` percentage. Derived, not stored — no schema migration
 * needed, and it can never drift out of sync with the fields that back it.
 */
export function goalKind(goal) {
  return goal.metric || goal.contributions ? "quantitative" : "qualitative";
}

export function savingsProgress(goals, transactions) {
  const savingsGoal = goals.find((g) => g.id === "goal-savings-ladder");
  if (!savingsGoal) return null;
  const current = linkedGoalCurrent(savingsGoal, transactions);
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

export function buildInsights({ transactions, goals, skills, reminders, portfolio, milestones, reviews = [], reflections = [] }) {
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
      body: `Dari Rp ${prev.net.toLocaleString("id-ID")} ke Rp ${cur.net.toLocaleString("id-ID")} — ritme ini yang bikin beda dalam jangka panjang. Lanjutkan.`,
    });
  } else if (cur.net < prev.net && cur.net >= 0) {
    insights.push({
      key: "savings-down",
      tone: "warning",
      title: "Net saving bulan ini lebih rendah",
      body: `Turun sekitar Rp ${Math.abs(prev.net - cur.net).toLocaleString("id-ID")} dari bulan lalu. Nggak apa-apa — coba intip kategori mana yang paling boros.`,
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
      body: `Rp ${learningSpend.toLocaleString("id-ID")} kamu investasikan buat belajar bulan ini. Itu langsung nambah ke Career Readiness-mu.`,
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
        title: `Sudah ${days} hari ${sql.name} nggak disentuh`,
        body: "Nggak perlu lama — 30 menit hari ini cukup buat jaga momentumnya tetap hidup.",
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
      body: "Tinggal beberapa langkah lagi. Satu case study lagi bakal bikin portofoliomu makin kuat.",
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
        body: `Rp ${(bpjs.amount || 150_000).toLocaleString("id-ID")} — siapin dari sekarang biar nggak dadakan.`,
      });
    }
  }

  // Cross-signal correlations — each returns null when data can't support the claim
  const correlations = [
    stressSpendingCorrelation(reviews, transactions),
    energyGoalVelocityCorrelation(reviews, goals),
    milestoneEnergyCorrelation(milestones, reviews),
  ];
  for (const corr of correlations) {
    if (!corr) continue;
    insights.push({
      key: `corr-${corr.type}`,
      tone: corr.tone,
      title: corr.headline,
      body: "Makin rutin ritualnya, makin tajam polanya.",
      meta: `Pola dari ${corr.weeksObserved} minggu ritual · ${corr.supportingDataPoints} titik data`,
    });
  }

  // Honest engagement gap — calm notice, never an alert
  const gap = engagementGapSignal(reviews, reflections);
  if (gap) {
    insights.push({
      key: "engagement-gap",
      tone: gap.tone, // "gentle-notice" → renders with the neutral card fallback, by design
      title: gap.headline,
      body: "Bukan kewajiban — tapi kalau mau menepi sebentar, ruangnya masih di tempat yang sama.",
    });
  }

  return insights;
}

/* ---------- Reflection pattern insights ---------- */

const STOPWORDS_ID = new Set([
  "yang","dan","atau","untuk","dari","dengan","ke","di","ini","itu","aku",
  "saya","kita","kami","kamu","kau","dia","mereka","ada","tidak","juga",
  "sudah","belum","masih","lagi","saja","tapi","namun","karena","supaya",
  "agar","kalau","jika","hanya","sangat","sekali","paling","tetap","akan",
  "bisa","dapat","harus","perlu","biar","biasa","apa","apapun","semua",
  "adalah","yaitu","yakni","atas","bawah","dalam","luar","antara","tanpa",
  "seperti","seolah","hingga","sampai","namanya","begitu","gitu","banget",
  "kayak","kek","udah","enggak","gak","nggak","ga","aja","dong","sih","kok",
  "the","a","an","of","to","and","or","in","on","for","is","this","that",
  "with","as","at","be","it","by","from","are","was","were","have","has","had"
]);

export function reflectionInsights(reflections, wins, goals, skills) {
  const now = Date.now();
  const in30d = reflections.filter(
    (r) => now - new Date(r.createdAt).getTime() <= 30 * 86400000
  );
  const in7d = reflections.filter(
    (r) => now - new Date(r.createdAt).getTime() <= 7 * 86400000
  );
  const winsIn30d = wins.filter(
    (w) => now - new Date(w.createdAt).getTime() <= 30 * 86400000
  );

  // Word frequency (top 3) across "lesson", "whatFeltHeavy", answers
  const bag = [];
  for (const r of in30d) {
    const chunks = [
      r.lesson, r.whatFeltHeavy, r.whatWentWell, r.smallStep, r.currentState,
      ...Object.values(r.answers || {}),
    ].filter(Boolean).join(" ");
    for (const w of chunks.toLowerCase().split(/[^a-zà-ÿ]+/i)) {
      if (!w || w.length < 4) continue;
      if (STOPWORDS_ID.has(w)) continue;
      bag.push(w);
    }
  }
  const freq = new Map();
  bag.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  const topWords = [...freq.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Most linked goal / skill
  const goalCount = new Map();
  const skillCount = new Map();
  for (const r of in30d) {
    (r.linkedGoals || []).forEach((g) => goalCount.set(g, (goalCount.get(g) || 0) + 1));
    (r.linkedSkills || []).forEach((s) => skillCount.set(s, (skillCount.get(s) || 0) + 1));
  }
  const topGoalId = [...goalCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const topSkillId = [...skillCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const topGoal = topGoalId && goals.find((g) => g.id === topGoalId);
  const topSkill = topSkillId && skills.find((s) => s.id === topSkillId);

  // Pending actions
  const pending = [];
  for (const r of reflections) {
    for (const a of r.improvementActions || []) {
      if (!a.convertedToCommitmentId) pending.push({ reflectionId: r.id, ...a });
    }
  }

  const insights = [];

  if (in30d.length >= 3) {
    insights.push({
      key: "consistent",
      tone: "positive",
      title: `Kamu sudah berhenti sejenak ${in30d.length} kali bulan ini`,
      body: "Konsistensi kecil seperti ini yang menyusun cerita jangka panjangmu — tanpa harus dilihat siapa pun.",
    });
  } else if (in7d.length === 0 && reflections.length > 0) {
    insights.push({
      key: "quiet-week",
      tone: "gentle",
      title: "Sudah beberapa hari tidak ada refleksi",
      body: "Tidak apa-apa. Ruang ini akan tetap di sini kapanpun kamu siap.",
    });
  }

  if (topWords.length > 0) {
    insights.push({
      key: "word-pattern",
      tone: "gentle",
      title: `Kata &ldquo;${topWords[0][0]}&rdquo; muncul ${topWords[0][1]} kali`,
      body: "Perhatikan pola ini — sering kali kata yang terulang membawa petunjuk yang penting.",
      meta: topWords,
    });
  }

  if (topGoal) {
    insights.push({
      key: "top-goal",
      tone: "positive",
      title: `Refleksimu banyak berputar di sekitar "${topGoal.title}"`,
      body: "Tanda bahwa hatimu sedang serius pada arah ini. Boleh lebih dilindungi ruangnya.",
    });
  }

  if (topSkill) {
    insights.push({
      key: "top-skill",
      tone: "gentle",
      title: `Skill "${topSkill.name}" paling sering hadir di refleksimu`,
      body: "Kalau ada satu tempat untuk investasi waktu minggu ini — ini kandidat kuatnya.",
    });
  }

  if (winsIn30d.length >= 3) {
    insights.push({
      key: "wins-glow",
      tone: "positive",
      title: `${winsIn30d.length} kemenangan kecil bulan ini`,
      body: "Yang kadang terlihat 'biasa saja' ternyata menumpuk. Baca ulang saat hari terasa berat.",
    });
  }

  if (pending.length > 0) {
    insights.push({
      key: "pending-actions",
      tone: "gentle",
      title: `Ada ${pending.length} improvement action yang menunggu`,
      body: "Bukan pengingat, hanya undangan. Ubah jadi commitment kalau memang terasa tepat.",
      meta: { pendingCount: pending.length },
    });
  }

  return { insights, topWords, topGoal, topSkill, pending, in30dCount: in30d.length };
}

/* ---------- Weekly review (Life Compass ritual) ---------- */

/** Aggregated-only view of reviews — mirrors reflectionInsights()'s privacy shape: counts and
 * averages leave the browser for AI context, raw highlights/blockers/finance text never does. */
export function reviewInsights(reviews) {
  const now = Date.now();
  const in30d = reviews.filter((r) => now - new Date(r.createdAt).getTime() <= 30 * 86400000);
  const withEnergy = in30d.filter((r) => typeof r.energyLevel === "number");
  const withStress = in30d.filter((r) => typeof r.stressLevel === "number");
  const avg = (list, key) =>
    list.length ? Number((list.reduce((a, r) => a + r[key], 0) / list.length).toFixed(1)) : null;

  return {
    in30dCount: in30d.length,
    avgEnergyLevel30d: avg(withEnergy, "energyLevel"),
    avgStressLevel30d: avg(withStress, "stressLevel"),
    lastWeekOf: reviews[0]?.weekOf || null,
  };
}

/** Momentum vs burnout signal from self-reported energy/stress trend + current commitment load. */
export function momentumIndex(reviews, commitments) {
  const active = commitments.filter((c) => !c.done).length;
  const recent = reviews.filter((r) => typeof r.energyLevel === "number" && typeof r.stressLevel === "number").slice(0, 3);

  if (recent.length < 2) {
    return {
      status: "unknown",
      title: "Belum cukup data",
      body: "Isi energi & stres di 2 ritual mingguan berturut-turut supaya polanya kelihatan.",
    };
  }

  const avgEnergy = recent.reduce((a, r) => a + r.energyLevel, 0) / recent.length;
  const avgStress = recent.reduce((a, r) => a + r.stressLevel, 0) / recent.length;

  if (avgStress >= 4 && avgEnergy <= 2.5) {
    return {
      status: "burnout-risk",
      title: "Tanda-tanda burnout risk",
      body: `Stres rata-rata tinggi (${avgStress.toFixed(1)}/5) sementara energi rendah (${avgEnergy.toFixed(1)}/5), dan ${active} commitment masih terbuka. Waktunya kurangi beban, bukan tambah target.`,
    };
  }
  if (avgEnergy >= 3.5 && avgStress <= 3) {
    return {
      status: "momentum",
      title: "Kamu sedang dalam momentum",
      body: `Energi stabil tinggi (${avgEnergy.toFixed(1)}/5) dengan stres terkendali. Ritme ini layak dipertahankan.`,
    };
  }
  return {
    status: "balanced",
    title: "Ritme yang cukup seimbang",
    body: `Energi ${avgEnergy.toFixed(1)}/5, stres ${avgStress.toFixed(1)}/5 — nggak ekstrem ke mana pun. Terus dipantau.`,
  };
}

/** Rule-based opening paragraph for the ritual's "Hero's Journey" draft — user edits before saving. */
export function weeklyNarrativeDraft({ reviews, wins, reflections, commitments, goals, skills }) {
  const now = Date.now();
  const winsIn7d = wins.filter((w) => now - new Date(w.createdAt).getTime() <= 7 * 86400000);
  const reflectionsIn7d = reflections.filter((r) => now - new Date(r.createdAt).getTime() <= 7 * 86400000);
  const doneCount = commitments.filter((c) => c.done).length;
  const activeCount = commitments.filter((c) => !c.done).length;
  const pattern = reflectionInsights(reflections, wins, goals, skills);

  const parts = [];
  parts.push(
    winsIn7d.length > 0
      ? `Minggu ini kamu mencatat ${winsIn7d.length} kemenangan kecil`
      : `Minggu ini berjalan lebih senyap — belum ada win yang tercatat`
  );
  parts.push(
    reflectionsIn7d.length > 0
      ? ` dan menyempatkan diri berhenti sejenak ${reflectionsIn7d.length} kali untuk refleksi.`
      : `.`
  );
  if (pattern.topGoal) {
    parts.push(` Banyak perhatianmu tertuju ke "${pattern.topGoal.title}" — arah itu sedang serius kamu kejar.`);
  }
  parts.push(` ${doneCount} commitment sudah selesai, ${activeCount} masih berjalan.`);
  parts.push(` Catat bagaimana rasanya, lalu pilih satu fokus kecil untuk minggu depan.`);

  return parts.join("");
}

/* ---------- Cross-signal correlations (dashboard candidates) ---------- */

const WEEK_MS = 7 * 86400000;

/** One review per distinct weekOf with the given numeric field filled — newest wins (reviews are prepended). */
function ritualWeeks(reviews, field) {
  const seen = new Set();
  const out = [];
  for (const r of reviews) {
    if (typeof r[field] !== "number" || !r.weekOf || seen.has(r.weekOf)) continue;
    seen.add(r.weekOf);
    out.push(r);
  }
  return out;
}

const inWeek = (dateString, weekStartMs) => {
  const ts = new Date(dateString).getTime();
  return ts >= weekStartMs && ts < weekStartMs + WEEK_MS;
};

/**
 * Does discretionary spending move with ritual stress? Reads only stressLevel,
 * transaction amount/category/date — never free text. Null when < 3 usable weeks
 * or when both stress groups aren't represented (honesty over false confidence,
 * same contract as momentumIndex).
 */
export function stressSpendingCorrelation(reviews, transactions) {
  const weeks = ritualWeeks(reviews, "stressLevel")
    .map((r) => {
      const start = new Date(r.weekOf).getTime();
      let spend = 0;
      let txCount = 0;
      for (const t of transactions) {
        if (t.type !== "expense" || t.category === "saving") continue;
        if (!inWeek(t.date, start)) continue;
        spend += Number(t.amount) || 0;
        txCount++;
      }
      return { stress: r.stressLevel, spend, txCount };
    })
    .filter((w) => w.txCount > 0);
  if (weeks.length < 3) return null;

  const high = weeks.filter((w) => w.stress >= 4);
  const calm = weeks.filter((w) => w.stress < 4);
  if (high.length === 0 || calm.length === 0) return null;

  const avg = (list) => list.reduce((a, w) => a + w.spend, 0) / list.length;
  const highAvg = avg(high);
  const calmAvg = avg(calm);
  if (calmAvg === 0) return null;

  const ratio = highAvg / calmAvg;
  if (ratio < 1.2 && ratio > 0.8) return null; // no contrast worth surfacing

  const pct = Math.round(Math.abs(ratio - 1) * 100);
  return {
    type: "stressSpending",
    tone: ratio >= 1.2 ? "warning" : "positive",
    headline:
      ratio >= 1.2
        ? `Di minggu dengan stres tinggi, pengeluaranmu rata-rata ${pct}% lebih besar`
        : `Saat stres tinggi, kamu justru menahan pengeluaran — ${pct}% lebih hemat`,
    weeksObserved: weeks.length,
    supportingDataPoints: weeks.reduce((a, w) => a + w.txCount, 0),
  };
}

/**
 * Do goals move faster in high-energy weeks? "Velocity" = goal milestone
 * achievedAt events per week — the only timestamped goal-progress signal
 * that exists (goal.progress is a scalar with no history).
 */
export function energyGoalVelocityCorrelation(reviews, goals) {
  const weeks = ritualWeeks(reviews, "energyLevel");
  if (weeks.length < 3) return null;

  const achievedAts = [];
  for (const g of goals) {
    for (const m of g.milestones || []) {
      if (m.achieved && m.achievedAt) achievedAts.push(m.achievedAt);
    }
  }
  if (achievedAts.length === 0) return null;

  const perWeek = weeks.map((r) => {
    const start = new Date(r.weekOf).getTime();
    return {
      energy: r.energyLevel,
      count: achievedAts.filter((d) => inWeek(d, start)).length,
    };
  });
  if (perWeek.every((w) => w.count === 0)) return null; // achievements exist, but outside observed weeks

  const high = perWeek.filter((w) => w.energy >= 4);
  const rest = perWeek.filter((w) => w.energy < 4);
  if (high.length === 0 || rest.length === 0) return null;

  const avg = (list) => list.reduce((a, w) => a + w.count, 0) / list.length;
  if (avg(high) <= avg(rest) * 1.5) return null;

  return {
    type: "energyGoalVelocity",
    tone: "positive",
    headline: "Goal milestone-mu paling sering tercapai di minggu berenergi tinggi — jaga energi, bukan cuma jadwal",
    weeksObserved: weeks.length,
    supportingDataPoints: perWeek.reduce((a, w) => a + w.count, 0),
  };
}

/**
 * Did weekly energy shift after a career milestone was added? Needs ≥2 rituals
 * with energy on each side of the milestone; surfaces the biggest shift ≥ 0.75.
 */
export function milestoneEnergyCorrelation(careerMilestones, reviews) {
  const weeks = ritualWeeks(reviews, "energyLevel")
    .map((r) => ({ ts: new Date(r.weekOf).getTime(), energy: r.energyLevel }))
    .sort((a, b) => a.ts - b.ts);
  if (weeks.length < 4) return null;

  const windowStart = weeks[0].ts;
  const windowEnd = weeks[weeks.length - 1].ts + WEEK_MS;
  const avg = (list) => list.reduce((a, w) => a + w.energy, 0) / list.length;

  let best = null;
  for (const m of careerMilestones) {
    const ts = new Date(m.createdAt).getTime();
    if (Number.isNaN(ts) || ts < windowStart || ts >= windowEnd) continue;
    const before = weeks.filter((w) => w.ts < ts);
    const after = weeks.filter((w) => w.ts >= ts);
    if (before.length < 2 || after.length < 2) continue;
    const delta = avg(after) - avg(before);
    if (!best || Math.abs(delta) > Math.abs(best.delta)) {
      best = { title: m.title, delta, weeks: weeks.length };
    }
  }
  if (!best || Math.abs(best.delta) < 0.75) return null;

  const points = Math.abs(best.delta).toFixed(1);
  return {
    type: "milestoneEnergy",
    tone: best.delta > 0 ? "positive" : "warning",
    headline:
      best.delta > 0
        ? `Sejak "${best.title}", energi mingguanmu naik rata-rata ${points} poin`
        : `Sejak "${best.title}", energi mingguanmu turun rata-rata ${points} poin — perhatikan bebannya`,
    weeksObserved: best.weeks,
    supportingDataPoints: best.weeks,
  };
}

/* ---------- Engagement gap (honest friction visibility) ---------- */

/**
 * Fires only when ritual and/or reflection has lapsed 2+ weeks. An account
 * that never engaged returns null for that signal (nothing lapsed — you can't
 * lapse what you never started), and the whole function returns null when
 * neither signal is lapsed. Calm register, no streaks, no alerts.
 */
export function engagementGapSignal(reviews, reflections) {
  const weeksSinceLatest = (items, dateOf) => {
    let latest = null;
    for (const it of items) {
      const ts = new Date(dateOf(it)).getTime();
      if (!Number.isNaN(ts) && (latest === null || ts > latest)) latest = ts;
    }
    return latest === null ? null : Math.floor((Date.now() - latest) / WEEK_MS);
  };

  const weeksSinceLastRitual = weeksSinceLatest(reviews, (r) => r.createdAt || r.weekOf);
  const weeksSinceLastReflection = weeksSinceLatest(reflections, (r) => r.createdAt);
  const ritualLapsed = weeksSinceLastRitual !== null && weeksSinceLastRitual >= 2;
  const reflectionLapsed = weeksSinceLastReflection !== null && weeksSinceLastReflection >= 2;
  if (!ritualLapsed && !reflectionLapsed) return null;

  const parts = [];
  if (ritualLapsed) parts.push(`ritual mingguan terakhir ${weeksSinceLastRitual} minggu lalu`);
  if (reflectionLapsed) parts.push(`refleksi terakhir ${weeksSinceLastReflection} minggu lalu`);

  return {
    type: "engagementGap",
    tone: "gentle-notice",
    headline: `Life Compass-mu sedang senyap — ${parts.join(", ")}`,
    weeksSinceLastRitual,
    weeksSinceLastReflection,
  };
}

/* ---------- Ritual follow-up ("nagih ke masa lalu") ---------- */

/**
 * Focus items from past rituals (1..windowWeeks weeks ago) with no resolution
 * recorded in that review's `focusStatus` map ({index: "resolved"|"carried"|"dropped"}).
 * The current week's own ritual never nags. Oldest first.
 */
export function unresolvedFocusItems(reviews, windowWeeks = 3) {
  const now = Date.now();
  const out = [];
  for (const r of reviews) {
    const ts = new Date(r.weekOf || r.createdAt).getTime();
    if (Number.isNaN(ts)) continue;
    const weeksAgo = Math.floor((now - ts) / WEEK_MS);
    if (weeksAgo < 1 || weeksAgo > windowWeeks) continue;
    (r.nextWeekFocus || []).forEach((text, index) => {
      if (!text || r.focusStatus?.[index]) return;
      out.push({ reviewId: r.id, index, text, weekOf: r.weekOf, weeksAgo });
    });
  }
  out.sort((a, b) => b.weeksAgo - a.weeksAgo);
  return out;
}

/* ---------- Goal evidence ("goal butuh bukti") ---------- */

const EVIDENCE_WINDOW_MS = 14 * 86400000; // 2 weeks, matching the engagement-gap cadence

/**
 * Whether an in-progress goal's claimed momentum is backed by recent activity
 * in its own life area. Linkage reuses the existing `goal.area` field — no new
 * schema needed. Evidence per area (existing data only, nothing new to log):
 *   skills  → any skill practiced (`lastPracticedAt`) within the window
 *   career  → any career milestone added (`createdAt`) within the window
 *   finance → any transaction recorded, or a goal milestone achieved, within the window
 * Areas with no natural evidence source (growth/business) are exempt, as are
 * non-in-progress goals. A goal younger than the window returns "pending"
 * (not enough time elapsed ≠ negative signal — momentumIndex honesty pattern).
 */
export function goalEvidenceStatus(goal, { skills = [], careerMilestones = [], transactions = [] } = {}) {
  const source = ["skills", "career", "finance"].includes(goal.area) ? goal.area : null;
  if (!source) return { state: "exempt", source: null, lastEvidenceAt: null };
  if (goal.status !== "in_progress") return { state: "exempt", source, lastEvidenceAt: null };

  const now = Date.now();
  const createdTs = new Date(goal.createdAt || 0).getTime();
  if (!Number.isNaN(createdTs) && now - createdTs < EVIDENCE_WINDOW_MS) {
    return { state: "pending", source, lastEvidenceAt: null };
  }

  let latest = null;
  const consider = (d) => {
    if (!d) return;
    const ts = new Date(d).getTime();
    if (Number.isNaN(ts) || now - ts > EVIDENCE_WINDOW_MS || ts > now) return;
    if (latest === null || ts > latest) latest = ts;
  };

  if (source === "skills") {
    for (const s of skills) consider(s.lastPracticedAt);
  } else if (source === "career") {
    for (const m of careerMilestones) consider(m.createdAt);
  } else {
    for (const t of transactions) consider(t.date);
    for (const m of goal.milestones || []) {
      if (m.achieved) consider(m.achievedAt);
    }
  }

  return latest !== null
    ? { state: "evidenced", source, lastEvidenceAt: new Date(latest).toISOString() }
    : { state: "unproven", source, lastEvidenceAt: null };
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
    const current = linkedGoalCurrent(goal, ctx?.transactions ?? []);
    const pct = Math.round((current / (goal.metric.target || 1)) * 100);
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
