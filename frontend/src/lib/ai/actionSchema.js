/**
 * Whitelist of actions the AI chat assistant may propose, plus the plumbing
 * to validate a model's raw JSON and, once the user approves, execute it.
 *
 * Suggest-only by construction, same trust boundary as ActionPlanPanel /
 * FinancialPlanCard: the model never writes anything — `normalize()` runs
 * server-side to validate/clamp before showing a proposal, `applyAction()`
 * runs client-side only after an explicit user approval, and it always
 * calls a normal, already-trusted useLifeStore action — never a new write
 * path. No delete/archive/remove action is defined here on purpose (create
 * + update only, confirmed with the user 2026-07-20) — destructive changes
 * stay manual. Reflections/wins/letters/reviews are deliberately absent —
 * those are the user's own words, not something an AI should author.
 *
 * Shared between the server route (normalize/describe) and the client UI
 * (applyAction) — no secrets in here, safe to import from either side.
 */

const clampStr = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const clampNum = (v, min, max) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, n));
};
const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const today = () => new Date().toISOString().slice(0, 10);

export const ACTION_DEFS = {
  addTransaction: {
    storeAction: "addTransaction",
    describe: (p) =>
      `Tambah transaksi: ${p.type === "income" ? "Pemasukan" : "Pengeluaran"} Rp${Number(p.amount).toLocaleString("id-ID")} · ${p.title} · ${p.category}${p.date ? ` · ${p.date}` : ""}`,
    normalize(raw) {
      if (!raw.title || !["income", "expense"].includes(raw.type)) return null;
      const amount = clampNum(raw.amount, 1, 1_000_000_000);
      if (amount === null) return null;
      return {
        title: clampStr(raw.title, 80),
        type: raw.type,
        category: clampStr(raw.category, 40) || (raw.type === "income" ? "salary" : "daily"),
        amount,
        date: isDate(raw.date) ? raw.date : today(),
        notes: clampStr(raw.notes, 200),
      };
    },
  },

  addGoal: {
    storeAction: "addGoal",
    describe: (p) => `Tambah goal: "${p.title}" (${p.area})`,
    normalize(raw) {
      if (!raw.title) return null;
      const areas = ["career", "finance", "skills", "business", "growth"];
      return {
        title: clampStr(raw.title, 120),
        area: areas.includes(raw.area) ? raw.area : "career",
        priority: ["low", "medium", "high"].includes(raw.priority) ? raw.priority : "medium",
        why: clampStr(raw.why, 200),
        targetDate: isDate(raw.targetDate) ? raw.targetDate : undefined,
      };
    },
  },

  updateGoal: {
    storeAction: "updateGoal",
    describe: (p) =>
      `Update goal "${p.label}": ${[
        p.patch.status && `status → ${p.patch.status}`,
        p.patch.progress != null && `progress → ${p.patch.progress}%`,
      ].filter(Boolean).join(", ")}`,
    normalize(raw, ctx) {
      const match = (ctx?.goals || []).find((g) => g.id === raw.id);
      if (!match) return null;
      const patch = {};
      if (["planned", "in_progress", "completed"].includes(raw.status)) patch.status = raw.status;
      if (raw.progress !== undefined) {
        const p = clampNum(raw.progress, 0, 100);
        if (p !== null) patch.progress = p;
      }
      if (Object.keys(patch).length === 0) return null;
      return { id: match.id, label: match.title, patch };
    },
  },

  addCommitment: {
    storeAction: "addCommitment",
    describe: (p) => `Tambah commitment: "${p.title}"${p.dueDate ? ` · due ${p.dueDate}` : ""}`,
    normalize(raw) {
      if (!raw.title) return null;
      const areas = ["career", "finance", "skills", "business", "growth"];
      return {
        title: clampStr(raw.title, 120),
        area: areas.includes(raw.area) ? raw.area : "career",
        priority: ["low", "medium", "high"].includes(raw.priority) ? raw.priority : "medium",
        dueDate: isDate(raw.dueDate) ? raw.dueDate : today(),
      };
    },
  },

  toggleCommitment: {
    storeAction: "toggleCommitment",
    describe: (p) => `Tandai commitment "${p.label}" selesai`,
    normalize(raw, ctx) {
      const match = (ctx?.commitments || []).find((c) => c.id === raw.id);
      if (!match) return null;
      return { id: match.id, label: match.title };
    },
  },

  addSkill: {
    storeAction: "addSkill",
    describe: (p) => `Tambah skill: "${p.name}"`,
    normalize(raw) {
      if (!raw.name) return null;
      const categories = ["technical", "data", "business", "financial", "communication", "career"];
      return {
        name: clampStr(raw.name, 80),
        category: categories.includes(raw.category) ? raw.category : "technical",
        level: clampNum(raw.level, 1, 5) ?? 1,
        target: clampNum(raw.target, 1, 5) ?? 5,
      };
    },
  },

  updateSkill: {
    storeAction: "updateSkill",
    describe: (p) =>
      `Update skill "${p.label}": ${[
        p.patch.level != null && `level → ${p.patch.level}`,
        p.patch.target != null && `target → ${p.patch.target}`,
      ].filter(Boolean).join(", ")}`,
    normalize(raw, ctx) {
      const match = (ctx?.skills || []).find((s) => s.id === raw.id);
      if (!match) return null;
      const patch = {};
      const level = clampNum(raw.level, 1, 5);
      const target = clampNum(raw.target, 1, 5);
      if (level !== null) patch.level = level;
      if (target !== null) patch.target = target;
      if (Object.keys(patch).length === 0) return null;
      return { id: match.id, label: match.name, patch };
    },
  },

  practiceSkill: {
    storeAction: "practiceSkill",
    describe: (p) => `Catat sesi latihan skill "${p.label}" hari ini`,
    normalize(raw, ctx) {
      const match = (ctx?.skills || []).find((s) => s.id === raw.id);
      if (!match) return null;
      return { id: match.id, label: match.name };
    },
  },

  addCareerMilestone: {
    storeAction: "addCareerMilestone",
    describe: (p) => `Tambah career milestone: "${p.title}" (${p.type})`,
    normalize(raw) {
      if (!raw.title) return null;
      const types = ["education", "certificate", "experience", "project", "skill", "target"];
      return {
        title: clampStr(raw.title, 120),
        type: types.includes(raw.type) ? raw.type : "project",
        month: clampNum(raw.month, 1, 12) ?? new Date().getMonth() + 1,
        year: clampNum(raw.year, 2000, 2100) ?? new Date().getFullYear(),
        organization: clampStr(raw.organization, 80),
        description: clampStr(raw.description, 200),
      };
    },
  },

  updateCareerMilestone: {
    storeAction: "updateCareerMilestone",
    describe: (p) => `Update career milestone "${p.label}": status → ${p.patch.status}`,
    normalize(raw, ctx) {
      const match = (ctx?.careerMilestones || []).find((m) => m.id === raw.id);
      if (!match) return null;
      if (!["planned", "in_progress", "completed"].includes(raw.status)) return null;
      return { id: match.id, label: match.title, patch: { status: raw.status } };
    },
  },

  addReminder: {
    storeAction: "addReminder",
    describe: (p) => `Tambah reminder: "${p.title}"${p.amount ? ` · Rp${Number(p.amount).toLocaleString("id-ID")}` : ""}`,
    normalize(raw) {
      if (!raw.title) return null;
      const cadences = ["monthly", "quarterly", "yearly", "once"];
      return {
        title: clampStr(raw.title, 80),
        amount: raw.amount !== undefined ? clampNum(raw.amount, 0, 1_000_000_000) : null,
        dueDay: clampNum(raw.dueDay, 1, 31) ?? 1,
        cadence: cadences.includes(raw.cadence) ? raw.cadence : "monthly",
      };
    },
  },

  updateReminder: {
    storeAction: "updateReminder",
    describe: (p) =>
      `Update reminder "${p.label}": ${[
        p.patch.title && `judul → ${p.patch.title}`,
        p.patch.amount != null && `nominal → Rp${Number(p.patch.amount).toLocaleString("id-ID")}`,
        p.patch.dueDay && `tanggal → ${p.patch.dueDay}`,
        p.patch.cadence && `cadence → ${p.patch.cadence}`,
      ].filter(Boolean).join(", ")}`,
    normalize(raw, ctx) {
      const match = (ctx?.reminders || []).find((r) => r.id === raw.id);
      if (!match) return null;
      const patch = {};
      if (raw.title) patch.title = clampStr(raw.title, 80);
      if (raw.amount !== undefined) {
        const a = clampNum(raw.amount, 0, 1_000_000_000);
        if (a !== null) patch.amount = a;
      }
      const dueDay = clampNum(raw.dueDay, 1, 31);
      if (dueDay !== null) patch.dueDay = dueDay;
      const cadences = ["monthly", "quarterly", "yearly", "once"];
      if (cadences.includes(raw.cadence)) patch.cadence = raw.cadence;
      if (Object.keys(patch).length === 0) return null;
      return { id: match.id, label: match.title, patch };
    },
  },

  setWeeklyBudget: {
    storeAction: "setWeeklyBudget",
    describe: (p) => `Set limit mingguan: ${p.month} minggu ${p.week.slice(1)} → Rp${Number(p.limit).toLocaleString("id-ID")}`,
    normalize(raw) {
      if (!/^\d{4}-\d{2}$/.test(raw.month || "")) return null;
      const weekNum = clampNum(raw.week, 1, 4);
      const limit = clampNum(raw.limit, 0, 1_000_000_000);
      if (weekNum === null || limit === null) return null;
      // budgetWeeklyBreakdown() keys weeks "W1".."W4" (insights.js) — the
      // real WeeklyLimitEditor always passes that exact string; matching it
      // here is what makes the AI-set limit actually show up on /finance
      // instead of silently landing as an orphaned, never-matched row.
      return { month: raw.month, week: `W${weekNum}`, limit };
    },
  },

  setFinanceTarget: {
    storeAction: "setFinanceTarget",
    describe: (p) => `Set target ${p.fund === "savings" ? "Tabungan" : "Dana Darurat"} → Rp${Number(p.target).toLocaleString("id-ID")}`,
    normalize(raw) {
      if (!["emergencyFund", "savings"].includes(raw.fund)) return null;
      const target = clampNum(raw.target, 1, 1_000_000_000);
      if (target === null) return null;
      return { fund: raw.fund, target };
    },
  },
};

/** Lightweight id+label lists for the entities that support `update*` — lets the
 * model target a real record without inventing ids, without shipping full
 * aggregated insights (different purpose than contextBuilder's Q&A context). */
export function buildActionableEntities(store) {
  return {
    goals: (store.goals || [])
      .filter((g) => g.status !== "archived")
      .map((g) => ({ id: g.id, title: g.title, area: g.area, status: g.status })),
    commitments: (store.commitments || [])
      .filter((c) => !c.done)
      .map((c) => ({ id: c.id, title: c.title })),
    skills: (store.skills || []).map((s) => ({ id: s.id, name: s.name, level: s.level, target: s.target })),
    careerMilestones: (store.careerMilestones || []).map((m) => ({ id: m.id, title: m.title, status: m.status })),
    reminders: (store.reminders || []).map((r) => ({ id: r.id, title: r.title })),
  };
}

/** Runs one approved action against the real store — the only place any of
 * this actually writes. `store` is `useLifeStore.getState()`. */
export function applyAction(action, store) {
  const { type, params } = action;
  switch (type) {
    case "addTransaction":
      return store.addTransaction(params);
    case "addGoal":
      return store.addGoal(params);
    case "updateGoal":
      return store.updateGoal(params.id, params.patch);
    case "addCommitment":
      return store.addCommitment(params);
    case "toggleCommitment":
      return store.toggleCommitment(params.id);
    case "addSkill":
      return store.addSkill(params);
    case "updateSkill":
      return store.updateSkill(params.id, params.patch);
    case "practiceSkill":
      return store.practiceSkill(params.id);
    case "addCareerMilestone":
      return store.addCareerMilestone(params);
    case "updateCareerMilestone":
      return store.updateCareerMilestone(params.id, params.patch);
    case "addReminder":
      return store.addReminder(params);
    case "updateReminder":
      return store.updateReminder(params.id, params.patch);
    case "setWeeklyBudget":
      return store.setWeeklyBudget(params.month, params.week, params.limit);
    case "setFinanceTarget":
      return store.setFinanceTarget(params.fund, params.target);
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}
