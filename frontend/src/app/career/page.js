"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import { Card, Progress, EmptyState } from "@/components/ui";
import { CAREER_TYPES } from "@/lib/seed";
import { careerReadiness } from "@/lib/insights";
import { formatMonthYear, formatMonthRange, formatDuration } from "@/lib/format";
import {
  Plus, ExternalLink, X, Sparkles, FolderKanban,
} from "lucide-react";
import clsx from "clsx";
import CareerTrail from "@/components/career/CareerTrail";
import { STATUS_META } from "@/components/career/constants";

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

  const currentRole = useMemo(() => {
    const ongoing = careerMilestones.filter((m) => m.type === "experience" && m.ongoing);
    return ongoing.sort((a, b) => b.year * 12 + b.month - (a.year * 12 + a.month))[0] || null;
  }, [careerMilestones]);

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
          <div className="h-display text-[22px] mt-1">{currentRole?.title || "Business Data Analyst"}</div>
          <div className="text-[11.5px] text-ink-muted mt-1">
            {currentRole ? `${currentRole.organization} · sejak ${formatMonthYear(currentRole.month, currentRole.year)}` : "Peran saat ini"}
          </div>
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
        <span className="text-line dark:text-night-border">|</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-1 rounded-sm bg-ink-muted" /> Blok solid = pengalaman kerja
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-muted" style={{ boxShadow: "0 0 0 3px rgba(0,0,0,0.08)" }} /> Badge = milestone
        </span>
      </div>

      {/* Trail (gamified) */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Belum ada cerita di sini."
          body="Setiap milestone — sekecil apapun — layak dicatat. Mulai dari satu."
          action={
            <button className="btn-dark" onClick={() => openQuickAdd("milestone")}>
              <Plus className="h-3.5 w-3.5" /> Tambah milestone pertama
            </button>
          }
        />
      ) : (
        <CareerTrail milestones={filtered} onSelect={setSelected} selectedId={selected?.id} />
      )}

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
        {portfolio.length === 0 && (
          <EmptyState
            icon={FolderKanban}
            title="Belum ada project di sini."
            body="Portfolio nggak harus sempurna untuk dimulai — satu project kecil sudah bukti kerja."
          />
        )}
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
                  {gap === 0 ? "Target tercapai — solid." : `${gap} level lagi untuk target role.`}
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
            <div className="eyebrow">
              {formatMonthRange(milestone.month, milestone.year, milestone.endMonth, milestone.endYear, milestone.ongoing)}
            </div>
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

          <label className="flex items-center gap-2 text-[12.5px] text-ink-soft">
            <input
              type="checkbox"
              checked={!!milestone.ongoing}
              onChange={(e) => onUpdate({ ongoing: e.target.checked })}
              data-testid="milestone-ongoing"
            />
            Masih berlangsung (tampil sebagai &ldquo;Sekarang&rdquo;)
          </label>

          {!milestone.ongoing && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bulan selesai (opsional)">
                <select
                  className="input"
                  value={milestone.endMonth ?? ""}
                  onChange={(e) => onUpdate({ endMonth: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">—</option>
                  {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tahun selesai (opsional)">
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  className="input"
                  value={milestone.endYear ?? ""}
                  onChange={(e) => onUpdate({ endYear: e.target.value ? Number(e.target.value) : null })}
                />
              </Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Organisasi / penerbit">
              <input
                className="input"
                value={milestone.organization || ""}
                onChange={(e) => onUpdate({ organization: e.target.value })}
                data-testid="milestone-organization"
              />
            </Field>
            <Field label="Lokasi (opsional)">
              <input
                className="input"
                value={milestone.location || ""}
                onChange={(e) => onUpdate({ location: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Deskripsi singkat (tampil di kartu)">
            <textarea
              className="input h-16 resize-none"
              value={milestone.description || ""}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
          </Field>
          <Field label="Detail / pencapaian (satu baris = satu poin)">
            <textarea
              className="input h-28 resize-none"
              value={(milestone.highlights || []).join("\n")}
              onChange={(e) => onUpdate({ highlights: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
              data-testid="milestone-highlights"
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
