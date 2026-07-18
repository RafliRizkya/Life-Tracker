# 📋 Product Requirements Document (PRD)

## Rafli Life Tracker — Personal Life Operating System

| Field | Value |
|---|---|
| **Versi** | 2.1 |
| **Tanggal** | 18 Juli 2026 |
| **Author** | Rafli Akbar |
| **Status** | Phase 1 — Released |
| **Repo** | [RafliRizkya/Life-Tracker](https://github.com/RafliRizkya/Life-Tracker) |

---

## 1. Ringkasan Produk

**Rafli Life Tracker** adalah *personal life operating system* yang menggabungkan **Career Journey**, **Finance**, **Goals**, **Skills**, dan **Life Compass** (refleksi + ritual mingguan) dalam satu tempat yang tenang, hangat, dan personal.

Aplikasi ini dirancang khusus untuk **Rafli Akbar**, seorang profesional yang sedang membangun karier sebagai **Data Analyst**, menyusun keuangan menuju Financial Freedom, dan menaikkan skill secara sadar.

> **Filosofi**: Tenang, hangat, editorial — bukan spreadsheet perusahaan.

---

## 2. Problem Statement

Rafli membutuhkan satu tempat terpadu untuk:

- **Melacak perjalanan karier** dari self-taught hingga menjadi Data Analyst
- **Mengatur keuangan** (income, expense, saving rate, spending score) dalam IDR
- **Menetapkan & memantau goals** hidup yang hierarkis dan terukur
- **Mengasah skills** secara deliberate dengan momentum tracking
- **Life Compass**: refleksi diri yang privat & berpola, plus ritual mingguan (Past/Present/Future) dengan momentum/burnout indicator dan narasi mingguan otomatis

---

## 3. Target User

| Aspek | Detail |
|---|---|
| **Persona** | Rafli Akbar — single user (Phase 1) |
| **Usia** | Profesional muda |
| **Bahasa** | Indonesia sebagai default, istilah Inggris untuk yang lebih natural |
| **Perangkat** | Mobile-first, desktop-supported |
| **Currency** | Rupiah (IDR) dengan `Intl.NumberFormat("id-ID")` |

---

## 4. User Stories & Acceptance Criteria

### 4.1 Dashboard
| ID | User Story | AC |
|---|---|---|
| US-01 | Sebagai Rafli, saya ingin melihat greeting berdasarkan waktu hari ini | Greeting berubah: pagi/siang/sore/malam/larut |
| US-02 | Saya ingin melihat Today's Focus — satu prioritas bermakna | Menampilkan commitment `priority: high` pertama yang belum done |
| US-03 | Saya ingin melihat Life Pulse (4 metrik sekaligus) | Career readiness, Skill momentum, Saving rate, Spending score |
| US-04 | Saya ingin melihat North Star career readiness breakdown | 6 parts: skills, portfolio, experience, certificates, network, applications |
| US-05 | Saya ingin melihat financial snapshot bulan ini | Net savings, income, expense, saving rate |
| US-06 | Saya ingin melihat Savings Ladder progress | Visualisasi milestone Rp10jt → Rp100jt |
| US-07 | Saya ingin melihat rule-based insights | Insights dari data: savings trend, SQL stale, portfolio progress, BPJS, korelasi lintas-modul (stres↔pengeluaran, energi↔goal velocity, milestone karier↔energi), plus sinyal engagement gap yang tenang bila ritual/refleksi lewat 2+ minggu — semua hanya muncul bila datanya mendukung |
| US-08 | Saya ingin melihat commitments aktif & reminders keuangan | List commitment toggleable + finance reminders |

### 4.2 Goals
| ID | User Story | AC |
|---|---|---|
| US-09 | Saya ingin melihat semua goals dengan filter per life-area | Filter: career, finance, skills, business, growth |
| US-10 | Saya ingin melihat progress setiap goal | Progress bar + persentase, computed dari data nyata |
| US-11 | Saya ingin membuat goal baru via Quick Add | Form: title, area, priority, why, target date |
| US-12 | Saya ingin melihat detail goal di drawer | Progress %, metric, breakdown kontribusi, milestones |
| US-13 | Saya ingin mengarsipkan goal | Goal berpindah ke status archived, tidak tampil di list utama |
| US-14 | Saya ingin savings ladder dengan milestone checklist | Toggle achieved per milestone (Rp10jt, 20jt, ... 100jt) |
| US-54 | Saya ingin goal ber-area skills/career/finance jujur soal buktinya | Chip "belum ada bukti" bila tak ada aktivitas area terkait dalam 14 hari; "on track" mensyaratkan bukti; goal growth/business/baru dibuat exempt (`docs/features/goal-evidence.md`) |

### 4.3 Career
| ID | User Story | AC |
|---|---|---|
| US-15 | Saya ingin melihat career journey dalam dua jalur terpisah, dengan title/tanggal/preview langsung terbaca tanpa klik | Dua lane berdampingan — "Jejak Profesional" (pengalaman kerja, kronologis) dan "Milestone & Pencapaian" (pendidikan/sertifikasi) — tiap kartu menampilkan title, organisasi, rentang tanggal + durasi, dan deskripsi singkat langsung; klik hanya untuk detail/highlight lengkap |
| US-16 | Saya ingin filter timeline berdasarkan type & range waktu | Type: education, certificate, experience, project, skill, target |
| US-17 | Saya ingin menambah milestone baru | Via Quick Add atau tombol di page — termasuk lokasi dan status "masih berlangsung" |
| US-18 | Saya ingin edit detail milestone di drawer | Bulan/tahun mulai & selesai (atau "Sekarang"), organization, lokasi, description singkat, detail/highlight (multi-baris), skills, evidence URL, status, contribution |
| US-19 | Saya ingin melihat Portfolio tracker | List project dengan status shipped/in_progress, tools, impact, case study |
| US-20 | Saya ingin melihat Skills gap terhadap Data Analyst | Skill level vs target per skill yang relatedToRole |

### 4.4 Finance
| ID | User Story | AC |
|---|---|---|
| US-21 | Saya ingin melihat net savings bulan ini dengan savings ring | Angka besar + animated SVG ring |
| US-22 | Saya ingin melihat scorecards (income/expense/saving rate/spending score) | 4 kartu dengan hints |
| US-23 | Saya ingin melihat cashflow trend 6 bulan | Bar chart income vs expense via Recharts |
| US-24 | Saya ingin melihat spending by category | Donut chart + legend |
| US-25 | Saya ingin membuat budget per kategori per bulan | Form inline + progress bar + indikator over-budget |
| US-26 | Saya ingin mengelola reminders keuangan | BPJS, sedekah, service motor, review bulanan — toggle on/off, delete |
| US-27 | Saya ingin mencatat transaksi (income/expense) | Quick Add: title, type, category, amount, date, notes |
| US-28 | Saya ingin export transaksi ke CSV | Tombol Export CSV → download file |

### 4.5 Skills
| ID | User Story | AC |
|---|---|---|
| US-29 | Saya ingin melihat Skill Garden dengan level dots (1–5) | Grid card per skill dengan visual dots |
| US-30 | Saya ingin filter skill berdasarkan kategori | Technical, Data, Business, Financial, Communication, Career |
| US-31 | Saya ingin mencatat sesi latihan (practice) | Tombol "Catat sesi" → update lastPracticedAt + momentum |
| US-32 | Saya ingin naik level skill | Tombol "Naik level" → level + 1 (max 5) |
| US-33 | Saya ingin melihat skill detail drawer | Level ±, target, learning plan, resource URL, relatedToRole toggle |
| US-34 | Saya ingin rekomendasi action berikutnya | Banner rekomendasi: "Perdalam SQL joins, lalu jadikan portfolio" |

### 4.6 Life Compass (`/compass` — merged Reflection + Weekly Review, 2026-07-18)

Lima tab: **Ritual Mingguan** (default), Berbenah, Timeline, Wins & Gratitude, Surat untuk Diri. Filosofi Past (recognition) / Present (grounding) / Future (trajectory). Detail arsitektur & keputusan desain: `docs/features/life-compass.md`.

| ID | User Story | AC |
|---|---|---|
| US-35 | Saya ingin ritual mingguan dengan draft narasi otomatis yang bisa saya edit | "Hero's Journey" — paragraf rule-based (bukan LLM) dari wins/refleksi/commitment minggu ini, mengisi field highlights, sepenuhnya editable |
| US-36 | Saya ingin mencatat kondisi saat ini tanpa harus menulis panjang | Mood word (10 pilihan), energi (1–5), stres (1–5) |
| US-37 | Saya ingin tahu apakah saya sedang momentum atau berisiko burnout | Indikator dari tren energi/stres 2–3 ritual terakhir + jumlah commitment aktif; jujur menampilkan "belum cukup data" jika riwayat kurang |
| US-38 | Saya ingin melihat bagaimana refleksi kecil terhubung ke goal besar | "Efek kupu-kupu" — goal yang paling sering direfleksikan ditautkan ke progress live-nya |
| US-39 | Saya ingin mencatat blocker, refleksi keuangan, progres karier, dan fokus minggu depan | 3 textarea + 1–3 input fokus, tersimpan ke histori ritual kronologis |
| US-40 | Saya ingin menulis refleksi Quick (2 menit) | Form: mood word, kondisi, baik, berat, pelajaran, langkah kecil |
| US-41 | Saya ingin menulis Deep Reflection dengan template | 5 template: Career, Finance, Growth, Decision, Gratitude |
| US-42 | Saya ingin menambahkan improvement actions ke refleksi dan mengubahnya jadi commitment | 1–3 aksi kecil per refleksi, tombol "Jadikan commitment" |
| US-43 | Saya ingin melihat timeline refleksi dengan pattern insights | Filter per template; word frequency, top goal/skill, wins count, pending actions |
| US-44 | Saya ingin mencatat Wins & Gratitude | Tab terpisah untuk catat kemenangan kecil dan rasa syukur |
| US-45 | Saya ingin menulis Surat untuk Diri yang akan datang | Letter sealed sampai tanggal tertentu (default 90 hari) |
| US-46 | Saya ingin draft refleksi auto-saved ke localStorage | Autosave indicator: menyimpan/tersimpan/gagal |
| US-47 | Saya ingin refleksi & ritual mingguan saya tetap privat terhadap Asisten AI | Hanya data agregat (`reflectionInsights()`/`reviewInsights()`) yang boleh dikirim ke AI, tidak pernah teks mentah |
| US-55 | Saya ingin fokus minggu lalu ditagih dengan jujur saat ritual baru | Prompt "Dari ritual sebelumnya" untuk fokus 1–3 minggu terakhir yang belum di-resolve; aksi per item: sudah jalan / bawa ke minggu ini / lepaskan dengan sadar |

### 4.8 Cross-Module Features
| ID | User Story | AC |
|---|---|---|
| US-48 | Saya ingin Command Palette (Ctrl/Cmd + K) | Navigasi + quick-add + theme toggle |
| US-49 | Saya ingin menerima notifikasi persisten | Drawer kanan, mark-read per item, tandai semua terbaca |
| US-50 | Saya ingin autosave di semua form | Status: Saving → Saved → idle, debounce 800ms |
| US-51 | Saya ingin dark mode yang dirancang | Night forest palette, bukan sekadar inverted |
| US-52 | Saya ingin semua animasi menghormati reduced-motion | `prefers-reduced-motion: reduce` → animasi dimatikan |
| US-53 | Saya ingin mobile-first responsive design | Semua page didesain untuk layar 390px ke atas |

---

## 5. Feature Modules Summary

| # | Modul | Halaman | Entitas Utama |
|---|---|---|---|
| 1 | **Dashboard** | `/` | Commitments, Insights, Life Pulse |
| 2 | **Goals** | `/goals` | Goals (15 seed), Savings Ladder |
| 3 | **Career** | `/career` | Career Milestones, Portfolio, Skills Gap |
| 4 | **Finance** | `/finance` | Transactions, Budgets, Reminders |
| 5 | **Skills** | `/skills` | Skills (8 seed), Practice Log |
| 6 | **Life Compass** (merged Reflection + Weekly Review) | `/compass` | Reflections (Quick/Deep), Wins, Letters, Reviews (Ritual Mingguan) |
| 7 | **AI Assistant** (MVP, Phase 3 dibangun lebih awal) | `/ai` | Chat thread (single, persisted), read-only Q&A lintas semua modul |
| 8 | **Guideline** (2026-07-19) | `/guide` | Tutorial interaktif 8 bagian — tombol "coba langsung" memicu aksi nyata (Quick Add per tipe, Command Palette, navigasi), progress "dipahami" persisted lokal |

---

## 6. Design Principles

1. **Tenang, hangat, editorial** — bukan spreadsheet perusahaan
2. **Mobile-first** — hierarki jelas, bukan desktop yang dipersempit
3. **Motion halus & bermakna** — stagger reveal, growing line, ring animation
4. **Accessibility** — focus visible, keyboard-friendly, reduced-motion, kontras cukup
5. **Bahasa Indonesia** — dengan istilah Inggris natural (Dashboard, Goals, Career)
6. **Semua nominal Rupiah** — formatted dengan `Intl.NumberFormat("id-ID")`
7. **Dark mode dirancang** — night forest + lime accent palette

---

## 7. Design System

| Token | Light | Dark |
|---|---|---|
| Background | `#f5f2ea` (paper) | `#0f1613` (night) |
| Card | `#fffdf8` | `#161f1a` (night-card) |
| Ink | `#1d2b24` | `#e6ebe1` |
| Muted | `#718078` | `#8a9a90` |
| Accent | `#315d48` (forest) | `#a8c845` (lime) |
| Lime | `#d5eb7e` | `#d5eb7e` |
| Terra | `#eb9b63` | `#eb9b63` |

**Typography:**
- **Display**: Playfair Display 500/600/700 (headings)
- **Reflect**: Instrument Serif 400 (reflections, italic)
- **Interface**: DM Sans 400/500/600/700
- **Mono**: DM Mono 400/500 (data, eyebrows)

---

## 8. Seed Data

| Data | Jumlah | Contoh |
|---|---|---|
| Goals | 15 | "Terjun ke Data Analyst", "Tabungan bertahap Rp10jt→100jt" |
| Career Milestones | 13 | Data nyata dari resume: 6 pengalaman kerja (PT PLN → ... → PT. Pipamas Primasejati), 2 pendidikan, 5 sertifikasi |
| Portfolio | 2 | Retail Sales Dashboard, Personal Cashflow Analytics |
| Skills | 8 | SQL & Querying, Data Analysis, Python, Business Acumen |
| Transactions | 6 bulan | Gaji Rp2.9jt→3.25jt, expenses per kategori |
| Budgets | 4 | Food 900K, Transport 400K, Learning 300K, Fun 250K |
| Reminders | 4 | BPJS 150K, Sedekah 2.5%, Service motor, Review bulanan |
| Commitments | 5 | SQL joins, LinkedIn update, Catat pengeluaran |
| Reflections | 2 | 1 Quick + 1 Deep (Career) |
| Wins | 4 | 2 wins + 2 gratitude |
| Letters | 1 | Surat untuk Rafli 3 bulan lagi |
| Notifications | 3 | BPJS warning, SQL reminder, Spending score success |
| Reviews | 1 | Previous week review |

---

## 9. Non-Functional Requirements

| Aspek | Requirement |
|---|---|
| **Performance** | First paint < 2s, interactive < 4s pada 3G |
| **Responsiveness** | Fungsional penuh dari 390px (mobile) hingga desktop |
| **Persistence** | localStorage (Phase 1), Supabase-ready schema |
| **Accessibility** | Focus visible, keyboard navigation, reduced-motion, kontras ≥ 4.5:1 |
| **Security** | RLS di Supabase, no credential in frontend env, X-Frame-Options |
| **Privacy** | Semua data lokal di browser user (Phase 1) |
| **Export** | CSV untuk transaksi keuangan |

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS 3 |
| Motion | Framer Motion 11 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| Command Palette | cmdk 1.0 |
| State Management | Zustand 5 + localStorage persistence |
| Utilities | clsx, nanoid, date-fns |
| Data (Optional) | Supabase (Auth + Postgres + Storage) |
| AI | OpenRouter (free-tier models only), react-markdown + remark-gfm |
| Backend | FastAPI health-check stub |
| Auth | Single seeded user (Phase 1); schema multi-user ready |

---

## 11. Roadmap

| Phase | Status | Scope |
|---|---|---|
| **Phase 1** | ✅ Released | 7 modul, dark mode, mobile-first, seed lengkap, Command Palette, Notifications, Autosave, CSV Export |
| **Phase 2** | ⏳ Planned | Supabase Auth aktif, sync realtime, storage bukti (certificate PDF), WhatsApp → Finance quick-add (⏸️ paused, menunggu nomor WhatsApp Business — lihat `docs/features/whatsapp-integration.md`) |
| **Phase 3** | 🔶 Sebagian dibangun | AI assistant chat (✅ MVP dibangun lebih awal dari roadmap, via OpenRouter free-tier — lihat `docs/features/ai-assistant.md`), mood/energy check-in (✅ dibangun lebih awal sebagai bagian Life Compass Ritual Mingguan — lihat `docs/features/life-compass.md`), search global, reading tracker, exercise tracker |
| **Phase 4** | ⏳ Planned | Import LinkedIn / GitHub API opsional |

---

## 12. Backlog (Prioritized)

| Priority | Item |
|---|---|
| P1 | Live sync ke Supabase — wire mutations ke Supabase saat env tersedia |
| P1 | Storage bukti — evidence file upload untuk certificate/portfolio |
| P1 | Global search — Ctrl+K sudah nav + quick-add; belum full-text search |
| P1 (⏸️ paused) | WhatsApp → Finance quick-add — kode & schema sudah selesai dan teruji, menunggu nomor WhatsApp Business. Detail: `docs/features/whatsapp-integration.md` |
| ✅ Built | AI assistant chat — MVP shipped ahead of roadmap via OpenRouter (free-tier only), read-only Q&A over semua modul. Detail: `docs/features/ai-assistant.md`. Lanjutan (agents, forecasting, artifact generation, multi-conversation) masih P2 |
| ✅ Built | Mood/energy check-in — shipped ahead of roadmap as Life Compass's Ritual Mingguan (mood word, energi/stres 1–5, Momentum vs Burnout indicator). Detail: `docs/features/life-compass.md` |
| ✅ Built | Cross-Signal Correlation Engine — 3 rule-based korelasi lintas-modul di Dashboard (stres↔pengeluaran, energi↔goal velocity, milestone karier↔energi). Detail: `docs/features/correlation-engine.md`. Konsumen lanjutan (Life Score, Retrospective/Chapter View) masih brief terpisah |
| ✅ Built | "Maksa growth" trio — engagement gap signal (Dashboard, `correlation-engine.md`), ritual follow-up "nagih ke masa lalu" (`life-compass.md`), goal evidence requirement (`goal-evidence.md`) |
| P2 | Import LinkedIn / GitHub CSV |
| P2 | Reading tracker, exercise tracker |
| P3 | Multi-user + Supabase Auth aktif |

---

## 13. Success Metrics

| Metric | Target |
|---|---|
| Rafli mengisi Ritual Mingguan (Life Compass) | ≥ 3x per bulan |
| Transaksi finance tercatat | ≥ 80% dari pengeluaran nyata |
| Skill practice session | ≥ 4x per minggu |
| Refleksi disimpan | ≥ 2x per minggu |
| Career milestone di-update | Setiap ada pencapaian baru |

---

*Dokumen ini di-generate dari analisis lengkap codebase pada 17 Juli 2026, diperbarui 18 Juli 2026 untuk mencerminkan Life Compass (merged Reflection + Weekly Review) dan redesign Career Journey dual-track.*
