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
