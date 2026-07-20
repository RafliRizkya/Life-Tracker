/**
 * Zustand store — canonical client-side state.
 *
 * Persistence strategy (hardened 2026-07-20 after a real incident — see
 * docs/features/supabase-sync.md "Reliability hardening" for the full story):
 *   1. On mount, render from localStorage immediately (offline-first, never
 *      blocks first paint), then reconcile with Supabase.
 *   2. Once Supabase is configured, IT is the source of truth. localStorage
 *      is a local cache plus a staging buffer for writes Supabase hasn't
 *      confirmed yet. hydrate() never guesses "whose copy is newer" by
 *      comparing timestamps — either this device has confirmed-pending
 *      local writes (`pendingSync`) and pushes them, or it doesn't, in
 *      which case remote is trusted unconditionally.
 *   3. Every mutation persists to localStorage synchronously and schedules
 *      a debounced push to Supabase. A failed push is never silent:
 *      `pendingSync` stays true, a notification is shown, and both the next
 *      hydrate() and the browser's `online` event retry it automatically.
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
const CURRENT_VERSION = 1;
const USER_ID =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SEED_USER_ID) ||
  "rafli-akbar";

const nowISO = () => new Date().toISOString();
const asObject = (v, fallback) => (v && typeof v === "object" && !Array.isArray(v) ? v : fallback);

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

/**
 * One-time backfill for goals saved before `progressSource` existed (2026-07-20):
 * the original seed had hand-typed placeholder numbers for progress/metric.current
 * that read as unexplained "ghost" percentages once shown without their origin
 * explained — see the phantom-8.4jt bug this same pattern caused for Finance.
 * `progressSource`'s presence is the migration marker, so a goal only gets
 * touched once — real progress the user sets afterward is never reset again.
 */
function migrateGoals(goals) {
  return (goals || []).map((g) => {
    if (g.progressSource) return g;
    return {
      ...g,
      progressSource: { type: "manual" },
      ...(g.metric ? { metric: { ...g.metric, current: 0 } } : {}),
      ...(typeof g.progress === "number" ? { progress: 0 } : {}),
    };
  });
}

const ARRAY_FIELDS = [
  "goals", "careerMilestones", "portfolio", "skills", "transactions",
  "budgets", "reminders", "reviews", "commitments", "notifications",
  "activity", "reflections", "wins", "letters",
];

/**
 * Normalizes a stored/remote state blob against the current shape — never
 * rejects it outright. 2026-07-20: this replaced a strict
 * `parsed.version !== 1 → return null` check in loadFromStorage() that would
 * have silently discarded a user's ENTIRE saved state (every transaction,
 * every goal) the moment `version` in seed.js ever changed for any reason —
 * exactly the shape of bug that reads as "my data disappeared after a
 * deploy." Every field the blob already has is preserved as-is; only a
 * missing/new field gets backfilled from `initial`, and a corrupted
 * non-array value for a list field falls back to empty rather than crashing
 * every `.map()`/`.filter()` downstream.
 */
function migrateState(parsed) {
  if (!parsed || typeof parsed !== "object") return null;
  if (parsed.version !== CURRENT_VERSION) {
    console.warn(
      `[store] migrating stored state (version ${parsed.version ?? "unknown"} -> ${CURRENT_VERSION}) — existing data preserved, new fields backfilled from defaults.`
    );
  }
  const merged = { ...initial, ...parsed, version: CURRENT_VERSION };
  for (const key of ARRAY_FIELDS) {
    if (!Array.isArray(merged[key])) merged[key] = initial[key];
  }
  merged.goals = migrateGoals(merged.goals);
  merged.settings = { ...initial.settings, ...asObject(parsed.settings, {}) };
  merged.financeTargets = { ...initial.financeTargets, ...asObject(parsed.financeTargets, {}) };
  merged.user = { ...initial.user, ...asObject(parsed.user, {}) };
  return merged;
}

function loadFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const merged = migrateState(parsed);
    if (!merged) return null;
    // Marks whether migrateState() actually changed anything (new version,
    // missing field backfilled, a goal migrated) — hydrate() uses this to
    // decide whether the fix needs pushing to Supabase right away instead of
    // silently waiting for the user's next unrelated edit. Stripped before
    // the object is ever used as real state (see hydrate()).
    merged.__migrated = JSON.stringify(persistableSlice(merged)) !== JSON.stringify(persistableSlice(parsed || {}));
    return merged;
  } catch {
    return null;
  }
}

function saveToStorage(state, { pendingSync = false } = {}) {
  if (typeof window === "undefined") return;
  // Let quota/private-mode errors propagate — persist() surfaces them,
  // swallowing here silently loses the user's just-made change. `savedAt`
  // is kept for diagnostics only — reconciliation is driven by
  // `pendingSync`, never by comparing timestamps (see hydrate()).
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, version: CURRENT_VERSION, savedAt: nowISO(), pendingSync })
  );
}

/** Debounced push to Supabase — never silent on failure, see markSynced()/markSyncFailed(). */
let pushTimer = null;
function schedulePush(getState) {
  if (typeof window === "undefined") return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    if (!isSupabaseConfigured()) return; // nothing to sync to — not a failure
    const state = getState();
    const ok = await pushToSupabase(persistableSlice(state));
    if (ok) state.markSynced();
    else state.markSyncFailed();
  }, 800);
}

async function pushToSupabase(state) {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Build a minimal "state slice" object. We don't persist ephemeral
 * UI state (modals, palettes, save indicators, pendingSync).
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
    financeTargets: s.financeTargets,
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
  pendingSync: false, // true = local has changes Supabase hasn't confirmed yet
  paletteOpen: false,
  quickAddOpen: false,
  quickAddType: "commitment",
  notifDrawerOpen: false,
  // ---- lifecycle ----
  hydrate: async () => {
    const stored = loadFromStorage();
    const needsResync = Boolean(stored?.__migrated);
    if (stored) delete stored.__migrated;

    // Render local (or fresh seed) immediately — offline-first, never blocks
    // first paint. loadFromStorage() already normalized/backfilled it.
    set(stored ? { ...stored, hydrated: true } : { hydrated: true, pendingSync: false });

    if (!isSupabaseConfigured()) {
      // Makes a misconfigured production build impossible to miss — before
      // this, a missing env var meant the app silently ran local-only with
      // no visible sign anywhere.
      get().warnSupabaseNotConfigured();
      if (!stored || needsResync) get().persist();
      return;
    }

    // Once Supabase is configured, it is the source of truth. We never
    // compare timestamps to guess whose copy is "newer" (2026-07-20: a real
    // incident showed that's unsafe — a device with no real local data
    // could "win" against genuine synced data just by having no savedAt to
    // compare). Either this device has confirmed-pending local writes and
    // we push them, or it doesn't, and remote is trusted unconditionally.
    const hasPendingLocalChanges = Boolean(stored?.pendingSync) || needsResync;

    try {
      const res = await fetch("/api/sync");
      if (!res.ok) {
        if (!stored || needsResync) get().persist();
        return;
      }
      const { state: remote } = await res.json();

      if (!remote) {
        // Nothing synced yet for this account, confirmed — safe to push.
        const ok = await pushToSupabase(persistableSlice(get()));
        if (ok) get().markSynced();
        else get().markSyncFailed();
        return;
      }

      if (hasPendingLocalChanges) {
        // This device has writes Supabase hasn't confirmed yet — never
        // discard them by blindly trusting remote. Push them now instead.
        const ok = await pushToSupabase(persistableSlice(get()));
        if (ok) get().markSynced();
        else get().markSyncFailed();
        return;
      }

      // No unconfirmed local changes — Supabase is authoritative, adopt it.
      // If remote itself needed migrating (old goals missing progressSource,
      // a field added since it was saved), push the corrected shape back —
      // otherwise the fix would only live in this device's memory/localStorage
      // until some unrelated future edit happened to re-sync it.
      const merged = migrateState(remote);
      const remoteNeedsResync =
        JSON.stringify(persistableSlice(merged)) !== JSON.stringify(persistableSlice(remote));
      set({ ...merged, hydrated: true, pendingSync: remoteNeedsResync });
      if (remoteNeedsResync) {
        get().persist();
      } else {
        saveToStorage(persistableSlice(get()), { pendingSync: false });
      }
    } catch {
      // Offline/unreachable — nothing to race against; local stands as-is,
      // retried automatically on next mount or when the browser reconnects
      // (retryPendingSync() + the `online` listener in providers.jsx).
      if (!stored || needsResync) get().persist();
    }
  },
  persist: () => {
    set({ saveStatus: "saving", pendingSync: true });
    try {
      saveToStorage(persistableSlice(get()), { pendingSync: true });
      schedulePush(get);
      // simulate small delay so users see the state
      setTimeout(() => {
        if (get().saveStatus === "saving") set({ saveStatus: "saved" });
        setTimeout(() => {
          if (get().saveStatus === "saved") set({ saveStatus: "idle" });
        }, 1500);
      }, 250);
    } catch {
      set({ saveStatus: "failed" });
      // Don't route through get().persist() here — it would recurse if
      // storage keeps failing. Push the warning directly instead.
      if (!get().notifications.some((n) => n.id === "save-failed")) {
        set({
          notifications: [
            {
              id: "save-failed",
              userId: USER_ID,
              title: "Penyimpanan gagal",
              body: "Perubahan terakhir tidak tersimpan di perangkat ini. Storage browser mungkin penuh atau kamu sedang di mode privasi.",
              tone: "warning",
              read: false,
              createdAt: nowISO(),
            },
            ...get().notifications,
          ],
        });
      }
    }
  },
  /** Confirmed synced to Supabase — clears the pending flag and any failure notice. */
  markSynced: () => {
    set({
      pendingSync: false,
      notifications: get().notifications.filter((n) => n.id !== "cloud-sync-failed"),
    });
    saveToStorage(persistableSlice(get()), { pendingSync: false });
  },
  /** A push to Supabase failed — never silent: keeps pendingSync true, tells the user, retried automatically later. */
  markSyncFailed: () => {
    set({ pendingSync: true });
    // Persist pendingSync:true to localStorage itself, not just in-memory
    // state — otherwise closing the tab right after a failed push loses the
    // flag, and the next app open has no way to know a retry is owed.
    saveToStorage(persistableSlice(get()), { pendingSync: true });
    if (!get().notifications.some((n) => n.id === "cloud-sync-failed")) {
      set({
        notifications: [
          {
            id: "cloud-sync-failed",
            userId: USER_ID,
            title: "Gagal sync ke server",
            body: "Perubahan tersimpan di perangkat ini tapi belum sampai ke cloud. Akan dicoba lagi otomatis saat koneksi kembali atau app dibuka lagi.",
            tone: "warning",
            read: false,
            createdAt: nowISO(),
          },
          ...get().notifications,
        ],
      });
    }
  },
  /** Retries a previously-failed push. Called on app open (hydrate) via pendingSync, and on the browser's `online` event (providers.jsx). */
  retryPendingSync: async () => {
    if (!isSupabaseConfigured() || !get().pendingSync) return;
    const ok = await pushToSupabase(persistableSlice(get()));
    if (ok) get().markSynced();
    else get().markSyncFailed();
  },
  /** Surfaces a persistent warning if NEXT_PUBLIC_SUPABASE_* env vars are missing from this build. */
  warnSupabaseNotConfigured: () => {
    if (isSupabaseConfigured()) return;
    if (get().notifications.some((n) => n.id === "supabase-not-configured")) return;
    set({
      notifications: [
        {
          id: "supabase-not-configured",
          userId: USER_ID,
          title: "Sync ke cloud tidak aktif",
          body: "Environment variable Supabase tidak terdeteksi di build ini — data hanya tersimpan di perangkat ini, tidak ke cloud. Cek Vercel Project Settings → Environment Variables.",
          tone: "warning",
          read: false,
          createdAt: nowISO(),
        },
        ...get().notifications,
      ],
    });
  },
  reseed: () => {
    const fresh = buildInitialState();
    set({ ...fresh, hydrated: true, pendingSync: false });
    saveToStorage(persistableSlice(fresh), { pendingSync: false });
    if (isSupabaseConfigured()) {
      pushToSupabase(persistableSlice(fresh)).then((ok) => {
        if (ok) get().markSynced();
        else get().markSyncFailed();
      });
    }
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
      progressSource: { type: "manual" },
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
  // Flat weekly spending limit, no category dimension — every expense
  // transaction that week counts against it, regardless of category.
  setWeeklyBudget: (month, week, limit) => {
    const list = get().budgets;
    const idx = list.findIndex((b) => b.month === month && b.week === week);
    if (idx >= 0) {
      const updated = [...list];
      updated[idx] = { ...updated[idx], limit };
      set({ budgets: updated });
    } else {
      set({ budgets: [{ id: nanoid(8), userId: USER_ID, month, week, limit }, ...list] });
    }
    get().persist();
  },
  removeWeeklyBudget: (id) => {
    set({ budgets: get().budgets.filter((b) => b.id !== id) });
    get().persist();
  },

  // ---------- Finance targets (Dana Darurat / Tabungan) ----------
  setFinanceTarget: (fund, target) => {
    set({
      financeTargets: {
        ...get().financeTargets,
        [fund]: { ...get().financeTargets[fund], target },
      },
    });
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
  updateReminder: (id, patch) => {
    set({
      reminders: get().reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
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
