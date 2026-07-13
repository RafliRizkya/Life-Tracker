"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import { Card, Progress } from "@/components/ui";
import { SKILL_CATEGORIES } from "@/lib/seed";
import { skillMomentum } from "@/lib/insights";
import { formatDateID } from "@/lib/format";
import { Plus, Zap, Trash2, ExternalLink, Sparkles, ArrowUpRight, Minus } from "lucide-react";
import clsx from "clsx";

export default function SkillsPage() {
  const {
    skills, openQuickAdd, updateSkill, removeSkill, practiceSkill,
  } = useLifeStore();
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState(null);

  const filtered = selectedCat === "all" ? skills : skills.filter((s) => s.category === selectedCat);
  const momentum = skillMomentum(skills);

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-24">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="eyebrow">Learn deliberately</div>
          <h1 className="h-display text-[44px] md:text-[54px] mt-2">Skill <em>garden.</em></h1>
        </div>
        <button className="btn-dark" onClick={() => openQuickAdd("skill")} data-testid="add-skill-btn">
          <Plus className="h-3.5 w-3.5" /> Add skill
        </button>
      </div>

      {/* Hero */}
      <div className="rounded-2xl border border-line dark:border-night-border bg-forest-500/[0.06] dark:bg-night-card p-6 md:p-8 mb-8 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 items-center">
        <div>
          <div className="eyebrow">Career readiness · skill layer</div>
          <div className="h-display text-[36px] mt-2">
            <span className="text-forest-500 dark:text-lime">{momentum.roleAvg.toFixed(1)}</span>
            <span className="text-ink-muted text-[20px] ml-1">/ 5</span>
          </div>
          <p className="text-[13px] text-ink-muted mt-2 max-w-md">
            Level rata-rata skill yang berhubungan langsung dengan target Data Analyst.
            Naikkan skill di sini akan langsung memperbarui Career Readiness.
          </p>
        </div>
        <div className="space-y-2">
          {momentum.stagnant.map((s) => (
            <div key={s.id} className="rounded-xl border border-line dark:border-night-border p-3 bg-card dark:bg-night">
              <div className="flex items-center justify-between">
                <div className="text-[12.5px] font-medium">{s.name}</div>
                <div className="text-[10.5px] text-ink-muted font-mono">
                  {s.days === 999 ? "belum pernah" : `${s.days}h yang lalu`}
                </div>
              </div>
              <div className="mt-1 text-[10.5px] text-ink-muted">Perlu 30 menit sesi hari ini.</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <FilterPill active={selectedCat === "all"} onClick={() => setSelectedCat("all")}>Semua</FilterPill>
        {SKILL_CATEGORIES.map((c) => (
          <FilterPill key={c.key} active={selectedCat === c.key} onClick={() => setSelectedCat(c.key)}>{c.label}</FilterPill>
        ))}
      </div>

      {/* Skill constellation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filtered.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            onClick={() => setSelectedSkill(s)}
            data-testid={`skill-${s.id}`}
            className="text-left card hover:shadow-pop transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow">{SKILL_CATEGORIES.find(c => c.key === s.category)?.label || s.category}</span>
              {s.relatedToRole && <span className="chip">Data Analyst</span>}
            </div>
            <div className="h-display text-[19px] mt-3">{s.name}</div>
            <div className="mt-4 flex items-center gap-1">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={clsx(
                  "h-2.5 w-2.5 rounded-full",
                  n <= s.level ? "bg-forest-500 dark:bg-lime" : "bg-line dark:bg-night-border"
                )} />
              ))}
              <span className="text-[10.5px] text-ink-muted font-mono ml-2">Lv {s.level} / {s.target}</span>
            </div>
            <div className="mt-3 text-[11px] text-ink-muted">
              {s.lastPracticedAt ? `Terakhir latihan · ${formatDateID(s.lastPracticedAt)}` : "Belum ada practice log."}
            </div>
            <div className="mt-4 flex gap-2">
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); practiceSkill(s.id); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); practiceSkill(s.id); } }}
                data-testid={`practice-skill-${s.id}`}
                className="btn-ghost text-[11px] cursor-pointer"
              >
                <Zap className="h-3 w-3" /> Catat sesi
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); if (s.level < 5) updateSkill(s.id, { level: s.level + 1 }); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); if (s.level < 5) updateSkill(s.id, { level: s.level + 1 }); } }}
                className="btn-ghost text-[11px] cursor-pointer"
              >
                <ArrowUpRight className="h-3 w-3" /> Naik level
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Recommended */}
      <section className="mt-14 rounded-2xl bg-lime/50 dark:bg-forest-800 p-6 md:p-8">
        <div className="eyebrow"><Sparkles className="h-3 w-3 inline mr-1" /> Rekomendasi berikutnya</div>
        <h2 className="h-display text-[26px] mt-2 leading-tight max-w-xl">
          Perdalam <em>SQL joins</em>, lalu jadikan portfolio evidence.
        </h2>
        <p className="text-[13px] text-ink-soft dark:text-lime/90 mt-3 max-w-lg">
          Satu proyek fokus akan menaikkan Career Readiness dan menambah bukti untuk goal Data Analyst secara bersamaan.
        </p>
        <button
          onClick={() => openQuickAdd("commitment")}
          className="btn-dark mt-5 !bg-forest-700"
          data-testid="add-sql-practice"
        >
          Tambah komitmen SQL 30 menit hari ini
        </button>
      </section>

      {selectedSkill && (
        <SkillDetail
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onUpdate={(patch) => { updateSkill(selectedSkill.id, patch); setSelectedSkill({ ...selectedSkill, ...patch }); }}
          onRemove={() => { removeSkill(selectedSkill.id); setSelectedSkill(null); }}
        />
      )}
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

function SkillDetail({ skill, onClose, onUpdate, onRemove }) {
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
        className="fixed top-0 right-0 h-full w-full max-w-md bg-paper dark:bg-night border-l border-line dark:border-night-border overflow-y-auto"
      >
        <div className="sticky top-0 flex items-center justify-between p-5 bg-paper/95 dark:bg-night/95 backdrop-blur border-b border-line dark:border-night-border">
          <div>
            <div className="eyebrow">{SKILL_CATEGORIES.find(c => c.key === skill.category)?.label}</div>
            <div className="h-display text-[22px] mt-1">{skill.name}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-line/50">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="eyebrow mb-2">Level</div>
            <div className="flex items-center gap-2">
              <button onClick={() => onUpdate({ level: Math.max(1, skill.level - 1) })} className="btn-ghost"><Minus className="h-3.5 w-3.5" /></button>
              <div className="flex gap-1 flex-1 justify-center">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={clsx("h-3 w-3 rounded-full", n <= skill.level ? "bg-forest-500 dark:bg-lime" : "bg-line")} />
                ))}
              </div>
              <button onClick={() => onUpdate({ level: Math.min(5, skill.level + 1) })} className="btn-ghost"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <label className="grid gap-1">
            <span className="eyebrow">Target level</span>
            <input type="number" min="1" max="5" value={skill.target} onChange={(e) => onUpdate({ target: Number(e.target.value) })} className="input" />
          </label>
          <label className="grid gap-1">
            <span className="eyebrow">Learning plan</span>
            <textarea value={skill.plan || ""} onChange={(e) => onUpdate({ plan: e.target.value })} className="input h-24 resize-none" />
          </label>
          <label className="grid gap-1">
            <span className="eyebrow">Resource URL</span>
            <input type="url" value={skill.resourceUrl || ""} onChange={(e) => onUpdate({ resourceUrl: e.target.value })} className="input" placeholder="https://..." />
          </label>
          <label className="flex items-center gap-2 text-[12.5px]">
            <input type="checkbox" checked={!!skill.relatedToRole} onChange={(e) => onUpdate({ relatedToRole: e.target.checked })} />
            <span>Skill ini terhubung ke target Data Analyst</span>
          </label>
          <button onClick={onRemove} className="text-[12px] text-terracotta hover:underline inline-flex items-center gap-1" data-testid="remove-skill-btn">
            <Trash2 className="h-3 w-3" /> Hapus skill
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}
