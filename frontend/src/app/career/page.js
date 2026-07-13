"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import { Card, Progress } from "@/components/ui";
import { CAREER_TYPES } from "@/lib/seed";
import { careerReadiness } from "@/lib/insights";
import { formatMonthYear } from "@/lib/format";
import {
  Plus, ExternalLink, X, GraduationCap, Award, Briefcase, FolderKanban,
  Sparkles, Target, ChevronRight,
} from "lucide-react";
import clsx from "clsx";

const TYPE_ICON = {
  education: GraduationCap,
  certificate: Award,
  experience: Briefcase,
  project: FolderKanban,
  skill: Sparkles,
  target: Target,
};

const STATUS_META = {
  completed: { label: "Completed", color: "#315d48" },
  in_progress: { label: "In progress", color: "#eb9b63" },
  planned: { label: "Planned", color: "#8a9a5b" },
};

export default function CareerPage() {
  const {
    careerMilestones, skills, goals, portfolio,
    openQuickAdd, updateCareerMilestone, removeCareerMilestone,
    addPortfolioProject,
  } = useLifeStore();

  const [typeFilter, setTypeFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("all"); // all | past | current-year | future
  const [selected, setSelected] = useState(null);

  const readiness = careerReadiness(goals, skills, portfolio, careerMilestones);

  const filtered = useMemo(() => {
    const now = new Date();
    return careerMilestones
      .filter((m) => (typeFilter === "all" ? true : m.type === typeFilter))
      .filter((m) => {
        if (rangeFilter === "all") return true;
        if (rangeFilter === "past") return m.year < now.getFullYear();
        if (rangeFilter === "current-year") return m.year === now.getFullYear();
        if (rangeFilter === "future") return m.year > now.getFullYear();
        return true;
      });
  }, [careerMilestones, typeFilter, rangeFilter]);

  const shipped = portfolio.filter((p) => p.status === "shipped").length;

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-24">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="eyebrow">Your story in motion</div>
          <h1 className="h-display text-[44px] md:text-[54px] mt-2">
            Career <em>journey.</em>
          </h1>
          <p className="text-[13.5px] text-ink-muted mt-3 max-w-lg">
            Jalur hidup yang bertumbuh dari pengalaman yang kamu punya menuju peran yang kamu tuju.
          </p>
        </div>
        <button className="btn-dark" onClick={() => openQuickAdd("milestone")} data-testid="add-milestone-btn">
          <Plus className="h-3.5 w-3.5" /> Add milestone
        </button>
      </div>

      {/* overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="eyebrow">Current trajectory</div>
          <div className="h-display text-[22px] mt-1">Data Analyst</div>
          <div className="text-[11.5px] text-ink-muted mt-1">Target role · Dec 2026</div>
        </Card>
        <Card>
          <div className="eyebrow">Next proof</div>
          <div className="h-display text-[22px] mt-1">Portfolio #{shipped + 1}</div>
          <div className="text-[11.5px] text-ink-muted mt-1">Case study SQL + data storytelling</div>
        </Card>
        <Card>
          <div className="eyebrow">Career readiness</div>
          <div className="h-display text-[26px] mt-1 text-forest-500 dark:text-lime">{readiness.overall}<span className="text-[15px] text-ink-muted">/100</span></div>
          <Progress value={readiness.overall} className="mt-2" />
        </Card>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="eyebrow mr-2">Type</span>
        <FilterPill active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>All</FilterPill>
        {CAREER_TYPES.map((t) => (
          <FilterPill key={t.key} active={typeFilter === t.key} onClick={() => setTypeFilter(t.key)}>
            {t.label}
          </FilterPill>
        ))}
        <span className="eyebrow ml-4 mr-2">Range</span>
        <FilterPill active={rangeFilter === "all"} onClick={() => setRangeFilter("all")}>Semua</FilterPill>
        <FilterPill active={rangeFilter === "past"} onClick={() => setRangeFilter("past")}>Masa lalu</FilterPill>
        <FilterPill active={rangeFilter === "current-year"} onClick={() => setRangeFilter("current-year")}>Tahun ini</FilterPill>
        <FilterPill active={rangeFilter === "future"} onClick={() => setRangeFilter("future")}>Masa depan</FilterPill>
      </div>

      {/* legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-ink-muted mb-6">
        <Legend color="#315d48" label="Completed" />
        <Legend color="#eb9b63" label="In progress" glow />
        <Legend color="#8a9a5b" label="Planned" outline />
      </div>

      {/* Timeline (immersive) */}
      <div className="relative">
        {/* growing line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "top" }}
          className={clsx(
            "absolute left-[26px] md:left-[130px] top-2 bottom-0 w-[2px]",
            "bg-gradient-to-b from-forest-400/80 via-forest-400/40 to-transparent",
            "dark:from-lime/70 dark:via-lime/40 dark:to-transparent"
          )}
        />
        <ul className="space-y-6 md:space-y-8">
          {filtered.map((m, i) => {
            const meta = STATUS_META[m.status] || STATUS_META.planned;
            const Icon = TYPE_ICON[m.type] || Sparkles;
            return (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08, duration: 0.55 }}
                className="relative pl-[64px] md:pl-[172px]"
              >
                {/* year (desktop) */}
                <div className="hidden md:block absolute left-0 top-1.5 font-mono text-[11px] text-ink-muted w-[110px] text-right">
                  {formatMonthYear(m.month, m.year)}
                </div>
                {/* node */}
                <div
                  className={clsx(
                    "absolute left-[19px] md:left-[123px] top-1.5 w-4 h-4 rounded-full grid place-items-center border-2 transition-all",
                    m.status === "completed" && "bg-forest-500 border-forest-500",
                    m.status === "in_progress" && "bg-terracotta border-terracotta ring-4 ring-terracotta/25",
                    m.status === "planned" && "bg-paper border-sage dark:bg-night dark:border-forest-500/50"
                  )}
                />
                <button
                  onClick={() => setSelected(m)}
                  data-testid={`milestone-${m.id}`}
                  className="w-full text-left card hover:shadow-pop transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="md:hidden font-mono text-[10.5px] text-ink-muted mb-1">
                        {formatMonthYear(m.month, m.year)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="chip" style={{ background: `${meta.color}18`, color: meta.color }}>
                          <Icon className="h-3 w-3" /> {(CAREER_TYPES.find(t=>t.key===m.type)?.label) || m.type}
                        </span>
                        <span className="chip-muted chip">{meta.label}</span>
                      </div>
                      <h3 className="h-display text-[20px] mt-2 leading-tight">{m.title}</h3>
                      {m.organization && (
                        <div className="text-[12px] text-ink-muted mt-1">{m.organization}</div>
                      )}
                      {m.description && (
                        <p className="text-[12.5px] text-ink-soft mt-2 leading-relaxed line-clamp-2">
                          {m.description}
                        </p>
                      )}
                      {m.skills && m.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {m.skills.slice(0, 5).map((s) => (
                            <span key={s} className="chip">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-muted mt-1 flex-none" />
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Portfolio */}
      <section className="mt-20">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="eyebrow">Portfolio tracker</div>
            <h2 className="h-display text-[26px] mt-1">Bukti kerja</h2>
          </div>
          <button
            onClick={() => {
              const title = window.prompt("Nama project?");
              if (title) addPortfolioProject({ title });
            }}
            className="btn-ghost"
            data-testid="add-portfolio-btn"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah project
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <span className={clsx("chip", p.status === "shipped" ? "" : "chip-warm")}>
                  {p.status === "shipped" ? "Shipped" : "In progress"}
                </span>
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" className="btn-ghost">
                    Buka <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="h-display text-[20px] mt-3">{p.title}</div>
              {p.tools?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.tools.map((t) => <span key={t} className="chip">{t}</span>)}
                </div>
              )}
              {p.impact && <p className="text-[12.5px] text-ink-muted mt-3">{p.impact}</p>}
              {p.caseStudy && <p className="text-[12.5px] text-ink-soft mt-2 italic">&ldquo;{p.caseStudy}&rdquo;</p>}
            </Card>
          ))}
        </div>
      </section>

      {/* Skills gap */}
      <section className="mt-20">
        <div className="eyebrow">Skills gap terhadap Data Analyst</div>
        <h2 className="h-display text-[26px] mt-1 mb-4">Yang perlu didekatkan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skills.filter(s => s.relatedToRole).map((s) => {
            const gap = Math.max(0, s.target - s.level);
            return (
              <div key={s.id} className="rounded-xl border border-line dark:border-night-border p-4 bg-card dark:bg-night-card">
                <div className="flex items-center justify-between">
                  <div className="text-[13.5px] font-medium">{s.name}</div>
                  <div className="font-mono text-[11px] text-ink-muted">Lv {s.level}/{s.target}</div>
                </div>
                <Progress value={(s.level / s.target) * 100} className="mt-2" />
                <div className="mt-2 text-[11.5px] text-ink-muted">
                  {gap === 0 ? "Sudah pada target." : `${gap} level lagi untuk target role.`}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {selected && (
          <MilestoneDetail
            milestone={selected}
            onClose={() => setSelected(null)}
            onUpdate={(patch) => { updateCareerMilestone(selected.id, patch); setSelected({ ...selected, ...patch }); }}
            onRemove={() => { removeCareerMilestone(selected.id); setSelected(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

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

function Legend({ color, label, glow, outline }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: outline ? "transparent" : color,
          border: `2px solid ${color}`,
          boxShadow: glow ? `0 0 0 4px ${color}33` : undefined,
        }}
      />
      {label}
    </span>
  );
}

function MilestoneDetail({ milestone, onClose, onUpdate, onRemove }) {
  const meta = STATUS_META[milestone.status] || STATUS_META.planned;
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
        data-testid="milestone-detail-drawer"
      >
        <div className="sticky top-0 flex items-center justify-between p-5 bg-paper/95 dark:bg-night/95 backdrop-blur border-b border-line dark:border-night-border">
          <div className="min-w-0">
            <div className="eyebrow">{formatMonthYear(milestone.month, milestone.year)}</div>
            <div className="h-display text-[22px] mt-1 truncate">{milestone.title}</div>
          </div>
          <button onClick={onClose} className="p-1.5 -mr-1 rounded-md hover:bg-line/50" data-testid="close-milestone-detail">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex flex-wrap gap-1.5">
            <span className="chip" style={{ background: `${meta.color}18`, color: meta.color }}>{meta.label}</span>
            <span className="chip">{(CAREER_TYPES.find(t=>t.key===milestone.type)?.label) || milestone.type}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bulan">
              <select
                className="input"
                value={milestone.month}
                onChange={(e) => onUpdate({ month: Number(e.target.value) })}
                data-testid="milestone-month"
              >
                {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Tahun">
              <input
                type="number"
                min="2000"
                max="2100"
                className="input"
                value={milestone.year}
                onChange={(e) => onUpdate({ year: Number(e.target.value) })}
                data-testid="milestone-year"
              />
            </Field>
          </div>
          {(
            <Field label="Organisasi / penerbit">
              <input
                className="input"
                value={milestone.organization || ""}
                onChange={(e) => onUpdate({ organization: e.target.value })}
                data-testid="milestone-organization"
              />
            </Field>
          )}
          <Field label="Deskripsi">
            <textarea
              className="input h-24 resize-none"
              value={milestone.description || ""}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
          </Field>
          <Field label="Skill terkait (koma)">
            <input
              className="input"
              value={(milestone.skills || []).join(", ")}
              onChange={(e) => onUpdate({ skills: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })}
            />
          </Field>
          <Field label="Evidence URL">
            <input
              type="url"
              className="input"
              value={milestone.evidenceUrl || ""}
              onChange={(e) => onUpdate({ evidenceUrl: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select className="input" value={milestone.status} onChange={(e) => onUpdate({ status: e.target.value })}>
                <option value="planned">Planned</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
            <Field label="Kontribusi ke career goal (%)">
              <input
                type="number"
                className="input"
                min="0" max="30"
                value={milestone.contribution || 0}
                onChange={(e) => onUpdate({ contribution: Number(e.target.value) })}
              />
            </Field>
          </div>
          <button
            onClick={onRemove}
            className="text-[12px] text-terracotta hover:underline"
            data-testid="remove-milestone-btn"
          >
            Hapus milestone
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function Field({ label, children }) {
  return <label className="grid gap-1"><span className="eyebrow">{label}</span>{children}</label>;
}
