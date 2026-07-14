"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import { REFLECTION_TEMPLATES, REFLECTION_MOOD_WORDS } from "@/lib/seed";
import { reflectionInsights } from "@/lib/insights";
import { formatDateID, formatMonthYear, MONTHS_ID_LONG } from "@/lib/format";
import {
  Feather,
  Sparkles,
  Plus,
  Trash2,
  X,
  Heart,
  Award,
  Mail,
  Lock,
  ChevronRight,
  Send,
  BookHeart,
  Clock,
  ArrowRight,
} from "lucide-react";
import { nanoid } from "nanoid";
import clsx from "clsx";

const TABS = [
  { key: "compose", label: "Berbenah" },
  { key: "timeline", label: "Timeline" },
  { key: "wins", label: "Wins & Gratitude" },
  { key: "letters", label: "Surat untuk Diri" },
];

export default function ReflectionPage() {
  const [tab, setTab] = useState("compose");
  const {
    reflections, wins, letters, goals, skills, commitments, reviews,
  } = useLifeStore();

  const pattern = useMemo(
    () => reflectionInsights(reflections, wins, goals, skills),
    [reflections, wins, goals, skills]
  );

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 pt-10 pb-24">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="eyebrow flex items-center gap-1.5">
          <Feather className="h-3 w-3" /> Ruang Berbenah · Privat
        </div>
        <h1 className="h-display text-[44px] md:text-[56px] mt-3 leading-[0.98]">
          Menepi <em>sejenak.</em>
          <br />
          <span className="text-ink-soft">Perbaiki satu hal kecil.</span>
        </h1>
        <p className="text-[14px] text-ink-muted mt-4 max-w-lg leading-relaxed font-reflect italic">
          Ruang ini bukan untuk menghakimi. Ia untuk menyadari, memahami pola,
          memilih satu perbaikan lembut, lalu meninjau kembali di lain waktu.
        </p>
      </motion.header>

      {/* Pattern gentle banner */}
      {pattern.insights.length > 0 && tab === "compose" && (
        <PatternBanner insights={pattern.insights} />
      )}

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5 mb-8 border-b border-line dark:border-night-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            data-testid={`tab-${t.key}`}
            className={clsx(
              "px-4 py-2.5 -mb-px border-b-2 text-[12.5px] font-medium transition-colors",
              tab === t.key
                ? "border-forest-500 dark:border-lime text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {tab === "compose" && <ComposeSection pattern={pattern} />}
          {tab === "timeline" && <TimelineSection />}
          {tab === "wins" && <WinsSection />}
          {tab === "letters" && <LettersSection />}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Pattern Insight banner                                                */
/* --------------------------------------------------------------------- */

function PatternBanner({ insights }) {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
      {insights.slice(0, 4).map((ins) => (
        <div
          key={ins.key}
          className={clsx(
            "rounded-xl border p-4",
            ins.tone === "positive"
              ? "border-forest-500/40 bg-forest-500/5"
              : "border-line dark:border-night-border bg-card dark:bg-night-card"
          )}
        >
          <div className="eyebrow flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Pattern insight
          </div>
          <div
            className="text-[14px] font-medium mt-1.5"
            dangerouslySetInnerHTML={{ __html: ins.title }}
          />
          <div className="text-[12.5px] text-ink-muted mt-1 leading-relaxed">
            {ins.body}
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Compose section                                                       */
/* --------------------------------------------------------------------- */

const AUTOSAVE_KEY = "rafli-life-tracker::reflection-draft::v1";

function ComposeSection({ pattern }) {
  const [mode, setMode] = useState("quick"); // quick | deep
  const [template, setTemplate] = useState("career");

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <ModeChip active={mode === "quick"} onClick={() => setMode("quick")}>
          Quick · 2 menit
        </ModeChip>
        <ModeChip active={mode === "deep"} onClick={() => setMode("deep")}>
          Deep reflection
        </ModeChip>
      </div>

      {mode === "deep" && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {Object.values(REFLECTION_TEMPLATES).map((t) => (
            <button
              key={t.key}
              onClick={() => setTemplate(t.key)}
              data-testid={`template-${t.key}`}
              className={clsx(
                "px-3 py-1.5 rounded-full text-[11.5px] font-medium border transition-colors",
                template === t.key
                  ? "border-ink text-ink dark:border-lime dark:text-lime"
                  : "border-line dark:border-night-border text-ink-muted hover:text-ink dark:hover:text-night-text"
              )}
              style={{
                background: template === t.key ? `${t.accent}12` : undefined,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {mode === "quick" ? <QuickForm /> : <DeepForm templateKey={template} />}
    </div>
  );
}

function ModeChip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-4 py-2 rounded-full text-[12px] font-medium border transition-colors",
        active
          ? "bg-ink text-paper border-ink dark:bg-lime dark:text-forest-800 dark:border-lime"
          : "border-line dark:border-night-border text-ink-muted hover:text-ink dark:hover:text-night-text"
      )}
    >
      {children}
    </button>
  );
}

function useAutosaveDraft(key, initial) {
  const [draft, setDraft] = useState(initial);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setDraft({ ...initial, ...JSON.parse(raw) });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    setStatus("saving");
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(draft));
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 900);
      } catch {
        setStatus("failed");
      }
    }, 350);
    return () => clearTimeout(t);
  }, [draft, key]);

  const clear = () => {
    window.localStorage.removeItem(key);
    setDraft(initial);
  };
  return [draft, setDraft, status, clear];
}

function QuickForm() {
  const initialDraft = {
    moodWord: "",
    currentState: "",
    whatWentWell: "",
    whatFeltHeavy: "",
    lesson: "",
    smallStep: "",
    tags: "",
    linkedGoals: [],
    linkedSkills: [],
    actions: ["", "", ""],
  };
  const [draft, setDraft, status, clear] = useAutosaveDraft(AUTOSAVE_KEY + "::quick", initialDraft);
  const addReflection = useLifeStore((s) => s.addReflection);
  const [saved, setSaved] = useState(false);

  function submit(e) {
    e.preventDefault();
    const actions = draft.actions
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 3)
      .map((text) => ({ id: nanoid(8), text, convertedToCommitmentId: null }));

    addReflection({
      kind: "quick",
      template: null,
      moodWord: draft.moodWord || "",
      currentState: draft.currentState,
      whatWentWell: draft.whatWentWell,
      whatFeltHeavy: draft.whatFeltHeavy,
      lesson: draft.lesson,
      smallStep: draft.smallStep,
      tags: draft.tags.split(",").map((s) => s.trim()).filter(Boolean),
      linkedGoals: draft.linkedGoals,
      linkedSkills: draft.linkedSkills,
      improvementActions: actions,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
    clear();
  }

  return (
    <form onSubmit={submit} className="grid gap-5" data-testid="quick-reflection-form">
      <AutosaveTag status={status} />
      <MoodPicker value={draft.moodWord} onChange={(v) => setDraft({ ...draft, moodWord: v })} />
      <Prompt
        label="Kondisi saat ini"
        placeholder="Bagaimana rasanya di dalam diri hari ini?"
        value={draft.currentState}
        onChange={(v) => setDraft({ ...draft, currentState: v })}
        testid="q-current-state"
      />
      <Prompt
        label="Hal yang berjalan baik"
        placeholder="Sekecil apapun, layak dicatat."
        value={draft.whatWentWell}
        onChange={(v) => setDraft({ ...draft, whatWentWell: v })}
        testid="q-good"
      />
      <Prompt
        label="Hal yang terasa berat"
        placeholder="Jujur pada diri sendiri — tidak akan dibagikan ke mana-mana."
        value={draft.whatFeltHeavy}
        onChange={(v) => setDraft({ ...draft, whatFeltHeavy: v })}
        testid="q-heavy"
      />
      <Prompt
        label="Pelajaran"
        placeholder="Satu pemahaman yang muncul dari minggu ini."
        value={draft.lesson}
        onChange={(v) => setDraft({ ...draft, lesson: v })}
        testid="q-lesson"
      />
      <Prompt
        label="Satu langkah kecil berikutnya"
        placeholder="Yang paling minim tapi paling mungkin dilakukan."
        value={draft.smallStep}
        onChange={(v) => setDraft({ ...draft, smallStep: v })}
        testid="q-small-step"
      />
      <ImprovementActionsField
        value={draft.actions}
        onChange={(v) => setDraft({ ...draft, actions: v })}
      />
      <LinksAndTags
        value={draft}
        onChange={(patch) => setDraft({ ...draft, ...patch })}
      />
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-dark" data-testid="save-reflection-btn">
          <Feather className="h-3.5 w-3.5" /> Simpan refleksi
        </button>
        {saved && <span className="text-[12px] text-forest-500 dark:text-lime">Tersimpan ✓</span>}
      </div>
    </form>
  );
}

function DeepForm({ templateKey }) {
  const template = REFLECTION_TEMPLATES[templateKey];
  const initialDraft = {
    moodWord: "",
    answers: {},
    tags: "",
    linkedGoals: [],
    linkedSkills: [],
    actions: ["", "", ""],
  };
  const [draft, setDraft, status, clear] = useAutosaveDraft(
    AUTOSAVE_KEY + "::deep::" + templateKey,
    initialDraft
  );
  const addReflection = useLifeStore((s) => s.addReflection);
  const [saved, setSaved] = useState(false);

  function submit(e) {
    e.preventDefault();
    const actions = draft.actions
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 3)
      .map((text) => ({ id: nanoid(8), text, convertedToCommitmentId: null }));
    addReflection({
      kind: "deep",
      template: templateKey,
      moodWord: draft.moodWord,
      answers: draft.answers,
      tags: draft.tags.split(",").map((s) => s.trim()).filter(Boolean),
      linkedGoals: draft.linkedGoals,
      linkedSkills: draft.linkedSkills,
      improvementActions: actions,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
    clear();
  }

  return (
    <form onSubmit={submit} className="grid gap-5" data-testid={`deep-reflection-form-${templateKey}`}>
      <div
        className="rounded-2xl p-5"
        style={{ background: `${template.accent}12`, borderLeft: `3px solid ${template.accent}` }}
      >
        <div className="eyebrow" style={{ color: template.accent }}>
          {template.label}
        </div>
        <p className="mt-2 font-reflect italic text-[16px] text-ink-soft leading-relaxed">
          {template.tagline}
        </p>
      </div>
      <AutosaveTag status={status} />
      <MoodPicker value={draft.moodWord} onChange={(v) => setDraft({ ...draft, moodWord: v })} />
      {template.prompts.map((p) => (
        <Prompt
          key={p.key}
          label={p.label}
          value={draft.answers[p.key] || ""}
          onChange={(v) => setDraft({ ...draft, answers: { ...draft.answers, [p.key]: v } })}
          placeholder="Tulis apa adanya."
          testid={`deep-${templateKey}-${p.key}`}
          serif
        />
      ))}
      <ImprovementActionsField
        value={draft.actions}
        onChange={(v) => setDraft({ ...draft, actions: v })}
      />
      <LinksAndTags value={draft} onChange={(patch) => setDraft({ ...draft, ...patch })} />
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-dark" data-testid="save-deep-reflection-btn">
          <Feather className="h-3.5 w-3.5" /> Simpan refleksi
        </button>
        {saved && <span className="text-[12px] text-forest-500 dark:text-lime">Tersimpan ✓</span>}
      </div>
    </form>
  );
}

function Prompt({ label, placeholder, value, onChange, testid, serif }) {
  return (
    <label className="grid gap-1.5">
      <span className="eyebrow">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        data-testid={testid}
        className={clsx(
          "input resize-none min-h-[76px] leading-relaxed",
          serif && "font-reflect italic text-[15px]"
        )}
      />
    </label>
  );
}

function MoodPicker({ value, onChange }) {
  return (
    <div>
      <div className="eyebrow mb-2">Satu kata untuk hari ini</div>
      <div className="flex flex-wrap gap-1.5">
        {REFLECTION_MOOD_WORDS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onChange(value === w ? "" : w)}
            data-testid={`mood-${w}`}
            className={clsx(
              "px-3 py-1.5 rounded-full text-[11.5px] font-medium border transition-colors",
              value === w
                ? "border-forest-500 bg-forest-500/10 text-forest-500 dark:border-lime dark:text-lime"
                : "border-line dark:border-night-border text-ink-muted hover:text-ink dark:hover:text-night-text"
            )}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

function ImprovementActionsField({ value, onChange }) {
  return (
    <div>
      <div className="eyebrow mb-2 flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" /> 1–3 improvement action (opsional)
      </div>
      <div className="space-y-2">
        {value.map((v, i) => (
          <input
            key={i}
            value={v}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={`Aksi kecil #${i + 1} — bisa diubah jadi commitment nanti`}
            data-testid={`action-${i + 1}`}
            className="input"
          />
        ))}
      </div>
    </div>
  );
}

function LinksAndTags({ value, onChange }) {
  const { goals, skills } = useLifeStore();

  function toggle(list, id) {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  return (
    <details className="rounded-xl border border-dashed border-line dark:border-night-border p-4">
      <summary className="cursor-pointer text-[12px] eyebrow flex items-center gap-2">
        Hubungan & tag <ChevronRight className="h-3 w-3" />
      </summary>
      <div className="mt-3 grid gap-3">
        <label className="grid gap-1">
          <span className="eyebrow">Tag (pisah koma)</span>
          <input
            value={value.tags}
            onChange={(e) => onChange({ tags: e.target.value })}
            placeholder="fokus, belajar, tabungan…"
            className="input"
            data-testid="reflection-tags"
          />
        </label>
        <div>
          <div className="eyebrow mb-1.5">Goal yang terkait</div>
          <div className="flex flex-wrap gap-1.5">
            {goals.filter((g) => g.status !== "archived").slice(0, 8).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onChange({ linkedGoals: toggle(value.linkedGoals, g.id) })}
                className={clsx(
                  "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                  value.linkedGoals.includes(g.id)
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
          <div className="eyebrow mb-1.5">Skill yang terkait</div>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 8).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ linkedSkills: toggle(value.linkedSkills, s.id) })}
                className={clsx(
                  "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                  value.linkedSkills.includes(s.id)
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
  );
}

function AutosaveTag({ status }) {
  return (
    <div className="flex items-center gap-1.5 text-[10.5px] text-ink-muted eyebrow -mt-2">
      <Lock className="h-3 w-3" /> Draft privat ·
      {status === "saving" && " menyimpan…"}
      {status === "saved" && " tersimpan"}
      {status === "idle" && " autosave aktif"}
      {status === "failed" && (
        <span className="text-terracotta"> gagal menyimpan draft</span>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Timeline                                                              */
/* --------------------------------------------------------------------- */

function TimelineSection() {
  const {
    reflections, goals, skills, convertActionToCommitment, removeReflection,
  } = useLifeStore();
  const [filter, setFilter] = useState("all"); // all | quick | career | finance | growth | decision | gratitude
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (filter === "all") return reflections;
    if (filter === "quick") return reflections.filter((r) => r.kind === "quick");
    return reflections.filter((r) => r.template === filter);
  }, [reflections, filter]);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-6">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>Semua</FilterPill>
        <FilterPill active={filter === "quick"} onClick={() => setFilter("quick")}>Quick</FilterPill>
        {Object.values(REFLECTION_TEMPLATES).map((t) => (
          <FilterPill key={t.key} active={filter === t.key} onClick={() => setFilter(t.key)}>
            {t.label}
          </FilterPill>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada refleksi tersimpan"
          body="Setiap refleksi kecil layak dicatat. Mulai dengan Quick 2 menit — cukup satu kalimat pun."
        />
      ) : (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          className="grid gap-3"
        >
          {filtered.map((r, i) => {
            const t = r.template ? REFLECTION_TEMPLATES[r.template] : null;
            return (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(r)}
                data-testid={`reflection-${r.id}`}
                className="text-left rounded-2xl border border-line dark:border-night-border p-5 bg-card dark:bg-night-card hover:shadow-pop transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {t && (
                      <span
                        className="chip"
                        style={{ background: `${t.accent}18`, color: t.accent }}
                      >
                        {t.label}
                      </span>
                    )}
                    {r.kind === "quick" && <span className="chip-muted chip">Quick</span>}
                    {r.moodWord && <span className="chip">{r.moodWord}</span>}
                  </div>
                  <span className="font-mono text-[10.5px] text-ink-muted">
                    {formatDateID(r.createdAt.slice(0, 10))}
                  </span>
                </div>
                <p className="mt-3 font-reflect italic text-[15px] leading-relaxed text-ink-soft line-clamp-2">
                  {r.kind === "quick"
                    ? r.currentState || r.lesson || r.smallStep
                    : Object.values(r.answers || {}).find(Boolean) || "Refleksi tanpa isi tampilan."}
                </p>
                {r.improvementActions?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.improvementActions.slice(0, 2).map((a) => (
                      <span
                        key={a.id}
                        className={clsx(
                          "chip",
                          a.convertedToCommitmentId ? "" : "chip-warm"
                        )}
                      >
                        {a.convertedToCommitmentId ? "→ commitment" : "aksi menunggu"}
                      </span>
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.ul>
      )}

      <AnimatePresence>
        {selected && (
          <ReflectionDetail
            reflection={selected}
            goals={goals}
            skills={skills}
            onClose={() => setSelected(null)}
            onRemove={() => { removeReflection(selected.id); setSelected(null); }}
            onConvert={(actionId) => {
              convertActionToCommitment(selected.id, actionId);
              // update selected view
              const updated = useLifeStore.getState().reflections.find((r) => r.id === selected.id);
              if (updated) setSelected(updated);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReflectionDetail({ reflection, goals, skills, onClose, onRemove, onConvert }) {
  const t = reflection.template ? REFLECTION_TEMPLATES[reflection.template] : null;
  const linkedGoals = goals.filter((g) => reflection.linkedGoals?.includes(g.id));
  const linkedSkills = skills.filter((s) => reflection.linkedSkills?.includes(s.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/50 dark:bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: 480 }}
        animate={{ x: 0 }}
        exit={{ x: 480 }}
        transition={{ type: "spring", damping: 24, stiffness: 240 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-paper dark:bg-night border-l border-line dark:border-night-border overflow-y-auto"
        data-testid="reflection-detail-drawer"
      >
        <div className="sticky top-0 flex items-center justify-between p-5 bg-paper/95 dark:bg-night/95 backdrop-blur border-b border-line dark:border-night-border">
          <div className="min-w-0">
            <div className="eyebrow">{formatDateID(reflection.createdAt.slice(0, 10))}</div>
            <div className="h-display text-[22px] mt-1 truncate">
              {t ? `Refleksi ${t.label}` : "Refleksi Quick"}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-line/50" data-testid="close-reflection-detail">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          {reflection.moodWord && (
            <div>
              <div className="eyebrow mb-1">Kata untuk hari itu</div>
              <div className="font-reflect italic text-[22px] text-forest-500 dark:text-lime">
                {reflection.moodWord}
              </div>
            </div>
          )}

          {reflection.kind === "quick" ? (
            <>
              <ReadOnly label="Kondisi saat ini" value={reflection.currentState} />
              <ReadOnly label="Berjalan baik" value={reflection.whatWentWell} />
              <ReadOnly label="Terasa berat" value={reflection.whatFeltHeavy} />
              <ReadOnly label="Pelajaran" value={reflection.lesson} />
              <ReadOnly label="Langkah kecil berikutnya" value={reflection.smallStep} />
            </>
          ) : (
            t?.prompts.map((p) => (
              <ReadOnly key={p.key} label={p.label} value={reflection.answers?.[p.key]} serif />
            ))
          )}

          {reflection.improvementActions?.length > 0 && (
            <div>
              <div className="eyebrow mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Improvement actions
              </div>
              <ul className="space-y-2">
                {reflection.improvementActions.map((a) => (
                  <li
                    key={a.id}
                    className={clsx(
                      "rounded-lg border p-3 flex items-start gap-3",
                      a.convertedToCommitmentId
                        ? "border-forest-500/40 bg-forest-500/5"
                        : "border-line dark:border-night-border bg-card dark:bg-night-card"
                    )}
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta flex-none" />
                    <div className="flex-1 text-[13px]">{a.text}</div>
                    {a.convertedToCommitmentId ? (
                      <span className="chip">Sudah jadi commitment</span>
                    ) : (
                      <button
                        onClick={() => onConvert(a.id)}
                        data-testid={`convert-action-${a.id}`}
                        className="btn-ghost text-[11px]"
                      >
                        Jadikan commitment <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(linkedGoals.length > 0 || linkedSkills.length > 0 || reflection.tags?.length > 0) && (
            <div>
              <div className="eyebrow mb-2">Hubungan</div>
              <div className="flex flex-wrap gap-1.5">
                {reflection.tags?.map((t) => (
                  <span key={t} className="chip-muted chip">#{t}</span>
                ))}
                {linkedGoals.map((g) => (
                  <span key={g.id} className="chip">
                    <BookHeart className="h-3 w-3 inline mr-1" /> {g.title.slice(0, 24)}{g.title.length > 24 ? "…" : ""}
                  </span>
                ))}
                {linkedSkills.map((s) => (
                  <span key={s.id} className="chip" style={{ background: "#a8c84520", color: "#8a9a5b" }}>
                    <Sparkles className="h-3 w-3 inline mr-1" /> {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onRemove}
            className="text-[12px] text-terracotta hover:underline inline-flex items-center gap-1"
            data-testid="remove-reflection-btn"
          >
            <Trash2 className="h-3 w-3" /> Hapus refleksi
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function ReadOnly({ label, value, serif }) {
  if (!value) return null;
  return (
    <div>
      <div className="eyebrow mb-1">{label}</div>
      <p className={clsx(
        "text-[13.5px] text-ink-soft leading-relaxed whitespace-pre-wrap",
        serif && "font-reflect italic text-[15px]"
      )}>
        {value}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Wins & Gratitude                                                      */
/* --------------------------------------------------------------------- */

function WinsSection() {
  const { wins, addWin, removeWin } = useLifeStore();
  const [text, setText] = useState("");
  const [kind, setKind] = useState("win");

  return (
    <div className="grid gap-6">
      <form
        onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; addWin({ kind, text: text.trim() }); setText(""); }}
        className="rounded-2xl border border-line dark:border-night-border p-5 bg-card dark:bg-night-card"
        data-testid="win-form"
      >
        <div className="flex flex-wrap gap-1.5 mb-3">
          <ModeChip active={kind === "win"} onClick={() => setKind("win")}>
            <Award className="h-3 w-3 inline mr-1" /> Small win
          </ModeChip>
          <ModeChip active={kind === "gratitude"} onClick={() => setKind("gratitude")}>
            <Heart className="h-3 w-3 inline mr-1" /> Gratitude
          </ModeChip>
        </div>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={kind === "win" ? "Kemenangan kecil hari ini…" : "Yang aku syukuri hari ini…"}
            className="input flex-1"
            data-testid="win-input"
          />
          <button className="btn-dark" type="submit" data-testid="save-win-btn">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {wins.length === 0 ? (
        <EmptyState
          title="Belum ada catatan hari yang baik"
          body="Tulis satu — sekecil apapun. Kadang yang membuat hari kita baik hanya butuh satu kalimat."
          icon={Heart}
        />
      ) : (
        <ul className="grid gap-2">
          {wins.map((w) => (
            <motion.li
              key={w.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={clsx(
                "rounded-xl border p-4 flex items-start gap-3",
                w.kind === "gratitude"
                  ? "border-terracotta/30 bg-terracotta/5"
                  : "border-lime/50 bg-lime/10 dark:border-forest-500/40 dark:bg-forest-500/10"
              )}
            >
              <span className="mt-1">
                {w.kind === "gratitude" ? (
                  <Heart className="h-4 w-4 text-terracotta" />
                ) : (
                  <Award className="h-4 w-4 text-forest-500 dark:text-lime" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-reflect italic text-[15px] leading-relaxed text-ink-soft">
                  {w.text}
                </p>
                <div className="eyebrow mt-1">{formatDateID(w.createdAt.slice(0, 10))}</div>
              </div>
              <button
                onClick={() => removeWin(w.id)}
                className="p-1.5 rounded-md hover:bg-line/50 text-ink-muted hover:text-terracotta"
                aria-label="Hapus"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Letters to future self                                                */
/* --------------------------------------------------------------------- */

function LettersSection() {
  const { letters, addLetter, openLetter, removeLetter } = useLifeStore();
  const [form, setForm] = useState({
    title: "",
    body: "",
    month: new Date().getMonth() + 4,
    year: new Date().getFullYear(),
  });
  const [saved, setSaved] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!form.body.trim()) return;
    const sealedUntil = new Date(form.year, Math.min(11, Math.max(0, form.month - 1)), 1)
      .toISOString().slice(0, 10);
    addLetter({
      title: form.title.trim() || "Untuk diri yang akan datang",
      body: form.body.trim(),
      sealedUntil,
    });
    setSaved(true);
    setForm({ title: "", body: "", month: new Date().getMonth() + 4, year: new Date().getFullYear() });
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="grid gap-8">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-line dark:border-night-border p-5 md:p-6 bg-card dark:bg-night-card"
        data-testid="letter-form"
      >
        <div className="eyebrow flex items-center gap-1.5">
          <Mail className="h-3 w-3" /> Surat untuk diri sendiri
        </div>
        <p className="mt-1 text-[13px] text-ink-muted max-w-lg">
          Tulis sekali — baca lagi saat tanggal yang kamu pilih tiba. Hanya untukmu.
        </p>
        <div className="mt-4 grid gap-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Judul (opsional)"
            className="input"
            data-testid="letter-title"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Halo Rafli yang akan datang…"
            rows={7}
            className="input resize-none font-reflect italic text-[15px] leading-relaxed"
            data-testid="letter-body"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="eyebrow">Buka pada · Bulan</span>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                className="input"
                data-testid="letter-month"
              >
                {MONTHS_ID_LONG.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="eyebrow">Tahun</span>
              <input
                type="number"
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 20}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className="input"
                data-testid="letter-year"
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-dark" data-testid="save-letter-btn">
              <Send className="h-3.5 w-3.5" /> Segel surat ini
            </button>
            {saved && <span className="text-[12px] text-forest-500 dark:text-lime">Tersegel ✓</span>}
          </div>
        </div>
      </form>

      {letters.length === 0 ? (
        <EmptyState
          title="Belum ada surat yang tersegel"
          body="Tulis kalimat untuk dirimu 3, 6, atau 12 bulan lagi. Beberapa kalimat singkat pun cukup."
          icon={Mail}
        />
      ) : (
        <ul className="grid gap-3">
          {letters.map((l) => {
            const canOpen = new Date(l.sealedUntil) <= new Date();
            return (
              <li
                key={l.id}
                className={clsx(
                  "rounded-2xl border p-5",
                  canOpen
                    ? "border-forest-500/40 bg-forest-500/5"
                    : "border-line dark:border-night-border bg-card dark:bg-night-card"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="eyebrow flex items-center gap-1.5">
                      {canOpen ? <Mail className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {canOpen ? "Siap dibuka" : "Tersegel"}
                    </div>
                    <div className="h-display text-[20px] mt-1">{l.title}</div>
                    <div className="text-[11px] text-ink-muted mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {canOpen
                        ? `Dijadwalkan ${formatDateID(l.sealedUntil)} — sudah tiba.`
                        : `Buka ${formatDateID(l.sealedUntil)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => removeLetter(l.id)}
                    className="p-1.5 rounded-md hover:bg-line/50 text-ink-muted hover:text-terracotta"
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {canOpen && l.opened && (
                  <p className="mt-4 font-reflect italic text-[16px] leading-relaxed text-ink-soft whitespace-pre-wrap">
                    {l.body}
                  </p>
                )}
                {canOpen && !l.opened && (
                  <button
                    onClick={() => openLetter(l.id)}
                    className="btn-dark mt-4"
                    data-testid={`open-letter-${l.id}`}
                  >
                    Buka surat
                  </button>
                )}
                {!canOpen && (
                  <div className="mt-4 rounded-xl border border-dashed border-line dark:border-night-border p-4 text-[12px] text-ink-muted text-center italic">
                    Isinya akan terbuka pada tanggal yang kamu tentukan.
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Shared bits                                                           */
/* --------------------------------------------------------------------- */

function FilterPill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-1.5 rounded-full text-[11.5px] font-medium border transition-colors",
        active
          ? "bg-ink text-paper border-ink dark:bg-lime dark:text-forest-800 dark:border-lime"
          : "border-line dark:border-night-border text-ink-muted hover:text-ink dark:hover:text-night-text"
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, body, icon: Icon = Feather }) {
  return (
    <div className="rounded-2xl border border-dashed border-line dark:border-night-border p-10 text-center bg-card/60 dark:bg-night-card/60">
      <div className="mx-auto h-10 w-10 grid place-items-center rounded-full bg-forest-500/10 mb-3">
        <Icon className="h-4 w-4 text-forest-500 dark:text-lime" />
      </div>
      <div className="h-display text-[22px]">{title}</div>
      <p className="mt-2 text-[13px] text-ink-muted max-w-md mx-auto font-reflect italic">
        {body}
      </p>
    </div>
  );
}
