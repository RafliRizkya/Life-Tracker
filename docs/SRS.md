# 📝 Software Requirements Specification (SRS)

## Rafli Life Tracker

| Field | Value |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | 17 Juli 2026 |
| **Status** | Phase 1 — Production |

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan spesifikasi kebutuhan perangkat lunak secara lengkap untuk **Rafli Life Tracker** — sebuah personal life operating system berbasis web.

### 1.2 Ruang Lingkup
Sistem mencakup 7 modul utama: Dashboard, Goals, Career, Finance, Skills, Reflection, dan Weekly Review. Saat ini berjalan sebagai single-user application dengan data persistence di browser localStorage, dengan arsitektur yang siap untuk multi-user via Supabase.

### 1.3 Referensi Dokumen
- [PRD.md](file:///c:/PROJECT/Life%20Tracker/docs/PRD.md) — Product Requirements Document
- [SDD.md](file:///c:/PROJECT/Life%20Tracker/docs/SDD.md) — System Design Document
- [UI-UX-Flow.md](file:///c:/PROJECT/Life%20Tracker/docs/UI-UX-Flow.md) — UI/UX Flow

---

## 2. Deskripsi Umum

### 2.1 Perspektif Produk
Rafli Life Tracker adalah aplikasi web standalone yang berjalan sepenuhnya di browser. Tidak memerlukan backend server untuk operasi dasar (semua data diproses dan disimpan di client side).

### 2.2 Fungsi Produk
```
┌─────────────────────────────────────────────────────┐
│               RAFLI LIFE TRACKER                     │
├──────────┬──────────┬───────────┬───────────────────┤
│Dashboard │  Goals   │  Career   │     Finance       │
│ ·Pulse   │ ·CRUD    │ ·Timeline │ ·Transactions     │
│ ·Focus   │ ·Filter  │ ·Filter   │ ·Budgets          │
│ ·Insight │ ·Ladder  │ ·Portfolio│ ·Charts           │
│ ·Commit  │ ·Detail  │ ·SkillGap │ ·Reminders        │
├──────────┼──────────┼───────────┼───────────────────┤
│  Skills  │Reflection│  Review   │   Cross-Module    │
│ ·Garden  │ ·Quick   │ ·Summary  │ ·Command Palette  │
│ ·Practice│ ·Deep    │ ·Form     │ ·Notifications    │
│ ·Level   │ ·Wins    │ ·History  │ ·Autosave         │
│ ·Detail  │ ·Letters │ ·Focus    │ ·Dark Mode        │
└──────────┴──────────┴───────────┴───────────────────┘
```

### 2.3 Karakteristik User
| Karakteristik | Detail |
|---|---|
| Jumlah user | 1 (Phase 1), multi-user ready (Phase 2+) |
| Kemampuan teknis | Pengguna umum, nyaman dengan web browser |
| Bahasa | Indonesia |
| Frekuensi penggunaan | Harian (catat transaksi, commitments), Mingguan (review, refleksi) |

### 2.4 Batasan Sistem
- **Single-user mode**: Tidak ada authentication screen di Phase 1
- **Client-side only**: Semua logika bisnis berjalan di browser
- **Offline-first**: Tidak memerlukan koneksi internet untuk operasi setelah initial load
- **No AI**: Rule-based insights only (AI assistant dijadwalkan di Phase 3)

### 2.5 Asumsi & Dependensi
- User menggunakan browser modern (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)
- JavaScript diaktifkan
- localStorage tersedia (minimal 5MB)
- Resolusi layar minimal 320px

---

## 3. Kebutuhan Fungsional

### 3.1 Modul Dashboard (FR-DASH)

#### FR-DASH-01: Adaptive Greeting
- **Input**: Waktu lokal user
- **Proses**: Cek `new Date().getHours()` dan tampilkan greeting sesuai rentang waktu
- **Output**: 
  - `< 5`: "Larut ini, Rafli"
  - `< 11`: "Selamat pagi, Rafli"
  - `< 15`: "Selamat siang, Rafli"
  - `< 19`: "Selamat sore, Rafli"
  - `≥ 19`: "Selamat malam, Rafli"

#### FR-DASH-02: Today's Focus
- **Input**: Array `commitments` dari store
- **Proses**: Filter commitment pertama dengan `done: false` dan `priority: "high"`, fallback ke commitment pertama yang belum done
- **Output**: Card menampilkan judul, area chip, due date, toggle checkbox
- **Interaksi**: Klik toggle → `toggleCommitment(id)` → update done status

#### FR-DASH-03: Life Pulse
- **Input**: `transactions`, `goals`, `skills`, `portfolio`, `careerMilestones`
- **Proses**: Hitung 4 metrik:
  - Career readiness: weighted average dari 6 parts (skills 25%, portfolio 25%, experience 20%, certificates 10%, network 10%, applications 10%)
  - Skill momentum: `roleAvg × 20` (role skills average level × 20)
  - Saving rate: `(income - expense) / income × 100`
  - Spending score: `100 - (expense / income × 65)`, capped 0–100
- **Output**: 4 progress bar rows dengan label dan persentase

#### FR-DASH-04: North Star Career Readiness
- **Input**: Computed `careerReadiness` object
- **Proses**: Tampilkan overall score + 6 part breakdown cards
- **Output**: Skor besar (e.g., "42/100"), progress bar, 6 mini cards dengan label dan persentase

#### FR-DASH-05: Finance Snapshot
- **Input**: `monthlyTotals(transactions)`
- **Output**: Card gelap (forest-700) dengan net savings, income, expense, saving rate
- **Link**: Navigasi ke `/finance`

#### FR-DASH-06: Savings Ladder
- **Input**: `savingsProgress(goals, transactions)`
- **Proses**: Hitung total saved dari transaksi kategori "saving", bandingkan dengan milestones
- **Output**: Progress bar + 6 milestone dots (10jt, 20jt, 30jt, 40jt, 50jt, 100jt) + teks status

#### FR-DASH-07: Rule-Based Insights
- **Input**: Seluruh data store
- **Proses**: `buildInsights()` evaluasi kondisi:
  - Savings naik/turun vs bulan lalu
  - Learning spend mendukung career goal
  - SQL practice stagnation (≥3 hari)
  - Portfolio progress (2-4 dari 5)
  - BPJS jatuh tempo dalam 5 hari
- **Output**: Array insight cards dengan tone (positive/warning) dan title/body

#### FR-DASH-08: Commitments List
- **Input**: `commitments.filter(c => !c.done).slice(0, 5)`
- **Output**: List dengan checkbox toggle, title, area chip, due date
- **Interaksi**: Toggle done, tambah commitment via Quick Add

#### FR-DASH-09: Finance Reminders
- **Input**: `reminders.filter(r => r.active).slice(0, 3)`
- **Output**: List dengan title, amount (IDR), due day, cadence

#### FR-DASH-10: Small Wins
- **Input**: `activity.slice(0, 4)`
- **Output**: List activity log terbaru

---

### 3.2 Modul Goals (FR-GOAL)

#### FR-GOAL-01: Goals Grid
- **Input**: `goals` array, filter state
- **Proses**: Filter by `status !== "archived"` dan area filter
- **Output**: Grid cards (1/2/3 kolom responsive) dengan area label, title, metric, progress bar, target date
- **Sorting**: Urutan dari store (newest first)

#### FR-GOAL-02: Area Filter
- **Input**: Pilihan user
- **Options**: Semua, Career, Finance, Skills, Business, Growth
- **Output**: FilterPills + filtered goals grid

#### FR-GOAL-03: Summary Stats
- **Output**: 3 angka: active goals, on track (progress ≥ 40%), completed

#### FR-GOAL-04: Goal Detail Drawer
- **Trigger**: Klik goal card
- **Content**: 
  - Progress besar (e.g., "42%") + progress bar
  - Why (italic quote)
  - Metric (current vs target)
  - Career breakdown (jika goal-data-analyst)
  - Savings milestones (jika goal-savings-ladder)
  - Notes
  - Status dropdown (planned/in_progress/completed)
  - Archive button

#### FR-GOAL-05: Goal Progress Computation
- **Logic** (`computeGoalProgress`):
  - `status === "completed"` → 100%
  - `id === "goal-data-analyst"` → `careerReadiness.overall`
  - `id === "goal-savings-ladder"` → `savingsProgress.pct`
  - Has `metric` → `(current / target) × 100`
  - Has `contributions` → weighted sum
  - Fallback → `goal.progress`

#### FR-GOAL-06: Add Goal
- **Via**: Quick Add modal, type "goal"
- **Fields**: title (required), area, priority, why, target date

#### FR-GOAL-07: Archive Goal
- **Action**: Set `status: "archived"`
- **Effect**: Goal tidak tampil di list utama

#### FR-GOAL-08: Savings Milestone Toggle
- **Action**: Toggle `achieved` boolean per milestone
- **Effect**: Set `achievedAt` timestamp, update visual

---

### 3.3 Modul Career (FR-CAREER)

#### FR-CAREER-01: Overview Cards
- **Output**: 3 cards: Current trajectory (Data Analyst), Next proof (Portfolio #N), Career readiness score

#### FR-CAREER-02: Type & Range Filters
- **Type filter**: All, Education, Certificate, Experience, Project, Skill Milestone, Target Role
- **Range filter**: Semua, Masa lalu, Tahun ini, Masa depan

#### FR-CAREER-03: Immersive Timeline
- **Visual**: Vertical growing line (animated via Framer Motion `scaleY`)
- **Nodes**: Color-coded per status
  - Completed: `bg-forest-500` solid green
  - In progress: `bg-terracotta` orange with ring glow
  - Planned: `bg-paper` outline only
- **Card content**: Date, type chip, status chip, title, organization, description, skill chips
- **Animation**: Stagger reveal `whileInView` per node

#### FR-CAREER-04: Milestone Detail Drawer
- **Editable fields**: Month (dropdown), Year, Organization, Description, Skills (comma-separated), Evidence URL, Status (dropdown), Contribution (0–30%)
- **Actions**: Update (autosave), Delete

#### FR-CAREER-05: Portfolio Tracker
- **Output**: Grid of portfolio project cards
- **Card content**: Status chip (Shipped/In progress), title, tools chips, impact, case study
- **Action**: Add project (window.prompt for title)

#### FR-CAREER-06: Skills Gap Analysis
- **Input**: `skills.filter(s => s.relatedToRole)`
- **Output**: Per skill: name, level/target, progress bar, gap message ("X level lagi untuk target role")

---

### 3.4 Modul Finance (FR-FIN)

#### FR-FIN-01: Net Savings Hero
- **Output**: Dark card with net savings (IDR), saving rate %, income detail, trend vs previous month
- **Visual**: Savings ring SVG (animated circular progress)

#### FR-FIN-02: Scorecards
- **4 cards**: Income, Expense, Saving rate, Spending score
- **Format**: IDR short (e.g., "Rp 3.2 jt"), percentage

#### FR-FIN-03: Cashflow Trend Chart
- **Library**: Recharts `BarChart`
- **Data**: `last6MonthsSeries(transactions)` → 6 months income vs expense bars
- **Tooltip**: IDR short format

#### FR-FIN-04: Spending by Category Chart
- **Library**: Recharts `PieChart`
- **Data**: `spendingByCategory(transactions)` → donut chart
- **Legend**: Category label + IDR short amount

#### FR-FIN-05: Budget Management
- **Display**: Budget cards with category, spent/limit, progress bar, over-budget warning
- **Create**: Inline form (category dropdown, limit input)
- **Delete**: Trash icon per budget
- **Computation**: Match transactions by category + current month

#### FR-FIN-06: Finance Reminders
- **Display**: List with title, amount, due day, cadence
- **Toggle**: Active/inactive via Power icon
- **Delete**: Trash icon
- **Add**: Via Quick Add modal

#### FR-FIN-07: Transaction List
- **Display**: Scrollable list (max 60), type icon (↓/↗), title, category, date, amount (green/default)
- **Delete**: Trash icon per transaction
- **Add**: Via Quick Add modal or "+ Transaksi" button

#### FR-FIN-08: CSV Export
- **Format**: CSV with columns: id, date, type, category, title, amount, notes
- **Filename**: `rafli-transactions-YYYY-MM-DD.csv`
- **Method**: Blob → URL.createObjectURL → trigger download

---

### 3.5 Modul Skills (FR-SKILL)

#### FR-SKILL-01: Career Readiness Skill Layer
- **Output**: Role average level (e.g., "2.8 / 5"), stagnant skills alert (top 3 oldest practice)

#### FR-SKILL-02: Skills Grid
- **Card content**: Category eyebrow, name, level dots (1–5 circles), level text, last practiced date
- **Quick actions**: "Catat sesi" (practice), "Naik level" (level up)
- **Click**: Open detail drawer

#### FR-SKILL-03: Practice Skill
- **Action**: `practiceSkill(id)`
- **Effect**: Set `lastPracticedAt` to today, increase `momentum` by 8 (max 100)
- **Log**: Activity entry "Sesi latihan skill dicatat"

#### FR-SKILL-04: Level Up
- **Action**: `updateSkill(id, { level: level + 1 })`
- **Constraint**: Max level 5
- **Effect**: Updates Career Readiness computation

#### FR-SKILL-05: Skill Detail Drawer
- **Editable**: Level (±), Target level (1–5), Learning plan (textarea), Resource URL, Related to role (checkbox)
- **Delete**: "Hapus skill" link

#### FR-SKILL-06: Recommendation Banner
- **Output**: Static recommendation card "Perdalam SQL joins, lalu jadikan portfolio evidence"
- **CTA**: "Tambah komitmen SQL 30 menit hari ini" → opens Quick Add

---

### 3.6 Modul Reflection (FR-REFLECT)

#### FR-REFLECT-01: Tab Navigation
- **4 tabs**: Berbenah (compose), Timeline, Wins & Gratitude, Surat untuk Diri
- **Transition**: AnimatePresence with fade + slide

#### FR-REFLECT-02: Quick Reflection Form
- **Fields**:
  - Mood picker (10 words: tenang, penasaran, bersyukur, lelah, fokus, gelisah, bersemangat, sabar, tersadar, berat)
  - Kondisi saat ini (textarea)
  - Hal yang berjalan baik (textarea)
  - Hal yang terasa berat (textarea)
  - Pelajaran (textarea)
  - Satu langkah kecil berikutnya (textarea)
  - 1–3 improvement actions (optional inputs)
  - Links & Tags (collapsible: tags, linked goals, linked skills)
- **Autosave**: Draft saved to localStorage with debounce 350ms

#### FR-REFLECT-03: Deep Reflection Form
- **5 templates** with unique prompts:
  - **Career** (accent: forest green): momentum, proof, growing, slowing, minimum
  - **Finance** (accent: terracotta): pattern, proud, conscious, feeling, boundary
  - **Growth** (accent: lime): becoming, habits, holding, influence, ritual
  - **Decision** (accent: burnt): question, context, options, fear, values
  - **Gratitude** (accent: olive): three, people, moment, body, taken_for_granted
- **Additional**: Mood picker, improvement actions, links & tags (same as quick)

#### FR-REFLECT-04: Timeline
- **Filter**: All, Quick, Career, Finance, Growth, Decision, Gratitude
- **Card**: Template chip, mood chip, date, excerpt (line-clamp-2), action status chips
- **Click**: Open detail drawer

#### FR-REFLECT-05: Reflection Detail Drawer
- **Read-only display**: All fields from reflection
- **Improvement actions**: List with "Jadikan commitment" button for unconverted actions
- **Links**: Tags, linked goals, linked skills
- **Delete**: "Hapus refleksi" link

#### FR-REFLECT-06: Convert Action to Commitment
- **Action**: `convertActionToCommitment(reflectionId, actionId)`
- **Effect**: Create new commitment, mark action as converted with `convertedToCommitmentId`

#### FR-REFLECT-07: Pattern Insights
- **Computation**: `reflectionInsights(reflections, wins, goals, skills)`
- **Output**:
  - Consistency: "X kali berhenti sejenak bulan ini"
  - Word pattern: Most frequent word (≥2 occurrences)
  - Top goal/skill: Most linked goal/skill
  - Wins glow: "X kemenangan kecil bulan ini"
  - Pending actions: Count of unconverted improvement actions

#### FR-REFLECT-08: Wins & Gratitude
- **Create**: Kind (win/gratitude) + text
- **Display**: Chronological list with kind chip and date
- **Delete**: Per item

#### FR-REFLECT-09: Letter to Future Self
- **Create**: Title, body (textarea), sealed until date (default today + 90 days)
- **Display**: Sealed status with countdown or "Buka surat" button when date passed
- **Open**: Set `opened: true` + `openedAt` timestamp

---

### 3.7 Modul Weekly Review (FR-REVIEW)

#### FR-REVIEW-01: Auto Summary
- **Computed lines**:
  - Commitment stats: "X commitment selesai, Y masih aktif"
  - Finance snapshot: "income, expense, net" (IDR short)
  - Skill stagnation: Skill paling lama tidak dilatih + hari
- **Visual**: Bullet list in bordered card

#### FR-REVIEW-02: Review Form
- **4 textareas**: Highlights, Blockers, Finance reflection, Career/skill progress
- **3 focus inputs**: 1–3 fokus minggu depan
- **Submit**: `addReview()` → save + reset form + success indicator

#### FR-REVIEW-03: Review History
- **Display**: List of past reviews with date, highlight excerpt, next-week focus chips
- **Ordering**: Newest first

---

### 3.8 Cross-Module Features (FR-CROSS)

#### FR-CROSS-01: Command Palette
- **Trigger**: `Ctrl/Cmd + K` atau klik tombol sidebar
- **Library**: cmdk 1.0
- **Groups**:
  - Navigasi: 6 halaman dengan icon dan keywords Bahasa Indonesia
  - Quick add: Commitment, Goal, Transaction, Milestone, Skill, Reminder
  - Preferensi: Toggle dark/light mode
- **Behavior**: Keyboard navigation, Esc to close, auto-close on action

#### FR-CROSS-02: Quick Add Modal
- **6 types**: Commitment, Goal, Transaction, Career Milestone, Skill, Reminder
- **Type tabs**: Pill buttons, switch form fields per type
- **Animation**: Scale + y spring transition (Framer Motion)
- **Notification**: "Data tersimpan" notification on success

#### FR-CROSS-03: Notifications Drawer
- **Trigger**: Bell icon in TopBar
- **Display**: Right-side sliding drawer with notification list
- **Per item**: Title, body, relative time (date-fns locale id), tone-colored border
- **Actions**: Mark read per click, "Tandai semua telah dibaca"

#### FR-CROSS-04: Autosave
- **Strategy**: Debounced 800ms persist to localStorage after every mutation
- **Indicator**: TopBar shows "Saving…" → "Saved" (1.5s) → "Autosave aktif"
- **Failure**: "Save failed" with terracotta color

#### FR-CROSS-05: Theme Toggle
- **Modes**: Light (default), Dark
- **Method**: Toggle `dark` class on `<html>` element
- **Palette**: Custom-designed night palette, not CSS invert
- **Persist**: Via Zustand store → localStorage

#### FR-CROSS-06: Responsive Layout
- **Breakpoints** (Tailwind):
  - `< lg` (1024px): Mobile — sidebar hidden, hamburger menu
  - `≥ lg`: Desktop — sidebar sticky, 268px + content grid
- **Sidebar**: Fixed overlay on mobile with backdrop blur

---

## 4. Kebutuhan Non-Fungsional

### 4.1 Performance (NFR-PERF)
| ID | Requirement | Target |
|---|---|---|
| NFR-PERF-01 | First Contentful Paint | < 2 detik (3G) |
| NFR-PERF-02 | Time to Interactive | < 4 detik (3G) |
| NFR-PERF-03 | localStorage read | < 50ms |
| NFR-PERF-04 | localStorage write | < 100ms per mutation |
| NFR-PERF-05 | Chart rendering | < 500ms untuk 6 bulan data |

### 4.2 Usability (NFR-USE)
| ID | Requirement |
|---|---|
| NFR-USE-01 | Semua interactive elements memiliki focus-visible outline |
| NFR-USE-02 | Keyboard navigation full: Tab, Enter, Escape |
| NFR-USE-03 | Touch target minimum 44×44px pada mobile |
| NFR-USE-04 | Reduced motion respected via `prefers-reduced-motion` |
| NFR-USE-05 | Text contrast ratio ≥ 4.5:1 (WCAG AA) |

### 4.3 Reliability (NFR-REL)
| ID | Requirement |
|---|---|
| NFR-REL-01 | Data tidak hilang saat browser crash (localStorage persist) |
| NFR-REL-02 | Autosave failure menampilkan status dan mempertahankan input |
| NFR-REL-03 | Reseed tersedia untuk reset ke seed data asli |

### 4.4 Security (NFR-SEC)
| ID | Requirement |
|---|---|
| NFR-SEC-01 | X-Frame-Options: SAMEORIGIN di semua response |
| NFR-SEC-02 | Referrer-Policy: no-referrer-when-downgrade |
| NFR-SEC-03 | Supabase RLS aktif — setiap tabel hanya bisa diakses oleh pemilik |
| NFR-SEC-04 | API keys hanya di server-side env, bukan di client bundle |
| NFR-SEC-05 | Refleksi bersifat privat — `isPrivate: true` default |

### 4.5 Compatibility (NFR-COMP)
| ID | Requirement |
|---|---|
| NFR-COMP-01 | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| NFR-COMP-02 | iOS Safari (mobile), Chrome Android |
| NFR-COMP-03 | Responsive dari 320px hingga 2560px |

### 4.6 Maintainability (NFR-MAIN)
| ID | Requirement |
|---|---|
| NFR-MAIN-01 | Code terstruktur per page (App Router convention) |
| NFR-MAIN-02 | Single source of truth di Zustand store |
| NFR-MAIN-03 | Selector functions terpisah di `insights.js` (pure, testable) |
| NFR-MAIN-04 | Format utilities terpusat di `format.js` |
| NFR-MAIN-05 | Seed data terisolasi di `seed.js` |

---

## 5. Data Dictionary

### 5.1 User
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key, matches auth uid |
| fullName | string | ✅ | Display name |
| headline | string | | Tagline di sidebar |
| locale | string | | Default: "id-ID" |
| currency | string | | Default: "IDR" |
| targetRole | string | | Target career role |

### 5.2 Goal
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| area | string | ✅ | career / finance / skills / business / growth |
| title | string | ✅ | Goal title |
| why | string | | Motivation text |
| priority | string | | low / medium / high |
| status | string | ✅ | planned / in_progress / completed / archived |
| targetDate | string | | ISO date |
| metric | object | | { current, target, unit } |
| contributions | array | | [{key, label, weight, value}] |
| milestones | array | | [{id, label, target, achieved, achievedAt}] |
| progress | number | | 0–100 |
| notes | string | | Free text |

### 5.3 Career Milestone
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| title | string | ✅ | Milestone title |
| type | string | ✅ | education / certificate / experience / project / skill / target |
| month | number | | 1–12 |
| year | number | | e.g., 2026 |
| organization | string | | Issuer / employer |
| description | string | | Details |
| skills | string[] | | Related skill names |
| evidenceUrl | string | | Proof link |
| status | string | | planned / in_progress / completed |
| contribution | number | | 0–30, % contribution to career goal |

### 5.4 Portfolio Project
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| title | string | ✅ | Project title |
| tools | string[] | | Technology stack |
| status | string | | in_progress / shipped |
| link | string | | Project URL |
| impact | string | | Impact description |
| caseStudy | string | | Case study narrative |

### 5.5 Skill
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| name | string | ✅ | Skill name |
| category | string | ✅ | technical / data / business / financial / communication / career |
| level | number | ✅ | 1–5 |
| target | number | | Target level (1–5) |
| momentum | number | | 0–100, practice momentum |
| relatedToRole | boolean | | Linked to Data Analyst target |
| lastPracticedAt | string | | ISO date of last practice |
| plan | string | | Learning plan text |
| resourceUrl | string | | Learning resource link |

### 5.6 Transaction
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| title | string | ✅ | Description |
| type | string | ✅ | income / expense |
| category | string | ✅ | See TX_CATEGORIES in seed.js |
| amount | number | ✅ | Amount in IDR |
| date | string | ✅ | ISO date |
| notes | string | | Additional notes |
| recurring | boolean | | Is recurring transaction |

### 5.7 Budget
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| category | string | ✅ | Expense category |
| limit | number | ✅ | Budget limit in IDR |
| month | string | ✅ | "YYYY-MM" format |

### 5.8 Reminder
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| title | string | ✅ | Reminder title |
| amount | number | | Expected amount in IDR |
| category | string | ✅ | Expense category |
| cadence | string | | monthly / quarterly / yearly / once |
| dueDay | number | | Day of month (1–31) |
| active | boolean | | Toggle on/off |
| notes | string | | Additional notes |

### 5.9 Commitment
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| title | string | ✅ | Commitment text |
| area | string | | Life area |
| dueDate | string | | ISO date |
| done | boolean | ✅ | Completion status |
| priority | string | | low / medium / high |

### 5.10 Reflection
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| kind | string | ✅ | quick / deep |
| template | string | | For deep: career / finance / growth / decision / gratitude |
| moodWord | string | | One-word mood |
| currentState | string | | Quick: current condition |
| whatWentWell | string | | Quick: positive highlights |
| whatFeltHeavy | string | | Quick: challenges |
| lesson | string | | Quick: key learning |
| smallStep | string | | Quick: next small step |
| answers | object | | Deep: {promptKey: answerText} |
| linkedGoals | string[] | | Array of goal IDs |
| linkedSkills | string[] | | Array of skill IDs |
| tags | string[] | | Free-form tags |
| improvementActions | array | | [{id, text, convertedToCommitmentId}] |
| isPrivate | boolean | | Default: true |

### 5.11 Weekly Review
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| weekOf | string | ✅ | ISO date (Monday of the week) |
| highlights | string | | What went well |
| blockers | string | | What blocked progress |
| finance | string | | Finance reflection |
| careerProgress | string | | Career/skill update |
| nextWeekFocus | string[] | | 1–3 focus items |

### 5.12 Notification
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| title | string | ✅ | Notification title |
| body | string | | Detail text |
| tone | string | | info / warning / success |
| read | boolean | ✅ | Read status |

### 5.13 Activity Log
| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✅ | Primary key |
| userId | string | ✅ | Owner |
| kind | string | | goal / finance / skill / career / review / reflection |
| message | string | ✅ | Activity description |

---

## 6. Validation Rules

### 6.1 Transaction
- `title`: required, non-empty after trim
- `amount`: required, numeric, ≥ 0
- `date`: required, valid ISO date
- `type`: must be "income" or "expense"
- `category`: must exist in TX_CATEGORIES[type]

### 6.2 Goal
- `title`: required, non-empty after trim
- `area`: must be one of LIFE_AREAS keys
- `priority`: must be "low", "medium", or "high"
- `status`: must be "planned", "in_progress", "completed", or "archived"

### 6.3 Career Milestone
- `title`: required, non-empty
- `type`: must be one of CAREER_TYPES keys
- `month`: 1–12
- `year`: 2000–2100
- `contribution`: 0–30

### 6.4 Skill
- `name`: required, non-empty
- `level`: 1–5
- `target`: 1–5, ≥ level

### 6.5 Budget
- `category`: must exist in TX_CATEGORIES.expense
- `limit`: numeric, > 0
- `month`: valid "YYYY-MM" format

---

## 7. Traceability Matrix

| Requirement | UI Component | Store Action | Page |
|---|---|---|---|
| FR-DASH-02 | Today's Focus card | toggleCommitment | page.js (root) |
| FR-GOAL-06 | Quick Add Modal | addGoal | goals/page.js |
| FR-CAREER-03 | Timeline + nodes | - | career/page.js |
| FR-FIN-07 | Transaction list | addTransaction, removeTransaction | finance/page.js |
| FR-SKILL-03 | Catat sesi button | practiceSkill | skills/page.js |
| FR-REFLECT-02 | Quick form | addReflection | reflection/page.js |
| FR-REVIEW-02 | Review form | addReview | review/page.js |
| FR-CROSS-01 | CommandPalette | openPalette, closePalette | components/CommandPalette.jsx |
| FR-CROSS-02 | QuickAddModal | (per type) | components/QuickAddModal.jsx |
| FR-CROSS-03 | NotificationsDrawer | markNotificationRead, clearNotifications | components/NotificationsDrawer.jsx |

---

*Dokumen ini di-generate dari analisis lengkap codebase pada 17 Juli 2026.*
