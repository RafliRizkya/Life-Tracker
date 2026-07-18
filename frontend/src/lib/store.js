/**
 * Zustand store — canonical client-side state.
 *
 * Persistence strategy:
 *   1. On mount, hydrate from Supabase (if configured) OR from localStorage,
 *      OR from the built-in seed data (first visit).
 *   2. Every mutation persists to localStorage immediately and, when
 *      Supabase is configured, to Supabase asynchronously (best-effort).
 *
 * All records include `userId` so the schema is ready for multi-user
 * once Supabase Auth is enabled.
 */

"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import { buildInitialState } from "./seed";
import { isSupabaseConfigured } from "./supabase/client";

const STORAGE_KEY = "rafli-life-tracker::state::v1";
const USER_ID =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SEED_USER_ID) ||
  "rafli-akbar";

const nowISO = () => new Date().toISOString();

/** Shared defaulting logic for a transaction, reused by manual add and WhatsApp sync. */
function normalizeTransaction(payload) {
  return {
    id: nanoid(10),
    userId: USER_ID,
    type: "expense",
    category: "daily",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    recurring: false,
    notes: "",
    createdAt: nowISO(),
    source: "manual",
    ...payload,
  };
}

function loadFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded — ignore */
  }
}

/**
 * Build a minimal "state slice" object. We don't persist ephemeral
 * UI state (modals, palettes, save indicators).
 */
function persistableSlice(s) {
  return {
    version: s.version,
    user: s.user,
    goals: s.goals,
    careerMilestones: s.careerMilestones,
    portfolio: s.portfolio,
    skills: s.skills,
    transactions: s.transactions,
    budgets: s.budgets,
    reminders: s.reminders,
    reviews: s.reviews,
    commitments: s.commitments,
    notifications: s.notifications,
    activity: s.activity,
    reflections: s.reflections,
    wins: s.wins,
    letters: s.letters,
    settings: s.settings,
  };
}

/**
 * Create an initial state that is server-safe (deterministic seed) and
 * gets hydrated from localStorage during the first client effect.
 */
const initial = buildInitialState();

export const useLifeStore = create((set, get) => ({
  ...initial,
  // ---- ephemeral UI state ----
  hydrated: false,
  saveStatus: "idle", // idle | saving | saved | failed
  paletteOpen: false,
  quickAddOpen: false,
  quickAddType: "commitment",
  notifDrawerOpen: false,
  // ---- lifecycle ----
  hydrate: () => {
    const stored = loadFromStorage();
    if (stored) {
      // Backfill new fields on state saved by older versions.
      set({
        ...stored,
        reflections: stored.reflections ?? initial.reflections,
        wins: stored.wins ?? initial.wins,
        letters: stored.letters ?? initial.letters,
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
      saveToStorage(persistableSlice(get()));
    }
  },
  persist: () => {
    set({ saveStatus: "saving" });
    try {
      saveToStorage(persistableSlice(get()));
      // simulate small delay so users see the state
      setTimeout(() => {
        if (get().saveStatus === "saving") set({ saveStatus: "saved" });
        setTimeout(() => {
          if (get().saveStatus === "saved") set({ saveStatus: "idle" });
        }, 1500);
      }, 250);
    } catch {
      set({ saveStatus: "failed" });
    }
  },
  reseed: () => {
    const fresh = buildInitialState();
    set({ ...fresh, hydrated: true });
    saveToStorage(persistableSlice(fresh));
  },

  // ---- UI toggles ----
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  openQuickAdd: (type = "commitment") =>
    set({ quickAddOpen: true, quickAddType: type }),
  closeQuickAdd: () => set({ quickAddOpen: false }),
  toggleNotifDrawer: () => set({ notifDrawerOpen: !get().notifDrawerOpen }),

  // ---- settings ----
  setTheme: (theme) => {
    set({ settings: { ...get().settings, theme } });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    get().persist();
  },
  setReducedMotion: (rm) => {
    set({ settings: { ...get().settings, reducedMotion: rm } });
    get().persist();
  },

  // ---------- Commitments ----------
  addCommitment: (payload) => {
    const item = {
      id: nanoid(10),
      userId: USER_ID,
      done: false,
      priority: "medium",
      area: "career",
      dueDate: new Date().toISOString().slice(0, 10),
      ...payload,
    };
    set({ commitments: [item, ...get().commitments] });
    get().logActivity("commitment", `Menambah commitment "${item.title}".`);
    get().persist();
    return item;
  },
  toggleCommitment: (id) => {
    set({
      commitments: get().commitments.map((c) =>
        c.id === id ? { ...c, done: !c.done } : c
      ),
    });
    get().persist();
  },
  removeCommitment: (id) => {
    set({ commitments: get().commitments.filter((c) => c.id !== id) });
    get().persist();
  },

  // ---------- Goals ----------
  addGoal: (payload) => {
    const goal = {
      id: nanoid(10),
      userId: USER_ID,
      area: "career",
      priority: "medium",
      status: "planned",
      progress: 0,
      createdAt: nowISO(),
      ...payload,
    };
    set({ goals: [goal, ...get().goals] });
    get().logActivity("goal", `Goal baru: "${goal.title}".`);
    get().persist();
    return goal;
  },
  updateGoal: (id, patch) => {
    set({
      goals: get().goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    });
    get().persist();
  },
  archiveGoal: (id) => {
    set({
      goals: get().goals.map((g) =>
        g.id === id ? { ...g, status: "archived" } : g
      ),
    });
    get().persist();
  },
  toggleSavingsMilestone: (goalId, milestoneId) => {
    set({
      goals: get().goals.map((g) => {
        if (g.id !== goalId || !g.milestones) return g;
        return {
          ...g,
          milestones: g.milestones.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  achieved: !m.achieved,
                  achievedAt: !m.achieved ? nowISO() : null,
                }
              : m
          ),
        };
      }),
    });
    get().persist();
  },

  // ---------- Career milestones ----------
  addCareerMilestone: (payload) => {
    const type = payload.type || "project";
    const item = {
      id: nanoid(10),
      userId: USER_ID,
      type,
      track: type === "experience" ? "experience" : "milestone",
      status: "planned",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      endMonth: null,
      endYear: null,
      ongoing: false,
      location: "",
      organization: "",
      description: "",
      highlights: [],
      skills: [],
      contribution: 5,
      evidenceUrl: "",
      createdAt: nowISO(),
      ...payload,
    };
    set({
      careerMilestones: [...get().careerMilestones, item].sort(byMonthYear),
    });
    get().logActivity("career", `Milestone karier: "${item.title}".`);
    get().persist();
    return item;
  },
  updateCareerMilestone: (id, patch) => {
    set({
      careerMilestones: get()
        .careerMilestones.map((m) => (m.id === id ? { ...m, ...patch } : m))
        .sort(byMonthYear),
    });
    get().persist();
  },
  removeCareerMilestone: (id) => {
    set({
      careerMilestones: get().careerMilestones.filter((m) => m.id !== id),
    });
    get().persist();
  },

  // ---------- Portfolio ----------
  addPortfolioProject: (payload) => {
    const p = {
      id: nanoid(10),
      userId: USER_ID,
      status: "in_progress",
      tools: [],
      link: "",
      impact: "",
      caseStudy: "",
      createdAt: nowISO(),
      ...payload,
    };
    set({ portfolio: [p, ...get().portfolio] });
    get().logActivity("career", `Portfolio: "${p.title}".`);
    get().persist();
  },
  updatePortfolioProject: (id, patch) => {
    set({
      portfolio: get().portfolio.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    });
    get().persist();
  },
  removePortfolioProject: (id) => {
    set({ portfolio: get().portfolio.filter((p) => p.id !== id) });
    get().persist();
  },

  // ---------- Skills ----------
  addSkill: (payload) => {
    const s = {
      id: nanoid(10),
      userId: USER_ID,
      category: "technical",
      level: 1,
      target: 5,
      momentum: 20,
      relatedToRole: false,
      lastPracticedAt: null,
      ...payload,
    };
    set({ skills: [s, ...get().skills] });
    get().logActivity("skill", `Skill ditambahkan: "${s.name}".`);
    get().persist();
  },
  updateSkill: (id, patch) => {
    set({
      skills: get().skills.map((sk) =>
        sk.id === id ? { ...sk, ...patch } : sk
      ),
    });
    get().persist();
  },
  removeSkill: (id) => {
    set({ skills: get().skills.filter((s) => s.id !== id) });
    get().persist();
  },
  practiceSkill: (id) => {
    const today = new Date().toISOString().slice(0, 10);
    set({
      skills: get().skills.map((sk) =>
        sk.id === id
          ? {
              ...sk,
              lastPracticedAt: today,
              momentum: Math.min(100, (sk.momentum || 0) + 8),
            }
          : sk
      ),
    });
    get().logActivity("skill", "Sesi latihan skill dicatat.");
    get().persist();
  },

  // ---------- Transactions ----------
  addTransaction: (payload) => {
    const tx = normalizeTransaction(payload);
    set({ transactions: [tx, ...get().transactions] });
    get().logActivity(
      "finance",
      `${tx.type === "income" ? "Pemasukan" : "Pengeluaran"} "${tx.title}" ${tx.amount}.`
    );
    get().persist();
    return tx;
  },
  /** Pulls WhatsApp-originated transactions from Supabase and merges any not seen locally yet. */
  syncWhatsAppTransactions: async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const res = await fetch("/api/whatsapp/pull");
      if (!res.ok) return;
      const rows = await res.json();
      const existingIds = new Set(get().transactions.map((t) => t.id));
      for (const row of rows) {
        if (existingIds.has(row.id)) continue;
        get().addTransaction({
          id: row.id,
          userId: row.user_id,
          title: row.title,
          type: row.type,
          category: row.category,
          amount: Number(row.amount),
          date: row.date,
          notes: row.notes || "",
          recurring: Boolean(row.recurring),
          source: row.source,
          createdAt: row.created_at,
        });
      }
    } catch {
      /* best-effort — offline or Supabase unreachable, try again next mount */
    }
  },
  updateTransaction: (id, patch) => {
    set({
      transactions: get().transactions.map((t) =>
        t.id === id ? { ...t, ...patch } : t
      ),
    });
    get().persist();
  },
  removeTransaction: (id) => {
    set({ transactions: get().transactions.filter((t) => t.id !== id) });
    get().persist();
  },

  // ---------- Budgets ----------
  upsertBudget: (payload) => {
    const list = get().budgets;
    const idx = list.findIndex(
      (b) => b.category === payload.category && b.month === payload.month
    );
    if (idx >= 0) {
      const updated = [...list];
      updated[idx] = { ...updated[idx], ...payload };
      set({ budgets: updated });
    } else {
      set({
        budgets: [
          { id: nanoid(8), userId: USER_ID, ...payload },
          ...list,
        ],
      });
    }
    get().persist();
  },
  removeBudget: (id) => {
    set({ budgets: get().budgets.filter((b) => b.id !== id) });
    get().persist();
  },

  // ---------- Reminders ----------
  addReminder: (payload) => {
    const r = {
      id: nanoid(10),
      userId: USER_ID,
      cadence: "monthly",
      active: true,
      dueDay: 1,
      ...payload,
    };
    set({ reminders: [r, ...get().reminders] });
    get().persist();
  },
  toggleReminder: (id) => {
    set({
      reminders: get().reminders.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r
      ),
    });
    get().persist();
  },
  removeReminder: (id) => {
    set({ reminders: get().reminders.filter((r) => r.id !== id) });
    get().persist();
  },

  // ---------- Reviews (Life Compass weekly ritual) ----------
  addReview: (payload) => {
    const r = {
      id: nanoid(10),
      userId: USER_ID,
      weekOf: new Date().toISOString().slice(0, 10),
      // Present — grounding
      moodWord: "",
      energyLevel: null, // 1-5
      stressLevel: null, // 1-5
      // Past — recognition (highlights doubles as the editable Hero's Journey draft)
      highlights: "",
      // Future — trajectory
      blockers: "",
      finance: "",
      careerProgress: "",
      nextWeekFocus: [],
      focusStatus: {}, // {index: "resolved" | "carried" | "dropped"} — follow-up tracking
      linkedGoals: [],
      linkedSkills: [],
      isPrivate: true,
      createdAt: nowISO(),
      ...payload,
    };
    set({ reviews: [r, ...get().reviews] });
    get().logActivity("review", `Ritual mingguan disimpan.`);
    get().persist();
  },
  /** Marks one focus item on a past ritual — lightweight toggle, the review stays otherwise immutable. */
  setFocusResolution: (reviewId, index, status) => {
    set({
      reviews: get().reviews.map((r) =>
        r.id === reviewId
          ? { ...r, focusStatus: { ...(r.focusStatus || {}), [index]: status } }
          : r
      ),
    });
    get().persist();
  },

  // ---------- Notifications ----------
  addNotification: ({ title, body, tone = "info" }) => {
    const n = {
      id: nanoid(8),
      userId: USER_ID,
      title,
      body,
      tone,
      read: false,
      createdAt: nowISO(),
    };
    set({ notifications: [n, ...get().notifications] });
    get().persist();
  },
  markNotificationRead: (id) => {
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    });
    get().persist();
  },
  clearNotifications: () => {
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
    });
    get().persist();
  },

  // ---------- Activity ----------
  logActivity: (kind, message) => {
    const entry = {
      id: nanoid(8),
      userId: USER_ID,
      kind,
      message,
      createdAt: nowISO(),
    };
    set({ activity: [entry, ...get().activity].slice(0, 80) });
  },

  // ---------- Reflections ----------
  addReflection: (payload) => {
    const r = {
      id: nanoid(10),
      userId: USER_ID,
      kind: "quick", // quick | deep
      template: null, // for deep: career | finance | growth | decision | gratitude
      moodWord: "",
      // Quick fields
      currentState: "",
      whatWentWell: "",
      whatFeltHeavy: "",
      lesson: "",
      smallStep: "",
      // Deep answers (variable by template)
      answers: {},
      // Links
      linkedGoals: [],
      linkedSkills: [],
      linkedTransactions: [],
      linkedCommitments: [],
      linkedReview: null,
      tags: [],
      // Improvement actions (up to 3)
      improvementActions: [],
      // Privacy
      isPrivate: true,
      createdAt: nowISO(),
      ...payload,
    };
    set({ reflections: [r, ...get().reflections] });
    get().logActivity("reflection", `Refleksi baru disimpan (${r.kind}).`);
    get().persist();
    return r;
  },
  updateReflection: (id, patch) => {
    set({
      reflections: get().reflections.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    });
    get().persist();
  },
  removeReflection: (id) => {
    set({ reflections: get().reflections.filter((r) => r.id !== id) });
    get().persist();
  },
  convertActionToCommitment: (reflectionId, actionId) => {
    const r = get().reflections.find((x) => x.id === reflectionId);
    if (!r) return;
    const action = (r.improvementActions || []).find((a) => a.id === actionId);
    if (!action || action.convertedToCommitmentId) return;

    const c = {
      id: nanoid(10),
      userId: USER_ID,
      title: action.text,
      area: r.template === "finance" ? "finance"
           : r.template === "career" ? "career"
           : r.template === "growth" ? "growth"
           : "growth",
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      done: false,
      priority: "medium",
      fromReflection: r.id,
    };
    set({
      commitments: [c, ...get().commitments],
      reflections: get().reflections.map((rr) =>
        rr.id === reflectionId
          ? {
              ...rr,
              improvementActions: rr.improvementActions.map((a) =>
                a.id === actionId ? { ...a, convertedToCommitmentId: c.id } : a
              ),
            }
          : rr
      ),
    });
    get().logActivity(
      "reflection",
      `Improvement action dijadikan commitment: "${action.text}".`
    );
    get().persist();
  },

  // ---------- Wins & gratitude ----------
  addWin: (payload) => {
    const w = {
      id: nanoid(8),
      userId: USER_ID,
      kind: "win", // win | gratitude
      text: "",
      createdAt: nowISO(),
      ...payload,
    };
    set({ wins: [w, ...get().wins] });
    get().logActivity(
      "reflection",
      `${w.kind === "gratitude" ? "Gratitude" : "Win"} dicatat.`
    );
    get().persist();
  },
  removeWin: (id) => {
    set({ wins: get().wins.filter((w) => w.id !== id) });
    get().persist();
  },

  // ---------- Letter to future self ----------
  addLetter: (payload) => {
    const l = {
      id: nanoid(10),
      userId: USER_ID,
      title: "Surat untuk diri yang akan datang",
      body: "",
      sealedUntil: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      opened: false,
      createdAt: nowISO(),
      ...payload,
    };
    set({ letters: [l, ...get().letters] });
    get().logActivity("reflection", `Surat untuk diri sendiri ditulis.`);
    get().persist();
    return l;
  },
  openLetter: (id) => {
    set({
      letters: get().letters.map((l) =>
        l.id === id ? { ...l, opened: true, openedAt: nowISO() } : l
      ),
    });
    get().persist();
  },
  removeLetter: (id) => {
    set({ letters: get().letters.filter((l) => l.id !== id) });
    get().persist();
  },
}));

function byMonthYear(a, b) {
  const av = a.year * 12 + (a.month || 0);
  const bv = b.year * 12 + (b.month || 0);
  return av - bv;
}
