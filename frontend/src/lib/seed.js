/**
 * Seed data for Rafli — used when the app is first loaded on a device
 * that has no stored state. Values are opinionated to match the product
 * narrative in the PRD (Data Analyst journey, IDR finance targets, etc.)
 */

import { nanoid } from "nanoid";

const USER_ID = "rafli-akbar";

const id = () => nanoid(10);

const now = () => new Date().toISOString();

/* ---------- Life areas ---------- */

export const LIFE_AREAS = [
  { key: "career", label: "Career", color: "#315d48", hint: "Menuju Data Analyst" },
  { key: "finance", label: "Finance", color: "#eb9b63", hint: "Uang & tabungan" },
  { key: "skills", label: "Skills", color: "#a8c845", hint: "Query, data, bisnis" },
  { key: "business", label: "Business", color: "#8a9a5b", hint: "Agency & side income" },
  { key: "growth", label: "Growth", color: "#d7a06c", hint: "Diri & jaringan" },
];

/* ---------- Goals ---------- */

export const seedGoals = [
  {
    id: "goal-data-analyst",
    userId: USER_ID,
    area: "career",
    title: "Terjun ke Data Analyst",
    why: "Fondasi karier dan penghasilan jangka panjang.",
    priority: "high",
    status: "in_progress",
    targetDate: "2026-12-31",
    contributions: [
      { key: "skills", label: "Core skills", weight: 25, value: 55 },
      { key: "portfolio", label: "Portfolio projects", weight: 25, value: 40 },
      { key: "experience", label: "Career experience", weight: 20, value: 60 },
      { key: "certificates", label: "Certificates", weight: 10, value: 70 },
      { key: "network", label: "Networking / brand", weight: 10, value: 25 },
      { key: "applications", label: "Job readiness", weight: 10, value: 20 },
    ],
    notes: "Fokus: SQL joins, satu proyek analitik dengan storytelling.",
    createdAt: now(),
  },
  {
    id: "goal-master-skills",
    userId: USER_ID,
    area: "skills",
    title: "Jago Query, Coding, Analisis, Bisnis, Data & Financial",
    why: "Multi-skill yang saling menguatkan karier & bisnis.",
    priority: "high",
    status: "in_progress",
    targetDate: "2027-06-30",
    notes: "Latih SQL + Python + storytelling; tambah satu resource per minggu.",
    progress: 48,
    createdAt: now(),
  },
  {
    id: "goal-salary-10m",
    userId: USER_ID,
    area: "finance",
    title: "Gaji Rp10 juta per bulan",
    why: "Titik awal financial freedom sekaligus validasi karier.",
    priority: "high",
    status: "in_progress",
    targetDate: "2026-12-31",
    metric: { current: 3_250_000, target: 10_000_000, unit: "IDR" },
    createdAt: now(),
  },
  {
    id: "goal-device-upgrade",
    userId: USER_ID,
    area: "finance",
    title: "Upgrade handphone dan laptop",
    why: "Peralatan yang layak untuk kerja data dan produktivitas.",
    priority: "medium",
    status: "planned",
    targetDate: "2026-11-30",
    metric: { current: 4_200_000, target: 16_000_000, unit: "IDR" },
    createdAt: now(),
  },
  {
    id: "goal-gaming-pc",
    userId: USER_ID,
    area: "finance",
    title: "Punya komputer gaming",
    why: "Reward pribadi setelah target karier & tabungan tercapai.",
    priority: "low",
    status: "planned",
    targetDate: "2027-06-30",
    metric: { current: 0, target: 22_000_000, unit: "IDR" },
    createdAt: now(),
  },
  {
    id: "goal-agency",
    userId: USER_ID,
    area: "business",
    title: "Bangun bisnis / agency",
    why: "Sumber income kedua yang bisa dikembangkan tim kecil.",
    priority: "medium",
    status: "planned",
    targetDate: "2028-12-31",
    progress: 12,
    createdAt: now(),
  },
  {
    id: "goal-savings-ladder",
    userId: USER_ID,
    area: "finance",
    title: "Tabungan bertahap Rp10 jt → Rp100 jt",
    why: "Pondasi keuangan yang selalu bertumbuh.",
    priority: "high",
    status: "in_progress",
    targetDate: "2028-12-31",
    metric: { current: 8_400_000, target: 100_000_000, unit: "IDR" },
    milestones: [
      { id: id(), label: "Rp 10 juta", target: 10_000_000, achieved: false, achievedAt: null },
      { id: id(), label: "Rp 20 juta", target: 20_000_000, achieved: false, achievedAt: null },
      { id: id(), label: "Rp 30 juta", target: 30_000_000, achieved: false, achievedAt: null },
      { id: id(), label: "Rp 40 juta", target: 40_000_000, achieved: false, achievedAt: null },
      { id: id(), label: "Rp 50 juta", target: 50_000_000, achieved: false, achievedAt: null },
      { id: id(), label: "Rp 100 juta", target: 100_000_000, achieved: false, achievedAt: null },
    ],
    createdAt: now(),
  },
  {
    id: "goal-invest",
    userId: USER_ID,
    area: "finance",
    title: "Mulai investasi emas dan saham",
    why: "Aset yang tumbuh mengalahkan inflasi.",
    priority: "medium",
    status: "planned",
    targetDate: "2026-09-30",
    progress: 5,
    createdAt: now(),
  },
  {
    id: "goal-harley",
    userId: USER_ID,
    area: "growth",
    title: "Beli motor Harley",
    why: "Reward besar setelah karier & investasi kuat.",
    priority: "low",
    status: "planned",
    targetDate: "2030-06-30",
    progress: 0,
    createdAt: now(),
  },
  {
    id: "goal-freedom",
    userId: USER_ID,
    area: "finance",
    title: "Financial Freedom",
    why: "Aset menghasilkan lebih besar dari kebutuhan bulanan.",
    priority: "high",
    status: "planned",
    targetDate: "2032-12-31",
    progress: 3,
    createdAt: now(),
  },
  {
    id: "goal-portfolio-5",
    userId: USER_ID,
    area: "career",
    title: "Bangun portofolio Data Analyst minimal 5 proyek",
    why: "Bukti nyata yang lebih kuat daripada sertifikat.",
    priority: "high",
    status: "in_progress",
    targetDate: "2026-12-31",
    metric: { current: 2, target: 5, unit: "proyek" },
    createdAt: now(),
  },
  {
    id: "goal-first-data-job",
    userId: USER_ID,
    area: "career",
    title: "Mendapat pekerjaan / klien data pertama",
    why: "Momentum awal karier Data Analyst.",
    priority: "high",
    status: "planned",
    targetDate: "2026-12-31",
    progress: 20,
    createdAt: now(),
  },
  {
    id: "goal-english",
    userId: USER_ID,
    area: "skills",
    title: "Meningkatkan English profesional",
    why: "Akses ke pasar kerja & klien global.",
    priority: "medium",
    status: "in_progress",
    targetDate: "2026-12-31",
    progress: 35,
    createdAt: now(),
  },
  {
    id: "goal-linkedin",
    userId: USER_ID,
    area: "growth",
    title: "Membangun personal brand LinkedIn",
    why: "Visibility yang membuka pintu opportunity.",
    priority: "medium",
    status: "in_progress",
    targetDate: "2026-12-31",
    progress: 30,
    createdAt: now(),
  },
  {
    id: "goal-network",
    userId: USER_ID,
    area: "growth",
    title: "Membangun network profesional di data & bisnis",
    why: "Karier tumbuh lebih cepat melalui orang.",
    priority: "medium",
    status: "in_progress",
    targetDate: "2026-12-31",
    progress: 22,
    createdAt: now(),
  },
];

/* ---------- Career milestones ---------- */

export const CAREER_TYPES = [
  { key: "education", label: "Education", color: "#8a9a5b" },
  { key: "certificate", label: "Certificate", color: "#a8c845" },
  { key: "experience", label: "Experience", color: "#315d48" },
  { key: "project", label: "Project", color: "#eb9b63" },
  { key: "skill", label: "Skill Milestone", color: "#7ba888" },
  { key: "target", label: "Target Role", color: "#c9743c" },
];

export const seedCareerMilestones = [
  {
    id: "cm-1",
    userId: USER_ID,
    title: "SMA / kuliah data",
    type: "education",
    month: 6,
    year: 2022,
    organization: "Universitas / self-taught",
    description: "Fondasi awal untuk berpindah karier ke dunia data.",
    skills: ["Excel", "Statistik dasar"],
    evidenceUrl: "",
    status: "completed",
    contribution: 8,
    createdAt: now(),
  },
  {
    id: "cm-2",
    userId: USER_ID,
    title: "Google Data Analytics Certificate",
    type: "certificate",
    month: 8,
    year: 2024,
    organization: "Coursera · Google",
    description: "Fondasi SQL, spreadsheets, Tableau, dan berpikir seperti analyst.",
    skills: ["SQL", "Tableau", "Data cleaning", "Analytics"],
    evidenceUrl: "https://www.coursera.org/",
    status: "completed",
    contribution: 12,
    createdAt: now(),
  },
  {
    id: "cm-3",
    userId: USER_ID,
    title: "Data & reporting experience",
    type: "experience",
    month: 1,
    year: 2025,
    organization: "Peran saat ini",
    description: "Pengalaman langsung membaca angka bisnis dan menyusun laporan.",
    skills: ["Excel", "Reporting", "Business"],
    evidenceUrl: "",
    status: "in_progress",
    contribution: 18,
    createdAt: now(),
  },
  {
    id: "cm-4",
    userId: USER_ID,
    title: "Portfolio project #1 — Retail sales dashboard",
    type: "project",
    month: 5,
    year: 2026,
    organization: "Portofolio pribadi",
    description: "SQL cleaning + Tableau dashboard untuk simulasi ritel.",
    skills: ["SQL", "Tableau"],
    evidenceUrl: "https://github.com/",
    status: "completed",
    contribution: 10,
    createdAt: now(),
  },
  {
    id: "cm-5",
    userId: USER_ID,
    title: "Portfolio project #2 — Financial cashflow analytics",
    type: "project",
    month: 7,
    year: 2026,
    organization: "Portofolio pribadi",
    description: "Analisis pola cashflow personal dan simulasi budget.",
    skills: ["Python", "Pandas", "Storytelling"],
    evidenceUrl: "https://github.com/",
    status: "in_progress",
    contribution: 8,
    createdAt: now(),
  },
  {
    id: "cm-6",
    userId: USER_ID,
    title: "SQL join mastery",
    type: "skill",
    month: 8,
    year: 2026,
    organization: "Practice log",
    description: "Menguasai window function, self join, dan CTE.",
    skills: ["SQL"],
    evidenceUrl: "",
    status: "in_progress",
    contribution: 6,
    createdAt: now(),
  },
  {
    id: "cm-7",
    userId: USER_ID,
    title: "Portfolio project #3 — Product retention story",
    type: "project",
    month: 10,
    year: 2026,
    organization: "Portofolio pribadi",
    description: "Case study retention & funnel dari data publik.",
    skills: ["SQL", "Python", "Data storytelling"],
    evidenceUrl: "",
    status: "planned",
    contribution: 8,
    createdAt: now(),
  },
  {
    id: "cm-8",
    userId: USER_ID,
    title: "Data Analyst — target role",
    type: "target",
    month: 12,
    year: 2026,
    organization: "Perusahaan berbasis data",
    description: "Peran Data Analyst yang menggabungkan data + bisnis.",
    skills: ["Data storytelling", "Product thinking", "SQL", "Python"],
    evidenceUrl: "",
    status: "planned",
    contribution: 30,
    createdAt: now(),
  },
];

/* ---------- Portfolio projects ---------- */

export const seedPortfolio = [
  {
    id: "pf-1",
    userId: USER_ID,
    title: "Retail Sales Dashboard",
    tools: ["SQL", "Tableau"],
    status: "shipped",
    link: "https://github.com/",
    impact: "Analisis 250K transaksi retail simulasi.",
    caseStudy: "Menemukan 3 kategori dengan margin terburuk dan usulan bundling.",
    createdAt: now(),
  },
  {
    id: "pf-2",
    userId: USER_ID,
    title: "Personal Cashflow Analytics",
    tools: ["Python", "Pandas", "Matplotlib"],
    status: "in_progress",
    link: "https://github.com/",
    impact: "Model prediksi tabungan bulanan berdasarkan pola pengeluaran.",
    caseStudy: "Mengintegrasikan data transaksi CSV ke pipeline analitik sederhana.",
    createdAt: now(),
  },
];

/* ---------- Skills ---------- */

export const SKILL_CATEGORIES = [
  { key: "technical", label: "Technical" },
  { key: "data", label: "Data" },
  { key: "business", label: "Business" },
  { key: "financial", label: "Financial" },
  { key: "communication", label: "Communication" },
  { key: "career", label: "Career" },
];

export const seedSkills = [
  { id: "sk-1", userId: USER_ID, name: "SQL & Querying", category: "data", level: 3, target: 5, momentum: 74, relatedToRole: true, lastPracticedAt: subtractDays(2), plan: "Selesaikan sesi join advanced.", resourceUrl: "https://mode.com/sql-tutorial" },
  { id: "sk-2", userId: USER_ID, name: "Data Analysis", category: "data", level: 3, target: 5, momentum: 68, relatedToRole: true, lastPracticedAt: subtractDays(1), plan: "Selesaikan case study cashflow." },
  { id: "sk-3", userId: USER_ID, name: "Python", category: "technical", level: 2, target: 4, momentum: 42, relatedToRole: true, lastPracticedAt: subtractDays(5), plan: "Latihan pandas + matplotlib." },
  { id: "sk-4", userId: USER_ID, name: "Business Acumen", category: "business", level: 3, target: 4, momentum: 55, relatedToRole: true, lastPracticedAt: subtractDays(3) },
  { id: "sk-5", userId: USER_ID, name: "Financial Literacy", category: "financial", level: 3, target: 5, momentum: 58, relatedToRole: false, lastPracticedAt: subtractDays(2) },
  { id: "sk-6", userId: USER_ID, name: "Data Visualization", category: "data", level: 3, target: 5, momentum: 62, relatedToRole: true, lastPracticedAt: subtractDays(4) },
  { id: "sk-7", userId: USER_ID, name: "Storytelling with Data", category: "communication", level: 2, target: 4, momentum: 30, relatedToRole: true, lastPracticedAt: subtractDays(7), plan: "Tulis satu case study per minggu." },
  { id: "sk-8", userId: USER_ID, name: "English Profesional", category: "communication", level: 3, target: 4, momentum: 40, relatedToRole: true, lastPracticedAt: subtractDays(3) },
];

/* ---------- Finance ---------- */

export const TX_CATEGORIES = {
  income: [
    { key: "salary", label: "Gaji" },
    { key: "freelance", label: "Freelance" },
    { key: "bonus", label: "Bonus" },
    { key: "invest", label: "Investasi" },
    { key: "other_in", label: "Lain-lain" },
  ],
  expense: [
    { key: "daily", label: "Kebutuhan harian" },
    { key: "food", label: "Makan & minum" },
    { key: "transport", label: "Transport" },
    { key: "learning", label: "Belajar / kursus" },
    { key: "device", label: "Alat kerja" },
    { key: "saving", label: "Transfer tabungan" },
    { key: "charity", label: "Sedekah" },
    { key: "bpjs", label: "BPJS" },
    { key: "service", label: "Service motor" },
    { key: "fun", label: "Hiburan" },
    { key: "family", label: "Keluarga" },
    { key: "other_out", label: "Lain-lain" },
  ],
};

export const seedTransactions = generateTransactionHistory();

export const seedBudgets = [
  { id: "b-1", userId: USER_ID, category: "food", limit: 900_000, month: currentMonthLabel() },
  { id: "b-2", userId: USER_ID, category: "transport", limit: 400_000, month: currentMonthLabel() },
  { id: "b-3", userId: USER_ID, category: "learning", limit: 300_000, month: currentMonthLabel() },
  { id: "b-4", userId: USER_ID, category: "fun", limit: 250_000, month: currentMonthLabel() },
];

export const seedReminders = [
  { id: "r-1", userId: USER_ID, title: "BPJS Kesehatan", amount: 150_000, category: "bpjs", cadence: "monthly", dueDay: 20, active: true, notes: "Bayar sebelum tanggal 20." },
  { id: "r-2", userId: USER_ID, title: "Sedekah 2.5% dari gaji", amount: null, category: "charity", cadence: "monthly", dueDay: 5, active: true, notes: "2.5% × total pemasukan bulan ini." },
  { id: "r-3", userId: USER_ID, title: "Service motor rutin", amount: 250_000, category: "service", cadence: "quarterly", dueDay: 2, active: true, notes: "Jangan tunggu lampu warning." },
  { id: "r-4", userId: USER_ID, title: "Review bulanan cashflow", amount: null, category: "saving", cadence: "monthly", dueDay: 28, active: true, notes: "Rekap total & simpan snapshot." },
];

/* ---------- Weekly review ---------- */

export const seedReviews = [
  {
    id: "rev-w-prev",
    userId: USER_ID,
    weekOf: previousMondayISO(),
    highlights: "Menyelesaikan bab SQL join dan tambah 2 aplikasi lamaran.",
    blockers: "Waktu belajar terpotong shift kerja hari Jumat.",
    finance: "Pengeluaran makan naik 12% dari minggu sebelumnya.",
    careerProgress: "Portfolio project #2 maju ke tahap analisis.",
    nextWeekFocus: ["Selesaikan portfolio project #2", "Update LinkedIn about", "Praktik SQL 3× minggu ini"],
    createdAt: now(),
  },
];

/* ---------- Commitments (today) ---------- */

export const seedCommitments = [
  { id: "c-1", userId: USER_ID, title: "Selesaikan SQL joins module", area: "skills", dueDate: todayISO(), done: false, priority: "high" },
  { id: "c-2", userId: USER_ID, title: "Update LinkedIn about section", area: "growth", dueDate: tomorrowISO(), done: false, priority: "medium" },
  { id: "c-3", userId: USER_ID, title: "Catat semua pengeluaran hari ini", area: "finance", dueDate: todayISO(), done: true, priority: "high" },
  { id: "c-4", userId: USER_ID, title: "Buat satu chart untuk portfolio project #2", area: "career", dueDate: dayAfterTomorrowISO(), done: false, priority: "high" },
  { id: "c-5", userId: USER_ID, title: "Kirim 1 pesan networking LinkedIn", area: "growth", dueDate: todayISO(), done: false, priority: "medium" },
];

/* ---------- Notifications (persisted) ---------- */

export const seedNotifications = [
  { id: "n-1", userId: USER_ID, title: "BPJS jatuh tempo minggu ini", body: "Rp 150.000 · lunas sebelum 20.", tone: "warning", read: false, createdAt: now() },
  { id: "n-2", userId: USER_ID, title: "SQL belum disentuh 2 hari", body: "Jadwalkan sesi 30 menit hari ini.", tone: "info", read: false, createdAt: now() },
  { id: "n-3", userId: USER_ID, title: "Selamat, spending score kamu naik jadi 82", body: "Pertahankan pola bulan ini.", tone: "success", read: true, createdAt: subtractHoursISO(24) },
];

/* ---------- Activity log ---------- */

export const seedActivity = [
  { id: "act-1", userId: USER_ID, kind: "goal", message: "Menandai milestone Portfolio project #1 sebagai selesai.", createdAt: subtractDaysISO(1) },
  { id: "act-2", userId: USER_ID, kind: "finance", message: "Menambahkan transaksi Salary Rp3.250.000.", createdAt: subtractDaysISO(2) },
  { id: "act-3", userId: USER_ID, kind: "skill", message: "SQL & Querying naik ke Level 3.", createdAt: subtractDaysISO(4) },
];

/* ---------- User ---------- */

export const seedUser = {
  id: USER_ID,
  fullName: "Rafli Akbar",
  headline: "Building the next chapter · Data Analyst in progress",
  locale: "id-ID",
  currency: "IDR",
  targetRole: "Data Analyst",
  createdAt: now(),
};

/* ---------- Helpers ---------- */

function subtractDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
function subtractDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
function subtractHoursISO(hours) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function dayAfterTomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}
function previousMondayISO() {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day - 6);
  return d.toISOString().slice(0, 10);
}
function currentMonthLabel() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Generate a semi-realistic 6-month transaction history so that charts
 * have a story from day one — while still small enough to be readable.
 */
function generateTransactionHistory() {
  const out = [];
  const nowD = new Date();
  const buckets = [
    { offsetMonths: 5, income: 2_900_000, base: 1_650_000 },
    { offsetMonths: 4, income: 3_000_000, base: 1_720_000 },
    { offsetMonths: 3, income: 3_050_000, base: 1_680_000 },
    { offsetMonths: 2, income: 3_100_000, base: 1_540_000 },
    { offsetMonths: 1, income: 3_200_000, base: 1_490_000 },
    { offsetMonths: 0, income: 3_250_000, base: 1_410_000 }, // current month
  ];

  buckets.forEach((b, idx) => {
    const month = nowD.getMonth() - b.offsetMonths;
    const monthDate = new Date(nowD.getFullYear(), month, 5);
    const y = monthDate.getFullYear();
    const m = String(monthDate.getMonth() + 1).padStart(2, "0");

    // Income
    out.push({
      id: `tx-${idx}-in`,
      userId: USER_ID,
      title: "Gaji bulanan",
      category: "salary",
      type: "income",
      amount: b.income,
      date: `${y}-${m}-05`,
      notes: "Gaji reguler.",
      recurring: true,
      createdAt: now(),
    });

    if (idx === 5) {
      // For current month, split expenses by category to feed the pie
      const expenseMix = [
        ["Makan & transport", "food", 261_000],
        ["Kursus SQL Fundamentals", "learning", 149_000],
        ["Transfer tabungan", "saving", 1_000_000],
        ["Isi bensin motor", "transport", 180_000],
        ["Belanja bulanan", "daily", 320_000],
        ["Sedekah bulan ini", "charity", 81_250],
        ["Kopi & fokus", "fun", 74_000],
      ];
      expenseMix.forEach((ex, j) => {
        out.push({
          id: `tx-${idx}-ex-${j}`,
          userId: USER_ID,
          title: ex[0],
          category: ex[1],
          type: "expense",
          amount: ex[2],
          date: `${y}-${m}-${String(6 + j).padStart(2, "0")}`,
          recurring: ex[1] === "saving" || ex[1] === "charity",
          createdAt: now(),
        });
      });
    } else {
      // Prior months: single "life expenses" grouping (keeps seed light)
      out.push({
        id: `tx-${idx}-ex`,
        userId: USER_ID,
        title: "Kebutuhan hidup bulanan",
        category: "daily",
        type: "expense",
        amount: b.base,
        date: `${y}-${m}-15`,
        recurring: true,
        createdAt: now(),
      });
    }
  });
  return out;
}

/* ---------- Full seed bundle ---------- */

export function buildInitialState() {
  return {
    version: 1,
    user: seedUser,
    goals: seedGoals,
    careerMilestones: seedCareerMilestones,
    portfolio: seedPortfolio,
    skills: seedSkills,
    transactions: seedTransactions,
    budgets: seedBudgets,
    reminders: seedReminders,
    reviews: seedReviews,
    commitments: seedCommitments,
    notifications: seedNotifications,
    activity: seedActivity,
    settings: {
      theme: "light",
      reducedMotion: false,
      currency: "IDR",
      locale: "id-ID",
    },
  };
}
