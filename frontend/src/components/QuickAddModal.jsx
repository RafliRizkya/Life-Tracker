"use client";

import { useState, useEffect } from "react";
import { useLifeStore } from "@/lib/store";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TX_CATEGORIES, LIFE_AREAS, CAREER_TYPES, SKILL_CATEGORIES } from "@/lib/seed";
import { MONTHS_ID_LONG } from "@/lib/format";

const TYPE_OPTIONS = [
  { key: "commitment", label: "Commitment" },
  { key: "goal", label: "Goal" },
  { key: "transaction", label: "Transaksi" },
  { key: "milestone", label: "Career milestone" },
  { key: "skill", label: "Skill" },
  { key: "reminder", label: "Reminder finance" },
];

const empty = {
  title: "",
  amount: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  txType: "expense",
  area: "career",
  priority: "medium",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  status: "planned",
  organization: "",
  location: "",
  ongoing: false,
  endMonth: "",
  endYear: new Date().getFullYear(),
  description: "",
  skills: "",
  evidenceUrl: "",
  contribution: 5,
  target: 5,
  cadence: "monthly",
  dueDay: 1,
  notes: "",
};

export default function QuickAddModal() {
  const open = useLifeStore((s) => s.quickAddOpen);
  const initialType = useLifeStore((s) => s.quickAddType);
  const close = useLifeStore((s) => s.closeQuickAdd);
  const addCommitment = useLifeStore((s) => s.addCommitment);
  const addGoal = useLifeStore((s) => s.addGoal);
  const addTransaction = useLifeStore((s) => s.addTransaction);
  const addCareerMilestone = useLifeStore((s) => s.addCareerMilestone);
  const addSkill = useLifeStore((s) => s.addSkill);
  const addReminder = useLifeStore((s) => s.addReminder);
  const addNotification = useLifeStore((s) => s.addNotification);

  const [type, setType] = useState(initialType);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      setType(initialType || "commitment");
      setForm(empty);
    }
  }, [open, initialType]);

  function up(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const skills = form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

    if (type === "commitment") {
      addCommitment({
        title: form.title,
        area: form.area,
        dueDate: form.date,
        priority: form.priority,
      });
    } else if (type === "goal") {
      addGoal({
        title: form.title,
        area: form.area,
        priority: form.priority,
        why: form.description,
        targetDate: form.date,
      });
    } else if (type === "transaction") {
      addTransaction({
        title: form.title,
        type: form.txType,
        category: form.category || (form.txType === "income" ? "salary" : "daily"),
        amount: Number(form.amount) || 0,
        date: form.date,
        notes: form.notes,
      });
    } else if (type === "milestone") {
      addCareerMilestone({
        title: form.title,
        type: form.category || "project",
        month: Number(form.month),
        year: Number(form.year),
        ongoing: form.ongoing,
        endMonth: form.ongoing || !form.endMonth ? null : Number(form.endMonth),
        endYear: form.ongoing || !form.endMonth ? null : Number(form.endYear),
        organization: form.organization,
        location: form.location,
        description: form.description,
        skills,
        evidenceUrl: form.evidenceUrl,
        status: form.status,
        contribution: Number(form.contribution) || 5,
      });
    } else if (type === "skill") {
      addSkill({
        name: form.title,
        category: form.category || "technical",
        level: 1,
        target: Number(form.target) || 5,
        relatedToRole: form.area === "career",
      });
    } else if (type === "reminder") {
      addReminder({
        title: form.title,
        amount: form.amount ? Number(form.amount) : null,
        category: form.category || "saving",
        cadence: form.cadence,
        dueDay: Number(form.dueDay) || 1,
        notes: form.notes,
      });
    }

    addNotification({
      title: "Tersimpan ✓",
      body: `"${form.title}" baru ditambahkan ke ${TYPE_OPTIONS.find((t) => t.key === type)?.label}.`,
      tone: "success",
    });
    close();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/50 dark:bg-black/70 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] surface p-6 md:p-7 shadow-pop"
            data-testid="quick-add-modal"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="eyebrow">Quick add</div>
                <h2 className="h-display text-[26px] mt-1">Tambah sesuatu ke hidupmu</h2>
              </div>
              <button
                onClick={close}
                className="p-1.5 -mr-2 rounded-md hover:bg-line/50"
                aria-label="Close"
                data-testid="quick-add-close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* type tabs */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  data-testid={`type-${t.key}`}
                  className={
                    "px-3 py-1.5 rounded-full text-[11.5px] font-medium border transition-colors " +
                    (type === t.key
                      ? "bg-ink text-paper border-ink dark:bg-lime dark:text-forest-800 dark:border-lime"
                      : "border-line dark:border-night-border text-ink-muted hover:text-ink dark:hover:text-night-text")
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-5 grid gap-3" data-testid="quick-add-form">
              <Field label="Judul / deskripsi">
                <input
                  required
                  autoFocus
                  value={form.title}
                  onChange={(e) => up("title", e.target.value)}
                  placeholder={placeholderFor(type)}
                  className="input"
                  data-testid="form-title"
                />
              </Field>

              {type === "commitment" && (
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Area">
                    <select value={form.area} onChange={(e) => up("area", e.target.value)} className="input">
                      {LIFE_AREAS.map((a) => (
                        <option key={a.key} value={a.key}>{a.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tanggal">
                    <input type="date" value={form.date} onChange={(e) => up("date", e.target.value)} className="input" />
                  </Field>
                  <Field label="Prioritas">
                    <select value={form.priority} onChange={(e) => up("priority", e.target.value)} className="input">
                      <option value="low">Rendah</option>
                      <option value="medium">Sedang</option>
                      <option value="high">Tinggi</option>
                    </select>
                  </Field>
                </div>
              )}

              {type === "goal" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Life area">
                      <select value={form.area} onChange={(e) => up("area", e.target.value)} className="input">
                        {LIFE_AREAS.map((a) => (
                          <option key={a.key} value={a.key}>{a.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Target date">
                      <input type="date" value={form.date} onChange={(e) => up("date", e.target.value)} className="input" />
                    </Field>
                  </div>
                  <Field label="Kenapa penting?">
                    <textarea value={form.description} onChange={(e) => up("description", e.target.value)} className="input h-20 resize-none" placeholder="Alasan yang jujur bikin goal ini bertahan." />
                  </Field>
                </>
              )}

              {type === "transaction" && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Tipe">
                      <select value={form.txType} onChange={(e) => up("txType", e.target.value)} className="input" data-testid="tx-type">
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                      </select>
                    </Field>
                    <Field label="Kategori">
                      <select value={form.category} onChange={(e) => up("category", e.target.value)} className="input" data-testid="tx-category">
                        <option value="">Auto</option>
                        {TX_CATEGORIES[form.txType].map((c) => (
                          <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Tanggal">
                      <input type="date" value={form.date} onChange={(e) => up("date", e.target.value)} className="input" />
                    </Field>
                  </div>
                  <Field label="Jumlah (IDR)">
                    <input type="number" min="0" value={form.amount} onChange={(e) => up("amount", e.target.value)} className="input" placeholder="0" data-testid="tx-amount" />
                  </Field>
                  <Field label="Catatan (opsional)">
                    <input value={form.notes} onChange={(e) => up("notes", e.target.value)} className="input" placeholder="Konteks singkat." />
                  </Field>
                </>
              )}

              {type === "milestone" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Tipe">
                      <select value={form.category} onChange={(e) => up("category", e.target.value)} className="input">
                        {CAREER_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Status">
                      <select value={form.status} onChange={(e) => up("status", e.target.value)} className="input">
                        <option value="planned">Planned</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Bulan">
                      <select value={form.month} onChange={(e) => up("month", e.target.value)} className="input">
                        {MONTHS_ID_LONG.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                      </select>
                    </Field>
                    <Field label="Tahun">
                      <input type="number" min="2000" max="2100" value={form.year} onChange={(e) => up("year", e.target.value)} className="input" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Organisasi / penerbit">
                      <input value={form.organization} onChange={(e) => up("organization", e.target.value)} className="input" placeholder="Google, Universitas, Perusahaan…" />
                    </Field>
                    <Field label="Lokasi (opsional)">
                      <input value={form.location} onChange={(e) => up("location", e.target.value)} className="input" placeholder="Bandung, Jakarta…" />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-[12.5px] text-ink-soft">
                    <input type="checkbox" checked={form.ongoing} onChange={(e) => up("ongoing", e.target.checked)} />
                    Masih berlangsung (Sekarang)
                  </label>
                  {!form.ongoing && (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Bulan selesai (opsional)">
                        <select value={form.endMonth} onChange={(e) => up("endMonth", e.target.value)} className="input">
                          <option value="">—</option>
                          {MONTHS_ID_LONG.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                        </select>
                      </Field>
                      <Field label="Tahun selesai (opsional)">
                        <input type="number" min="2000" max="2100" value={form.endYear} onChange={(e) => up("endYear", e.target.value)} className="input" />
                      </Field>
                    </div>
                  )}
                  <Field label="Deskripsi">
                    <textarea value={form.description} onChange={(e) => up("description", e.target.value)} className="input h-20 resize-none" />
                  </Field>
                  <Field label="Skill terkait (pisahkan dengan koma)">
                    <input value={form.skills} onChange={(e) => up("skills", e.target.value)} className="input" placeholder="SQL, Tableau, Storytelling" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Evidence URL (opsional)">
                      <input type="url" value={form.evidenceUrl} onChange={(e) => up("evidenceUrl", e.target.value)} className="input" placeholder="https://..." />
                    </Field>
                    <Field label="Kontribusi ke career goal (%)">
                      <input type="number" min="0" max="30" value={form.contribution} onChange={(e) => up("contribution", e.target.value)} className="input" />
                    </Field>
                  </div>
                </>
              )}

              {type === "skill" && (
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Kategori">
                    <select value={form.category} onChange={(e) => up("category", e.target.value)} className="input">
                      {SKILL_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Target level (1-5)">
                    <input type="number" min="1" max="5" value={form.target} onChange={(e) => up("target", e.target.value)} className="input" />
                  </Field>
                  <Field label="Terhubung ke role?">
                    <select value={form.area} onChange={(e) => up("area", e.target.value)} className="input">
                      <option value="career">Ya, untuk Data Analyst</option>
                      <option value="growth">Tidak, general</option>
                    </select>
                  </Field>
                </div>
              )}

              {type === "reminder" && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Kategori">
                      <select value={form.category} onChange={(e) => up("category", e.target.value)} className="input">
                        {TX_CATEGORIES.expense.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Nominal">
                      <input type="number" min="0" value={form.amount} onChange={(e) => up("amount", e.target.value)} className="input" placeholder="0" />
                    </Field>
                    <Field label="Cadence">
                      <select value={form.cadence} onChange={(e) => up("cadence", e.target.value)} className="input">
                        <option value="monthly">Bulanan</option>
                        <option value="quarterly">Per 3 bulan</option>
                        <option value="yearly">Tahunan</option>
                        <option value="once">Sekali</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Tanggal jatuh tempo (hari)">
                    <input type="number" min="1" max="31" value={form.dueDay} onChange={(e) => up("dueDay", e.target.value)} className="input" />
                  </Field>
                  <Field label="Catatan (opsional)">
                    <input value={form.notes} onChange={(e) => up("notes", e.target.value)} className="input" />
                  </Field>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={close} className="text-[12px] text-ink-muted hover:text-ink px-2 py-2">Batal</button>
                <button type="submit" data-testid="quick-add-submit" className="btn-dark">Simpan</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

function placeholderFor(type) {
  switch (type) {
    case "goal": return "Contoh: Selesaikan portfolio project #3";
    case "transaction": return "Contoh: Gaji, Kopi, Transfer tabungan…";
    case "milestone": return "Contoh: Google Data Analytics Certificate";
    case "skill": return "Contoh: SQL Advanced";
    case "reminder": return "Contoh: BPJS Kesehatan";
    default: return "Contoh: Kirim satu pesan networking hari ini";
  }
}
