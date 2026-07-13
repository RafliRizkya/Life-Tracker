# Rafli Life Tracker

> A quiet, editorial life operating system — untuk Rafli, sedang membangun karier
> Data Analyst, menyusun keuangan, dan menaikkan skill dengan lebih sadar.

Aplikasi ini bukan sekadar habit tracker. Ia menggabungkan **Career journey**,
**Finance**, **Goals**, **Skills** dan **Weekly Review** dalam satu tempat yang
tenang, hangat, dan personal.

---

## Highlight fitur

- **Dashboard adaptif** — greeting berdasarkan waktu, "Today's Focus" satu prioritas
  bermakna, Life Pulse (career readiness, skill momentum, saving rate, spending
  score), rule-based insights berbasis data, savings ladder, small wins.
- **Career Journey imersif** — timeline vertikal dengan "growing line", stagger
  reveal per node, node berwarna sesuai status (completed / in progress / planned)
  dan tipe (education, certificate, experience, project, skill, target role).
  Filter berdasarkan type dan rentang waktu. Detail drawer editable dengan
  month + year, organisasi, deskripsi, skill terkait, evidence URL, kontribusi.
- **Goals hierarki** — 15 goal seed sesuai narasi Rafli, dengan life-area filter,
  progress dihitung dari beberapa sumber data (skills, portfolio, experience,
  network, applications untuk goal Data Analyst; savings ladder untuk tabungan
  bertahap), archive, dan detail drawer dengan breakdown "kenapa 42% dibangun".
- **Finance premium** — Rupiah, cashflow chart 6 bulan, spending-by-category donut,
  scorecards (income/expense/saving rate/spending score), animated savings ring,
  budget per kategori dengan indikator over-budget, reminders bawaan
  (BPJS Rp150.000, Sedekah 2.5%, Service motor, Review bulanan) yang bisa
  ditoggle, export CSV, dan seluruh update otomatis merefleksi ke Dashboard.
- **Skills constellation** — level 1–5 per skill, kategori, terhubung ke role,
  "catat sesi" untuk mengasah momentum, learning plan, resource, rekomendasi
  action berikutnya.
- **Weekly Review** — ringkasan otomatis dari minggu berjalan, form refleksi
  4-pertanyaan, 1–3 fokus minggu depan, histori bisa dibaca kembali.
- **Command Palette** (Ctrl/Cmd + K) — navigasi dan quick-add untuk seluruh
  entitas dalam satu tempat.
- **Notifikasi persisten** — tersimpan di store, bisa mark-read per item atau
  tandai semua terbaca.
- **Autosave** dengan indikator Saving / Saved / Failed di TopBar.
- **Dark mode yang dirancang** — bukan sekadar inverted colors, dengan palette
  night forest + lime accent.
- **Reduced-motion** — semua animasi menghormati `prefers-reduced-motion`.
- **Mobile-first** — timeline karier, dashboard, dan finance benar-benar
  didesain untuk layar sempit, bukan versi desktop yang dipersempit.

---

## Tech stack

| Layer      | Choice                                                  |
|------------|---------------------------------------------------------|
| Frontend   | Next.js 14 App Router, React 18, Tailwind CSS           |
| Motion     | Framer Motion                                           |
| Charts     | Recharts                                                |
| Icons      | Lucide React                                            |
| Palette    | cmdk                                                    |
| State      | Zustand + localStorage (persisted)                      |
| Data (opt) | Supabase (Auth + Postgres + Storage) — schema included  |
| Backend    | Minimal FastAPI health-check stub (`/api/health`)       |
| Auth       | Single seeded user (Phase 1); schema multi-user ready   |

---

## Struktur repo

```
/app
├── frontend/                Next.js 14 App Router
│   ├── src/
│   │   ├── app/             Pages (Dashboard, Goals, Career, Finance, Skills, Review)
│   │   ├── components/      Sidebar, TopBar, Modals, Palette, UI primitives
│   │   └── lib/             store.js (Zustand), seed.js, insights.js,
│   │                        format.js, supabase/{client,server}.js
│   ├── package.json         yarn 1.x
│   └── .env                 Public + private frontend env
├── backend/                 FastAPI stub (only /api/health)
├── supabase/
│   └── migrations/          SQL migration + RLS policies (0001_initial_schema.sql)
├── _reference/              Legacy vanilla HTML/JS MVP (arsip)
├── docs/                    Original PRD notes
├── memory/                  PRD + test credentials
├── .env.example             All env vars (frontend + backend + AI)
└── README.md
```

---

## Cara menjalankan

```bash
# Install
cd /app/frontend && yarn install
cd /app/backend  && pip install -r requirements.txt

# Jalankan (Emergent supervisor sudah handle otomatis)
sudo supervisorctl restart frontend backend

# Preview
open http://localhost:3000
```

Aplikasi langsung jalan dengan **seed data lengkap** — tidak perlu Supabase
untuk demo.

---

## Mengaktifkan Supabase (opsional)

1. Buat project di https://supabase.com/dashboard.
2. Jalankan SQL dari `supabase/migrations/0001_initial_schema.sql` di SQL Editor.
3. Salin **Project URL** dan **anon public** key.
4. Isi di `/app/frontend/.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. Restart frontend. Data layer otomatis menggunakan Supabase.

RLS sudah aktif — setiap tabel hanya bisa dibaca/tulis oleh pemilik `user_id`.

---

## Mengaktifkan AI assistant (opsional, Phase 2)

- AI **tidak wajib** — rule-based insights sudah selalu tersedia.
- Bila ingin AI summary untuk Weekly Review / breakdown goal:
  - Set `QWEN_API_KEY` di `/app/backend/.env` (jangan pernah di client).
  - Buat route handler `/api/ai/*` di Next.js yang memanggil backend, backend
    kemudian ke Qwen. Ada fallback aman kalau env belum ada.
- Claude Code / Claude Pro tidak dianggap sebagai Anthropic API — hanya Qwen
  API resmi yang dipakai untuk lapisan AI.

---

## Data & privacy

- **Phase 1**: Semua data user disimpan di `localStorage` browser Rafli.
  Aman untuk demo & pemakaian pribadi.
- **Phase 2 (Supabase)**: Data pindah ke Postgres dengan RLS, siap multi-user
  begitu Supabase Auth diaktifkan.
- **Export**: CSV export tersedia untuk transaksi. Reseed / clear tersedia dari
  store bila diperlukan.

---

## Prinsip UX yang dipegang

- Tenang, hangat, editorial — bukan spreadsheet perusahaan.
- Mobile-first, hierarchy jelas.
- Motion halus & bermakna (stagger reveal, growing line, ring animation).
- Accessibility: focus visible, keyboard-friendly, reduced-motion, kontras cukup.
- Semua nominal Rupiah dengan `Intl.NumberFormat("id-ID")`.
- Bahasa Indonesia sebagai default, istilah Inggris untuk yang lebih natural
  (Dashboard, Goals, Career, Weekly Review).

---

## Roadmap singkat

- ✅ Phase 1 (rilis ini): Semua 6 modul, dark mode, mobile-first, seed lengkap.
- ⏳ Phase 2: Supabase Auth aktif + sync realtime + storage bukti (certificate PDF).
- ⏳ Phase 3: AI assistant opsional (Qwen), search global, mood/energy check-in,
  reading tracker, exercise/movement tracker.
- ⏳ Phase 4: Import LinkedIn / GitHub API opsional (jangan mengklaim data
  spesifik yang belum ada).

---

## Perubahan dari MVP awal

Repo asli (`_reference/`) adalah aplikasi vanilla HTML/CSS/JS dengan state
in-memory. Rilis ini:

1. Menaikkan seluruh app ke **Next.js 14 App Router** dengan struktur profesional.
2. Menambahkan **persistence nyata** (localStorage sekarang, Supabase-ready).
3. Menambahkan **7 modul baru** dan **puluhan fitur** yang tidak ada di MVP.
4. **Redesign menyeluruh** memakai palette yang sama tapi jauh lebih tenang:
   Playfair Display + Instrument Serif + DM Sans + DM Mono, layout editorial,
   whitespace 2× lebih generous, kartu tidak berlebihan, hierarki jelas.
5. **Motion system** konsisten via framer-motion, respect reduced-motion.
6. **Dark mode** yang benar-benar dirancang.
7. Fitur **Command Palette**, **Notifikasi persisten**, **Autosave indicator**,
   **Export CSV**.
8. **Seed data realistis** sesuai narasi Rafli: 15 goals, savings ladder 10→100 jt,
   8 career milestones, 8 skills, 6 bulan transaksi, 4 reminders.
9. **Skema Supabase + RLS** lengkap untuk fase multi-user ke depan.
