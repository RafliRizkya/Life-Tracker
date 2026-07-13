"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import { monthlyTotals } from "@/lib/insights";
import { formatIDR, formatIDRShort, formatDateID } from "@/lib/format";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";

function currentWeekLabel() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `Minggu ${week} · ${now.getFullYear()}`;
}

export default function ReviewPage() {
  const { reviews, transactions, commitments, activity, skills, addReview } = useLifeStore();
  const totals = monthlyTotals(transactions);
  const doneThisWeek = commitments.filter((c) => c.done).length;
  const activeThisWeek = commitments.filter((c) => !c.done).length;

  const [form, setForm] = useState({
    highlights: "",
    blockers: "",
    finance: "",
    careerProgress: "",
    focus1: "",
    focus2: "",
    focus3: "",
  });
  const [saved, setSaved] = useState(false);

  const summaryLines = [
    `${doneThisWeek} commitment selesai minggu ini · ${activeThisWeek} masih aktif.`,
    `Bulan berjalan: income ${formatIDRShort(totals.income)}, expense ${formatIDRShort(totals.expense)}, net ${formatIDRShort(totals.net)}.`,
    (() => {
      const stale = skills
        .filter((s) => s.lastPracticedAt)
        .map((s) => ({ name: s.name, days: Math.floor((Date.now() - new Date(s.lastPracticedAt).getTime()) / 86400000) }))
        .sort((a, b) => b.days - a.days)[0];
      return stale ? `${stale.name} paling lama tidak dilatih (${stale.days} hari).` : "Semua skill dilatih baru-baru ini.";
    })(),
  ];

  function submit(e) {
    e.preventDefault();
    const focus = [form.focus1, form.focus2, form.focus3].filter(Boolean);
    addReview({
      weekOf: new Date().toISOString().slice(0, 10),
      highlights: form.highlights,
      blockers: form.blockers,
      finance: form.finance,
      careerProgress: form.careerProgress,
      nextWeekFocus: focus,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setForm({ highlights: "", blockers: "", finance: "", careerProgress: "", focus1: "", focus2: "", focus3: "" });
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-10 pb-24">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="eyebrow">{currentWeekLabel()}</div>
        <h1 className="h-display text-[44px] md:text-[56px] mt-3 leading-[0.98]">
          Berhenti sejenak. <em>Amati.</em>
          <br />Pilih lagi.
        </h1>
        <p className="text-[13.5px] text-ink-muted mt-4 max-w-lg">
          Lima menit check-in sebelum minggu berikutnya dimulai.
          Data mingguan sudah dirangkum agar refleksinya lebih jujur.
        </p>
      </motion.section>

      {/* Auto summary */}
      <section className="rounded-2xl border border-line dark:border-night-border bg-card dark:bg-night-card p-6 mb-8">
        <div className="eyebrow"><Sparkles className="h-3 w-3 inline mr-1" /> Ringkasan otomatis</div>
        <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-ink-soft">
          {summaryLines.map((l, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-forest-400 flex-none" />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Form */}
      <form onSubmit={submit} className="space-y-5" data-testid="review-form">
        <Field label="Apa yang berjalan baik minggu ini?">
          <textarea
            value={form.highlights}
            onChange={(e) => setForm({ ...form, highlights: e.target.value })}
            placeholder="Small win pun tetap win…"
            className="input h-24 resize-none"
            data-testid="review-highlights"
          />
        </Field>
        <Field label="Apa yang menghambat?">
          <textarea
            value={form.blockers}
            onChange={(e) => setForm({ ...form, blockers: e.target.value })}
            placeholder="Yang perlu diakui agar bisa diperbaiki…"
            className="input h-24 resize-none"
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
            {[1,2,3].map(n => (
              <input
                key={n}
                value={form[`focus${n}`]}
                onChange={(e) => setForm({ ...form, [`focus${n}`]: e.target.value })}
                placeholder={`Fokus ${n}`}
                className="input"
                data-testid={`focus-${n}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-dark" data-testid="save-review-btn">
            <BookOpen className="h-3.5 w-3.5" /> Simpan refleksi
          </button>
          {saved && <span className="text-[12px] text-forest-500 dark:text-lime">Tersimpan ✓</span>}
        </div>
      </form>

      {/* History */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <div className="eyebrow">Histori refleksi</div>
          <h2 className="h-display text-[24px] mt-1 mb-4">Cerita minggu-mingguku</h2>
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-line dark:border-night-border p-4 bg-card dark:bg-night-card">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[11px] text-ink-muted">{formatDateID(r.weekOf)}</div>
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
  return <label className="grid gap-1"><span className="eyebrow">{label}</span>{children}</label>;
}
