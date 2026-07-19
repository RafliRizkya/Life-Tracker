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
    // Auto-syncs with Finance: metric.current is the baseline, every
    // "saving" expense transaction adds on top (see linkedGoalCurrent()).
    linkedCategory: "saving",
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

// Sourced from Rafli's resume ("Profile (6).pdf"). Certification dates weren't
// listed on the resume (no month/year given) — they're estimated against the
// career timeline below and editable via the milestone detail drawer.
export const seedCareerMilestones = [
  // ---- Professional Path (track: experience) ----
  {
    id: "cm-pln",
    userId: USER_ID,
    title: "General Administrator",
    type: "experience",
    track: "experience",
    month: 8,
    year: 2023,
    endMonth: 12,
    endYear: 2023,
    ongoing: false,
    organization: "PT PLN (Persero)",
    location: "Bandung",
    description: "Mengelola 4.500+ data admin, otomasi booking ruang meeting, dan tracking armada kendaraan.",
    highlights: [
      "Mengumpulkan dan menyusun 4.530+ data untuk travel planning, sertifikat aset, dan lokasi tower PLN, mengurangi keterlambatan administratif.",
      "Membangun dan memelihara sistem berbasis web untuk otomasi booking ruang meeting.",
      "Merancang dan mengelola data kendaraan & pengemudi perusahaan dengan Microsoft Excel.",
      "Memberikan insight data dan solusi sistem untuk mendukung keputusan operasional.",
    ],
    skills: ["Excel", "Data Management", "Business Analysis"],
    evidenceUrl: "",
    status: "completed",
    contribution: 6,
    createdAt: now(),
  },
  {
    id: "cm-dialektiva",
    userId: USER_ID,
    title: "Social Media Admin",
    type: "experience",
    track: "experience",
    month: 1,
    year: 2024,
    endMonth: 7,
    endYear: 2024,
    ongoing: false,
    organization: "Dialektiva Creative",
    location: "Bandung",
    description: "Merancang strategi konten dan menganalisis tren media sosial untuk engagement.",
    highlights: [
      "Menganalisis topik trending di media sosial untuk peluang engagement.",
      "Membuat content pillar untuk menjaga konsistensi pesan.",
      "Menyusun rencana konten untuk upload rutin.",
      "Berinteraksi aktif dengan followers untuk membangun komunitas online.",
    ],
    skills: ["Content Strategy", "Social Media", "Analytics"],
    evidenceUrl: "",
    status: "completed",
    contribution: 4,
    createdAt: now(),
  },
  {
    id: "cm-agate",
    userId: USER_ID,
    title: "Corporate Administrator",
    type: "experience",
    track: "experience",
    month: 9,
    year: 2024,
    endMonth: 12,
    endYear: 2024,
    ongoing: false,
    organization: "Agate",
    location: "Bandung",
    description: "Membangun dua dashboard operasional untuk facility usage dan petty cash.",
    highlights: [
      "Membangun dan memelihara dua dashboard dinamis untuk facility usage dan petty cash flow.",
      "Menyusun ringkasan town hall meeting untuk komunikasi dan dokumentasi organisasi.",
      "Melakukan riset untuk mendukung presentasi manajemen dan kebutuhan operasional.",
      "Mengoordinasikan logistik meeting & event untuk hingga 19 tamu.",
    ],
    skills: ["Dashboard", "Excel", "Coordination"],
    evidenceUrl: "",
    status: "completed",
    contribution: 6,
    createdAt: now(),
  },
  {
    id: "cm-unirama",
    userId: USER_ID,
    title: "Data Analyst",
    type: "experience",
    track: "experience",
    month: 7,
    year: 2025,
    endMonth: 8,
    endYear: 2025,
    ongoing: false,
    organization: "PT Unirama Duta Niaga",
    location: "Jakarta",
    description: "Titik balik karier — laporan SQL kompleks, ERD, dan dashboard KPI stok.",
    highlights: [
      "Merancang dan mengembangkan custom report dengan query SQL kompleks, termasuk optimasi query yang lambat.",
      "Membuat Entity Relationship Diagram (ERD) untuk memahami struktur dan relasi data.",
      "Membantu tim Data Engineering dalam data mapping.",
      "Membangun dashboard interaktif untuk monitoring pergerakan stok (KPI).",
    ],
    skills: ["SQL", "ERD", "Data Mapping", "Dashboard"],
    evidenceUrl: "",
    status: "completed",
    contribution: 18,
    createdAt: now(),
  },
  {
    id: "cm-learnwithandi",
    userId: USER_ID,
    title: "Data Analyst",
    type: "experience",
    track: "experience",
    month: 11,
    year: 2025,
    endMonth: null,
    endYear: null,
    ongoing: true,
    organization: "LearnWithAndi",
    location: "",
    description: "Melanjutkan peran sebagai data analyst, mendukung analisis dan pelaporan data.",
    highlights: [],
    skills: ["Data Analysis", "Reporting"],
    evidenceUrl: "",
    status: "in_progress",
    contribution: 10,
    createdAt: now(),
  },
  {
    id: "cm-pipamas",
    userId: USER_ID,
    title: "Business Development Analyst",
    type: "experience",
    track: "experience",
    month: 4,
    year: 2026,
    endMonth: null,
    endYear: null,
    ongoing: true,
    organization: "PT. Pipamas Primasejati",
    location: "Bandung",
    description: "Peran saat ini — dashboard performa bisnis dan monitoring operasional real-time.",
    highlights: [
      "Mengembangkan dan memelihara dashboard performa sales harian dengan Power BI.",
      "Merancang dashboard monitoring bisnis (Marketing Gift Program, Credit Limit, New Outlet Opening) di Looker Studio dengan pipeline data otomatis via Python.",
      "Melakukan audit program marketing & promosi untuk memastikan kepatuhan dan efektivitas.",
      "Mengotomasi kalkulasi insentif sales dengan Power Query, meningkatkan akurasi dan efisiensi.",
    ],
    skills: ["Power BI", "Looker Studio", "Python", "Power Query"],
    evidenceUrl: "",
    status: "in_progress",
    contribution: 20,
    createdAt: now(),
  },

  // ---- Milestones Path (track: milestone) — education & certifications ----
  {
    id: "cm-pnb",
    userId: USER_ID,
    title: "Associate's Degree, Business Administration",
    type: "education",
    track: "milestone",
    month: 8,
    year: 2021,
    endMonth: 8,
    endYear: 2024,
    ongoing: false,
    organization: "Politeknik Negeri Bandung",
    location: "Bandung",
    description: "Fondasi akademik di bidang Business Administration.",
    highlights: [],
    skills: ["Business Administration"],
    evidenceUrl: "",
    status: "completed",
    contribution: 8,
    createdAt: now(),
  },
  {
    id: "cm-sma",
    userId: USER_ID,
    title: "Lulusan, Jurusan Sosial",
    type: "education",
    track: "milestone",
    month: 6,
    year: 2021,
    endMonth: null,
    endYear: null,
    ongoing: false,
    organization: "SMA Negeri 2 Cimahi",
    location: "Cimahi",
    description: "Menyelesaikan pendidikan menengah atas, jurusan Sosial.",
    highlights: [],
    skills: [],
    evidenceUrl: "",
    status: "completed",
    contribution: 3,
    createdAt: now(),
  },
  {
    id: "cm-mos",
    userId: USER_ID,
    title: "Microsoft Office Specialist",
    type: "certificate",
    track: "milestone",
    month: 10,
    year: 2023,
    endMonth: null,
    endYear: null,
    ongoing: false,
    organization: "Microsoft",
    location: "",
    description: "Sertifikasi kompetensi Microsoft Office.",
    highlights: [],
    skills: ["Microsoft Office"],
    evidenceUrl: "",
    status: "completed",
    contribution: 4,
    createdAt: now(),
  },
  {
    id: "cm-career-essentials",
    userId: USER_ID,
    title: "Career Essentials in Administrative Assistance",
    type: "certificate",
    track: "milestone",
    month: 3,
    year: 2024,
    endMonth: null,
    endYear: null,
    ongoing: false,
    organization: "Microsoft & LinkedIn Learning",
    location: "",
    description: "Sertifikasi dasar-dasar administrative assistance.",
    highlights: [],
    skills: ["Administrative Assistance"],
    evidenceUrl: "",
    status: "completed",
    contribution: 4,
    createdAt: now(),
  },
  {
    id: "cm-google-da",
    userId: USER_ID,
    title: "Google Advanced Data Analytics",
    type: "certificate",
    track: "milestone",
    month: 6,
    year: 2025,
    endMonth: null,
    endYear: null,
    ongoing: false,
    organization: "Google (Coursera)",
    location: "",
    description: "Sertifikasi lanjutan data analytics — titik awal pivot ke data.",
    highlights: [],
    skills: ["SQL", "Python", "Tableau", "Statistics"],
    evidenceUrl: "",
    status: "completed",
    contribution: 14,
    createdAt: now(),
  },
  {
    id: "cm-sql-basic",
    userId: USER_ID,
    title: "Understanding Basic SQL Syntax",
    type: "certificate",
    track: "milestone",
    month: 6,
    year: 2025,
    endMonth: null,
    endYear: null,
    ongoing: false,
    organization: "LinkedIn Learning",
    location: "",
    description: "Dasar-dasar sintaks SQL.",
    highlights: [],
    skills: ["SQL"],
    evidenceUrl: "",
    status: "completed",
    contribution: 6,
    createdAt: now(),
  },
  {
    id: "cm-sql-joins",
    userId: USER_ID,
    title: "Practice It: SQL Joins",
    type: "certificate",
    track: "milestone",
    month: 7,
    year: 2025,
    endMonth: null,
    endYear: null,
    ongoing: false,
    organization: "LinkedIn Learning",
    location: "",
    description: "Latihan praktik SQL joins.",
    highlights: [],
    skills: ["SQL", "Joins"],
    evidenceUrl: "",
    status: "completed",
    contribution: 6,
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

/* ---------- Reflections (Ruang Berbenah) ---------- */

export const REFLECTION_TEMPLATES = {
  career: {
    key: "career",
    label: "Career",
    accent: "#315d48",
    tagline: "Menepi sejenak dari kejar-kejaran karier.",
    prompts: [
      { key: "momentum", label: "Momentum minggu ini di karier — bagaimana rasanya?" },
      { key: "proof", label: "Bukti kecil apa yang aku bangun (bahkan yang belum sempurna)?" },
      { key: "growing", label: "Skill mana yang sedang tumbuh — meski pelan?" },
      { key: "slowing", label: "Apa yang membuat progres terasa melambat?" },
      { key: "minimum", label: "Langkah paling minim yang bisa membawa dampak minggu depan?" },
    ],
  },
  finance: {
    key: "finance",
    label: "Finance",
    accent: "#eb9b63",
    tagline: "Pandang uangmu dengan ketenangan, bukan kekhawatiran.",
    prompts: [
      { key: "pattern", label: "Pola pengeluaran yang mulai aku sadari?" },
      { key: "proud", label: "Keputusan finansial yang aku syukuri minggu ini?" },
      { key: "conscious", label: "Godaan yang berhasil aku pilih dengan sadar?" },
      { key: "feeling", label: "Bagaimana perasaanku terhadap tabunganku saat ini?" },
      { key: "boundary", label: "Satu batas kecil yang ingin aku pegang minggu depan?" },
    ],
  },
  growth: {
    key: "growth",
    label: "Growth",
    accent: "#a8c845",
    tagline: "Aku sedang menjadi siapa?",
    prompts: [
      { key: "becoming", label: "Aku semakin siapa akhir-akhir ini?" },
      { key: "habits", label: "Kebiasaan kecil apa yang mulai membentuk aku?" },
      { key: "holding", label: "Apa yang menahanku dari versi berikutnya?" },
      { key: "influence", label: "Buku, orang, atau ide yang memengaruhi aku minggu ini?" },
      { key: "ritual", label: "Satu ritual kecil yang ingin aku pelihara?" },
    ],
  },
  decision: {
    key: "decision",
    label: "Decision",
    accent: "#c9743c",
    tagline: "Berpikir jernih sebelum memilih.",
    prompts: [
      { key: "question", label: "Keputusan apa yang sedang aku pertimbangkan?" },
      { key: "context", label: "Konteks — apa yang perlu aku pertimbangkan?" },
      { key: "options", label: "Opsi yang tersedia?" },
      { key: "fear", label: "Yang aku takuti dari tiap opsi?" },
      { key: "values", label: "Pilihan mana yang paling selaras dengan nilai-nilaiku?" },
    ],
  },
  gratitude: {
    key: "gratitude",
    label: "Gratitude",
    accent: "#8a9a5b",
    tagline: "Yang mudah dilupakan, yang layak diingat.",
    prompts: [
      { key: "three", label: "Tiga hal yang membuatku bersyukur hari ini?" },
      { key: "people", label: "Orang yang membuatku merasa didukung?" },
      { key: "moment", label: "Momen kecil menyenangkan minggu ini?" },
      { key: "body", label: "Kemampuan tubuh atau pikiran yang aku hargai?" },
      { key: "taken_for_granted", label: "Yang kadang aku anggap remeh tapi sebenarnya berharga?" },
    ],
  },
};

export const REFLECTION_MOOD_WORDS = [
  "tenang", "penasaran", "bersyukur", "lelah", "fokus",
  "gelisah", "bersemangat", "sabar", "tersadar", "berat",
];

export const seedReflections = [
  {
    id: "rf-1",
    userId: USER_ID,
    kind: "quick",
    template: null,
    moodWord: "tenang",
    currentState:
      "Cukup fokus tapi masih terpecah antara belajar SQL dan pekerjaan kantor.",
    whatWentWell:
      "Selesai satu bab SQL join dan kirim satu pesan networking ke teman lama.",
    whatFeltHeavy:
      "Sulit menutup laptop malam hari — otak masih ingin lanjut belajar.",
    lesson:
      "Kualitas 30 menit yang fokus lebih baik dari 2 jam sambil scroll.",
    smallStep: "Timer 30 menit + notifikasi off saat sesi belajar berikutnya.",
    answers: {},
    linkedGoals: ["goal-data-analyst"],
    linkedSkills: ["sk-1"],
    linkedTransactions: [],
    linkedCommitments: ["c-1"],
    linkedReview: null,
    tags: ["fokus", "belajar"],
    improvementActions: [
      { id: id(), text: "Aktifkan mode 30-menit fokus untuk SQL besok.", convertedToCommitmentId: null },
      { id: id(), text: "Tutup laptop 22.00 selama 3 hari ke depan.", convertedToCommitmentId: null },
    ],
    isPrivate: true,
    createdAt: subtractDaysISO(2),
  },
  {
    id: "rf-2",
    userId: USER_ID,
    kind: "deep",
    template: "career",
    moodWord: "penasaran",
    currentState: "",
    whatWentWell: "",
    whatFeltHeavy: "",
    lesson: "",
    smallStep: "",
    answers: {
      momentum:
        "Momentumnya kecil tapi konsisten. Portfolio project #2 mulai punya struktur.",
      proof:
        "Setup notebook analisis cashflow + dua chart pertama.",
      growing:
        "SQL joins mulai terasa natural saat baca query orang lain.",
      slowing:
        "Konteks pekerjaan kantor yang menyita 2 sore per minggu.",
      minimum:
        "Blok 3 sesi 45 menit di kalender untuk portfolio project #2.",
    },
    linkedGoals: ["goal-data-analyst", "goal-portfolio-5"],
    linkedSkills: ["sk-1", "sk-2"],
    linkedTransactions: [],
    linkedCommitments: [],
    linkedReview: null,
    tags: ["portfolio", "sql"],
    improvementActions: [
      { id: id(), text: "Blok 3 sesi 45 menit portfolio project #2 minggu ini.", convertedToCommitmentId: null },
    ],
    isPrivate: true,
    createdAt: subtractDaysISO(6),
  },
];

export const seedWins = [
  { id: "w-1", userId: USER_ID, kind: "win", text: "Selesai bab SQL join tanpa lihat solusi.", createdAt: subtractDaysISO(1) },
  { id: "w-2", userId: USER_ID, kind: "gratitude", text: "Motor masih sehat dan mengantarku sampai tempat kerja pagi ini.", createdAt: subtractDaysISO(2) },
  { id: "w-3", userId: USER_ID, kind: "gratitude", text: "Teman lama membalas pesan LinkedIn dengan hangat.", createdAt: subtractDaysISO(3) },
  { id: "w-4", userId: USER_ID, kind: "win", text: "Berhasil menahan pembelian gadget yang belum urgent.", createdAt: subtractDaysISO(5) },
];

export const seedLetters = [
  {
    id: "lt-1",
    userId: USER_ID,
    title: "Untuk Rafli 3 bulan lagi",
    body:
      "Kalau kamu membaca ini, aku harap kamu ingat bahwa awal itu selalu terasa lambat. Portfolio pertamamu mungkin belum sempurna, tabunganmu mungkin belum sebesar yang kamu bayangkan — tapi kamu masih di sini, dan itu sudah lebih dari cukup untuk hari ini. Teruskan sesi SQL 30 menit itu. Teruskan simpan sebagian gaji. Teruskan bilang \"ya\" pada satu percakapan baru per minggu. Kalau nanti ada hal berat, ingat: kamu sudah pernah melewatinya sebelumnya.",
    sealedUntil: (() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().slice(0, 10); })(),
    opened: false,
    createdAt: subtractDaysISO(10),
  },
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
    reflections: seedReflections,
    wins: seedWins,
    letters: seedLetters,
    settings: {
      theme: "light",
      reducedMotion: false,
      currency: "IDR",
      locale: "id-ID",
    },
  };
}
