"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLifeStore } from "@/lib/store";
import {
  LayoutDashboard, Target, TrendingUp, Wallet, Sparkles, Compass, Bot,
  Command, ChevronDown, Check, ArrowRight, BookOpen,
} from "lucide-react";
import clsx from "clsx";

const PROGRESS_KEY = "rafli-life-tracker::guide-progress::v1";

const SECTIONS = [
  {
    key: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    tagline: "Ringkasan harimu — satu tempat untuk tahu apa yang penting sekarang.",
    steps: [
      "Today's Focus menampilkan satu commitment paling bermakna hari ini — centang langsung dari sini saat selesai.",
      "Life Pulse merangkum 4 metrik: career readiness, skill momentum, saving rate, spending score.",
      "Kartu Insight muncul sesuai datamu — termasuk korelasi lintas-modul (mis. stres ↔ pengeluaran) setelah ±3 minggu ritual berisi energi/stres.",
      "Kalau ritual/refleksi lewat 2+ minggu, ada pengingat tenang di sini — bukan alarm, cuma penanda jujur.",
    ],
    actions: [
      { label: "Buka Dashboard", kind: "nav", href: "/" },
      { label: "Tambah commitment", kind: "quickadd", type: "commitment" },
    ],
  },
  {
    key: "goals",
    icon: Target,
    title: "Goals",
    tagline: "Arah hidup yang terukur — progress dihitung dari data nyata, bukan diklaim.",
    steps: [
      "Buat goal dengan judul, life area, prioritas, dan alasan jujur kenapa penting.",
      "Progress goal career/savings dihitung otomatis dari career readiness dan transaksi tabunganmu.",
      "Goal ber-area skills/career/finance butuh bukti: tanpa aktivitas terkait 14 hari, muncul chip “belum ada bukti” dan tidak dihitung on-track.",
      "Goal yang sudah tidak relevan diarsipkan lewat detail drawer, bukan dihapus.",
    ],
    actions: [
      { label: "Buat goal baru", kind: "quickadd", type: "goal" },
      { label: "Buka Goals", kind: "nav", href: "/goals" },
    ],
  },
  {
    key: "career",
    icon: TrendingUp,
    title: "Career",
    tagline: "Peta perjalanan kariermu dalam dua jalur yang selalu terbaca.",
    steps: [
      "Jalur kiri = pengalaman kerja (kronologis), jalur kanan = pendidikan & sertifikasi — semua info utama terlihat tanpa klik.",
      "Klik kartu untuk detail lengkap dan edit: rentang tanggal, “masih berlangsung”, lokasi, poin pencapaian.",
      "Milestone baru muncul dengan animasi kecil di jalurnya — tambah lewat tombol di halaman atau Quick Add.",
      "Di bawah peta ada Portfolio tracker dan Skills gap terhadap target role-mu.",
    ],
    actions: [
      { label: "Tambah milestone", kind: "quickadd", type: "milestone" },
      { label: "Buka Career", kind: "nav", href: "/career" },
    ],
  },
  {
    key: "finance",
    icon: Wallet,
    title: "Finance",
    tagline: "Uang dengan kesadaran — catat, batasi, dan lihat polanya.",
    steps: [
      "Catat setiap transaksi (pemasukan/pengeluaran) — makin lengkap, makin jujur saving rate dan spending score-mu.",
      "Set budget per kategori per bulan; indikator berubah hanya saat benar-benar over.",
      "Reminders untuk kewajiban rutin (BPJS, sedekah, service) — toggle on/off sesuai kebutuhan.",
      "Semua transaksi bisa diexport ke CSV kapan saja.",
    ],
    actions: [
      { label: "Catat transaksi", kind: "quickadd", type: "transaction" },
      { label: "Buka Finance", kind: "nav", href: "/finance" },
    ],
  },
  {
    key: "skills",
    icon: Sparkles,
    title: "Skills",
    tagline: "Latihan yang dicatat adalah bukti — bukan sekadar niat.",
    steps: [
      "“Catat sesi” setiap kali latihan — ini menaikkan momentum skill DAN jadi bukti untuk goal skills-mu.",
      "Naik level saat kamu merasa pantas (1–5) — target level menandai gap ke role impian.",
      "Skill yang terhubung ke role (relatedToRole) ikut menghitung career readiness di Dashboard.",
      "Skill yang lama tidak disentuh akan muncul sebagai pengingat di Dashboard.",
    ],
    actions: [
      { label: "Tambah skill", kind: "quickadd", type: "skill" },
      { label: "Buka Skills", kind: "nav", href: "/skills" },
    ],
  },
  {
    key: "compass",
    icon: Compass,
    title: "Life Compass",
    tagline: "Ritual mingguan + refleksi — masa lalu diakui, masa kini dijujuri, masa depan diarahkan.",
    steps: [
      "Ritual Mingguan (5 menit, sekali seminggu): mood, energi & stres 1–5, cerita minggumu (draft otomatis yang bisa diedit), lalu 1–3 fokus minggu depan.",
      "Fokus yang belum ketahuan kabarnya akan ditagih di ritual berikutnya — jawab jujur: sudah jalan, bawa lagi, atau lepaskan dengan sadar.",
      "Isi energi/stres rutin → indikator Momentum vs Burnout mulai bekerja setelah 2 ritual.",
      "Berbenah untuk refleksi harian (Quick 2 menit / Deep 5 template) — draft tersimpan otomatis.",
      "Wins & Gratitude untuk kemenangan kecil; Surat untuk Diri tersegel sampai tanggal yang kamu pilih.",
      "Semua isi refleksi privat — Asisten AI hanya menerima pola agregat, tidak pernah teks aslinya.",
    ],
    actions: [{ label: "Buka Life Compass", kind: "nav", href: "/compass" }],
  },
  {
    key: "ai",
    icon: Bot,
    title: "Asisten AI",
    tagline: "Tanya apa saja tentang datamu — asisten ini membaca, tidak pernah mengubah.",
    steps: [
      "Tanya dalam bahasa sehari-hari: “Ringkas kondisi keuanganku”, “Sejauh apa aku menuju Data Analyst?”",
      "Setiap jawaban mencantumkan sumber modul yang dipakai — itu mekanisme kepercayaannya.",
      "Read-only: tidak ada tombol “terapkan” karena memang tidak bisa mengubah data apa pun.",
      "Gratis selamanya — hanya memakai model free-tier.",
    ],
    actions: [{ label: "Buka Asisten AI", kind: "nav", href: "/ai" }],
  },
  {
    key: "shortcuts",
    icon: Command,
    title: "Pintasan & Fitur Lintas-Modul",
    tagline: "Cara tercepat bergerak di dalam app — dari halaman mana pun.",
    steps: [
      "Ctrl/Cmd + K membuka Command Palette: navigasi, quick add, dan ganti tema dari satu tempat.",
      "Tombol “Tambah” di pojok kanan atas membuka Quick Add — 6 tipe entri dari mana saja.",
      "Semua perubahan tersimpan otomatis (indikator “Saved” di kiri atas) — tidak ada tombol save.",
      "Dark mode dirancang khusus (bukan sekadar dibalik) — toggle lewat ikon bulan/matahari.",
    ],
    actions: [
      { label: "Buka Command Palette", kind: "palette" },
      { label: "Buka Quick Add", kind: "quickadd", type: "commitment" },
    ],
  },
];

export default function GuidePage() {
  const router = useRouter();
  const openQuickAdd = useLifeStore((s) => s.openQuickAdd);
  const openPalette = useLifeStore((s) => s.openPalette);
  const storeReducedMotion = useLifeStore((s) => s.settings.reducedMotion);
  const osReducedMotion = useReducedMotion();
  const reducedMotion = storeReducedMotion || osReducedMotion;

  const [openKey, setOpenKey] = useState(SECTIONS[0].key);
  const [done, setDone] = useState({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, []);

  function toggleDone(key) {
    const next = { ...done, [key]: !done[key] };
    setDone(next);
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    } catch {}
  }

  function runAction(a) {
    if (a.kind === "nav") router.push(a.href);
    else if (a.kind === "quickadd") openQuickAdd(a.type);
    else if (a.kind === "palette") openPalette();
  }

  const doneCount = SECTIONS.filter((s) => done[s.key]).length;

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-10 pb-24">
      <motion.header
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="eyebrow flex items-center gap-1.5">
          <BookOpen className="h-3 w-3" /> Guideline
        </div>
        <h1 className="h-display text-[40px] md:text-[52px] mt-3 leading-[1.02]">
          Cara memakai <em>ruang ini.</em>
        </h1>
        <p className="text-[13.5px] text-ink-muted mt-4 max-w-lg leading-relaxed">
          Delapan bagian, masing-masing bisa langsung dicoba dari sini. Tandai yang sudah
          kamu pahami — pelan-pelan saja, app ini tidak ke mana-mana.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="progress-track flex-1 max-w-[240px]">
            <span
              className="progress-fill bg-forest-500 block h-full rounded-[inherit] transition-all duration-500"
              style={{ width: `${(doneCount / SECTIONS.length) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-ink-muted">
            {doneCount} dari {SECTIONS.length} dipahami
          </span>
        </div>
      </motion.header>

      <div className="space-y-3">
        {SECTIONS.map((s) => {
          const isOpen = openKey === s.key;
          const isDone = !!done[s.key];
          return (
            <div
              key={s.key}
              className={clsx(
                "rounded-2xl border bg-card dark:bg-night-card overflow-hidden",
                isDone
                  ? "border-forest-500/40"
                  : "border-line dark:border-night-border"
              )}
            >
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : s.key)}
                className="w-full flex items-center gap-3 p-5 text-left min-h-[44px]"
                data-testid={`guide-section-${s.key}`}
                aria-expanded={isOpen}
              >
                <span
                  className={clsx(
                    "grid h-9 w-9 flex-none place-items-center rounded-full",
                    isDone
                      ? "bg-forest-500 text-white"
                      : "bg-forest-500/10 text-forest-500 dark:text-lime"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold">{s.title}</span>
                  <span className="block text-[12px] text-ink-muted mt-0.5 truncate">
                    {s.tagline}
                  </span>
                </span>
                <ChevronDown
                  className={clsx(
                    "h-4 w-4 text-ink-muted flex-none transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-line/60 dark:border-night-border/60">
                      <ol className="mt-3 space-y-2.5">
                        {s.steps.map((step, i) => (
                          <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-ink-soft">
                            <span className="font-mono text-[11px] text-forest-500 dark:text-lime mt-0.5 flex-none">
                              {i + 1}.
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {s.actions.map((a) => (
                          <button
                            key={a.label}
                            type="button"
                            onClick={() => runAction(a)}
                            className="btn-dark text-[12px]"
                            data-testid={`guide-action-${s.key}-${a.kind}${a.type ? `-${a.type}` : ""}`}
                          >
                            {a.label} <ArrowRight className="h-3 w-3" />
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => toggleDone(s.key)}
                          className={clsx(
                            "btn-ghost text-[12px] ml-auto",
                            isDone && "text-forest-500 dark:text-lime"
                          )}
                          data-testid={`guide-done-${s.key}`}
                        >
                          <Check className="h-3 w-3" />
                          {isDone ? "Sudah dipahami" : "Tandai dipahami"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-[12.5px] text-ink-muted font-reflect italic text-center max-w-md mx-auto">
        Tidak perlu memakai semuanya sekaligus. Mulai dari satu kebiasaan kecil —
        biasanya ritual mingguan — dan biarkan sisanya menyusul.
      </p>
    </div>
  );
}
