"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import { MoodPicker } from "./MoodPicker";
import {
  momentumIndex,
  weeklyNarrativeDraft,
  reflectionInsights,
  unresolvedFocusItems,
  computeGoalProgress,
  careerReadiness,
  savingsProgress,
} from "@/lib/insights";
import { formatDateID } from "@/lib/format";
import { Sparkles, BatteryMedium, Flame, ChevronRight, ArrowUpRight, Check, CornerDownRight, X } from "lucide-react";
import clsx from "clsx";

function currentWeekLabel() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `Minggu ${week} · ${now.getFullYear()}`;
}

const MOMENTUM_TONE = {
  momentum: "border-forest-500/40 bg-forest-500/5",
  "burnout-risk": "border-terracotta/40 bg-terracotta/5",
  balanced: "border-line dark:border-night-border bg-card dark:bg-night-card",
  unknown: "border-dashed border-line dark:border-night-border bg-card/60 dark:bg-night-card/60",
};

const EMPTY_FORM = {
  moodWord: "",
  energyLevel: null,
  stressLevel: null,
  highlights: "",
  blockers: "",
  finance: "",
  careerProgress: "",
  focus1: "",
  focus2: "",
  focus3: "",
  linkedGoals: [],
  linkedSkills: [],
};

export default function WeeklyRitual() {
  const {
    reviews, wins, reflections, commitments, goals, skills,
    transactions, portfolio, careerMilestones, financeTargets, addReview, setFocusResolution,
  } = useLifeStore();

  const followUps = useMemo(() => unresolvedFocusItems(reviews), [reviews]);

  const momentum = useMemo(() => momentumIndex(reviews, commitments), [reviews, commitments]);
  const pattern = useMemo(
    () => reflectionInsights(reflections, wins, goals, skills),
    [reflections, wins, goals, skills]
  );
  const ctx = useMemo(
    () => ({
      readiness: careerReadiness(goals, skills, portfolio, careerMilestones),
      savings: savingsProgress(goals, transactions, financeTargets),
      transactions,
    }),
    [goals, skills, portfolio, careerMilestones, transactions, financeTargets]
  );
  // Computed once on mount — a starting suggestion the user edits, not a live value.
  const draft = useMemo(
    () => weeklyNarrativeDraft({ reviews, wins, reflections, commitments, goals, skills }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [form, setForm] = useState({ ...EMPTY_FORM, highlights: draft });
  const [saved, setSaved] = useState(false);

  function toggle(list, id) {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  const emptyFocusSlot = ["focus1", "focus2", "focus3"].find((k) => !form[k].trim()) || null;

  function carryForward(item) {
    if (!emptyFocusSlot) return;
    setForm((f) => ({ ...f, [emptyFocusSlot]: item.text }));
    setFocusResolution(item.reviewId, item.index, "carried");
  }

  function submit(e) {
    e.preventDefault();
    const focus = [form.focus1, form.focus2, form.focus3].map((s) => s.trim()).filter(Boolean);
    addReview({
      weekOf: new Date().toISOString().slice(0, 10),
      moodWord: form.moodWord,
      energyLevel: form.energyLevel,
      stressLevel: form.stressLevel,
      highlights: form.highlights,
      blockers: form.blockers,
      finance: form.finance,
      careerProgress: form.careerProgress,
      nextWeekFocus: focus,
      linkedGoals: form.linkedGoals,
      linkedSkills: form.linkedSkills,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="grid gap-8">
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="eyebrow">{currentWeekLabel()}</div>
        <h2 className="h-display text-[28px] mt-1">Ritual mingguan</h2>
        <p className="text-[13px] text-ink-muted mt-2 max-w-lg">
          Masa lalu diakui, masa kini dijujuri, masa depan diarahkan. Lima menit sebelum
          minggu berikutnya dimulai.
        </p>
      </motion.section>

      <div className={clsx("rounded-2xl border p-5", MOMENTUM_TONE[momentum.status])}>
        <div className="eyebrow flex items-center gap-1.5">
          <Flame className="h-3 w-3" /> {momentum.title}
        </div>
        <p className="mt-1.5 text-[13px] text-ink-soft leading-relaxed">{momentum.body}</p>
      </div>

      {followUps.length > 0 && (
        <div
          className="rounded-2xl border border-line dark:border-night-border bg-card dark:bg-night-card p-5"
          data-testid="followup-card"
        >
          <div className="eyebrow flex items-center gap-1.5">
            <CornerDownRight className="h-3 w-3" /> Dari ritual sebelumnya
          </div>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Janji kecil yang belum ketahuan kabarnya — tandai jujur saja, tidak ada yang menghakimi.
          </p>
          <ul className="mt-3 space-y-2">
            {followUps.map((it) => (
              <li
                key={`${it.reviewId}-${it.index}`}
                className="rounded-lg border border-line dark:border-night-border p-3"
                data-testid={`followup-${it.reviewId}-${it.index}`}
              >
                <div className="text-[13px]">{it.text}</div>
                <div className="text-[10.5px] text-ink-muted mt-0.5">
                  {it.weeksAgo} minggu lalu kamu bilang mau ini — gimana kabarnya?
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFocusResolution(it.reviewId, it.index, "resolved")}
                    className="btn-ghost text-[11.5px]"
                    data-testid={`followup-resolve-${it.reviewId}-${it.index}`}
                  >
                    <Check className="h-3 w-3" /> Sudah jalan
                  </button>
                  <button
                    type="button"
                    onClick={() => carryForward(it)}
                    disabled={!emptyFocusSlot}
                    className="btn-ghost text-[11.5px] disabled:opacity-40"
                    title={emptyFocusSlot ? undefined : "Ketiga slot fokus minggu ini sudah terisi"}
                    data-testid={`followup-carry-${it.reviewId}-${it.index}`}
                  >
                    <CornerDownRight className="h-3 w-3" /> Bawa ke minggu ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusResolution(it.reviewId, it.index, "dropped")}
                    className="btn-ghost text-[11.5px] text-ink-muted"
                    data-testid={`followup-drop-${it.reviewId}-${it.index}`}
                  >
                    <X className="h-3 w-3" /> Lepaskan dengan sadar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pattern.topGoal && (
        <div className="rounded-2xl border border-line dark:border-night-border p-5 bg-card dark:bg-night-card">
          <div className="eyebrow flex items-center gap-1.5">
            <ArrowUpRight className="h-3 w-3" /> Efek kupu-kupu
          </div>
          <p className="mt-1.5 text-[13px] text-ink-soft leading-relaxed">
            Perhatianmu belakangan paling banyak tertuju ke{" "}
            <span className="text-forest-500 dark:text-lime font-medium">
              &ldquo;{pattern.topGoal.title}&rdquo;
            </span>
            . Progres goal ini sekarang di <strong>{computeGoalProgress(pattern.topGoal, ctx)}%</strong> —
            setiap refleksi kecil ikut menggerakkan angka ini.
          </p>
        </div>
      )}

      <form onSubmit={submit} className="grid gap-5" data-testid="ritual-form">
        <div className="grid gap-4">
          <MoodPicker value={form.moodWord} onChange={(v) => setForm({ ...form, moodWord: v })} />
          <LevelPicker
            label="Energi minggu ini"
            icon={BatteryMedium}
            value={form.energyLevel}
            onChange={(v) => setForm({ ...form, energyLevel: v })}
            testidPrefix="energy"
          />
          <LevelPicker
            label="Tingkat stres minggu ini"
            icon={Flame}
            value={form.stressLevel}
            onChange={(v) => setForm({ ...form, stressLevel: v })}
            testidPrefix="stress"
          />
        </div>

        <label className="grid gap-1.5">
          <span className="eyebrow flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Cerita minggumu (draft otomatis — ubah sesukamu)
          </span>
          {/* Composed-document register, not a form box: manuscript left rule,
              transparent field, prose measure. Same textarea, same handlers. */}
          <textarea
            value={form.highlights}
            onChange={(e) => setForm({ ...form, highlights: e.target.value })}
            rows={5}
            className="w-full resize-none bg-transparent border-0 border-l-2 border-line dark:border-night-border focus:border-forest-500 dark:focus:border-lime pl-4 py-1.5 font-reflect italic text-[17px] leading-[1.8] text-ink-soft placeholder:text-ink-muted focus:outline-none focus:ring-0 transition-colors"
            data-testid="ritual-highlights"
          />
        </label>

        <Field label="Apa yang menghambat?">
          <textarea
            value={form.blockers}
            onChange={(e) => setForm({ ...form, blockers: e.target.value })}
            placeholder="Yang perlu diakui agar bisa diperbaiki…"
            className="input h-20 resize-none"
            data-testid="ritual-blockers"
          />
        </Field>
        <Field label="Refleksi keuangan minggu ini">
          <textarea
            value={form.finance}
            onChange={(e) => setForm({ ...form, finance: e.target.value })}
            placeholder="Cashflow, godaan, keputusan yang membanggakan…"
            className="input h-20 resize-none"
          />
        </Field>
        <Field label="Progres karier / skill">
          <textarea
            value={form.careerProgress}
            onChange={(e) => setForm({ ...form, careerProgress: e.target.value })}
            placeholder="Latihan SQL, portfolio, network, aplikasi…"
            className="input h-20 resize-none"
          />
        </Field>

        <div>
          <div className="eyebrow mb-2">1–3 fokus untuk minggu depan</div>
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <input
                key={n}
                value={form[`focus${n}`]}
                onChange={(e) => setForm({ ...form, [`focus${n}`]: e.target.value })}
                placeholder={`Fokus ${n}`}
                className="input"
                data-testid={`ritual-focus-${n}`}
              />
            ))}
          </div>
        </div>

        <details className="rounded-xl border border-dashed border-line dark:border-night-border p-4">
          <summary className="cursor-pointer text-[12px] eyebrow flex items-center gap-2">
            Goal & skill yang dibangun minggu ini <ChevronRight className="h-3 w-3" />
          </summary>
          <div className="mt-3 grid gap-3">
            <div>
              <div className="eyebrow mb-1.5">Goal</div>
              <div className="flex flex-wrap gap-1.5">
                {goals.filter((g) => g.status !== "archived").slice(0, 8).map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setForm({ ...form, linkedGoals: toggle(form.linkedGoals, g.id) })}
                    className={clsx(
                      "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                      form.linkedGoals.includes(g.id)
                        ? "bg-forest-500/10 border-forest-500 text-forest-500 dark:border-lime dark:text-lime"
                        : "border-line dark:border-night-border text-ink-muted"
                    )}
                  >
                    {g.title.length > 32 ? g.title.slice(0, 32) + "…" : g.title}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="eyebrow mb-1.5">Skill</div>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 8).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm({ ...form, linkedSkills: toggle(form.linkedSkills, s.id) })}
                    className={clsx(
                      "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                      form.linkedSkills.includes(s.id)
                        ? "bg-forest-500/10 border-forest-500 text-forest-500 dark:border-lime dark:text-lime"
                        : "border-line dark:border-night-border text-ink-muted"
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </details>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-dark" data-testid="save-ritual-btn">
            <Sparkles className="h-3.5 w-3.5" /> Simpan ritual minggu ini
          </button>
          {saved && <span className="text-[12px] text-forest-500 dark:text-lime">Tersimpan ✓</span>}
        </div>
      </form>

      {reviews.length > 0 && (
        <section className="mt-4">
          <div className="eyebrow">Histori ritual</div>
          <h3 className="h-display text-[22px] mt-1 mb-4">Cerita minggu-mingguku</h3>
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-line dark:border-night-border p-4 bg-card dark:bg-night-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-ink-muted">{formatDateID(r.weekOf)}</span>
                    {r.moodWord && <span className="chip">{r.moodWord}</span>}
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-muted" />
                </div>
                {r.highlights && (
                  <p className="mt-2 text-[13px] text-ink-soft italic">&ldquo;{r.highlights}&rdquo;</p>
                )}
                {r.nextWeekFocus?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.nextWeekFocus.map((f, i) => <span key={i} className="chip">{f}</span>)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}

function LevelPicker({ label, icon: Icon, value, onChange, testidPrefix }) {
  return (
    <div>
      <div className="eyebrow mb-2 flex items-center gap-1.5">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            data-testid={`${testidPrefix}-${n}`}
            className={clsx(
              "h-8 w-8 rounded-full text-[12px] font-medium border transition-colors",
              value === n
                ? "border-forest-500 bg-forest-500/10 text-forest-500 dark:border-lime dark:text-lime"
                : "border-line dark:border-night-border text-ink-muted hover:text-ink dark:hover:text-night-text"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
