# Global Features

Dokumen ini mendefinisikan perilaku lintas-modul untuk Life Tracker Fase 1. Setiap modul yang relevan mengikuti ketentuan di bawah ini; modul tidak perlu mendefinisikannya ulang.

## Command Palette

- Dibuka dengan `Ctrl/Cmd + K` dan dari tombol global di sidebar/header.
- Mendukung navigasi ke halaman, pencarian entitas, dan aksi cepat yang diizinkan capability modul (misalnya `Tambah transaksi` atau `Tambah tugas`).
- Hasil diurutkan: aksi cepat, halaman, lalu data terbaru/tercocok. Navigasi keyboard penuh; `Esc` menutup palette.
- Aksi destructive tidak dijalankan langsung dari palette tanpa dialog konfirmasi.

## Autosave

- Form memakai status `Menyimpan…`, `Tersimpan`, atau `Gagal disimpan` di dekat area edit.
- Perubahan disimpan setelah jeda singkat (debounce ±800 ms) dan juga saat field kehilangan fokus atau pengguna berpindah halaman.
- Kegagalan mempertahankan input lokal dan menawarkan `Coba lagi`; tidak ada data yang dihapus secara diam-diam.
- Tombol simpan manual hanya dipakai bila sebuah langkah memang bersifat final/irreversible.

## Tampilan Data

- Modul yang memiliki koleksi item dapat menawarkan List, Table, dan/atau Kanban sesuai struktur datanya.
- Pilihan tampilan terakhir disimpan per pengguna dan per modul.
- Filter, pencarian, dan urutan diterapkan konsisten di setiap tampilan.
- Kanban hanya tersedia bila item mempunyai status/kolom yang bermakna; Table diprioritaskan untuk data numerik dan ekspor.

## Search

- Pencarian global tersedia melalui Command Palette dan halaman Search; pencarian dalam modul tersedia di toolbar modul.
- Hasil hanya mencakup data yang dapat diakses pengguna dan menjelaskan asal modulnya.
- Pencarian mendukung judul, deskripsi, tag, dan metadata utama; angka dapat dicari sesuai konteks modul.

## Export

- Data tabel dapat diekspor sebagai CSV. Laporan ringkas dapat diekspor sebagai PDF pada fase setelah layout laporan stabil.
- Export menghormati filter, rentang tanggal, dan urutan yang aktif; file menyebut nama modul dan tanggal ekspor.
- Data sensitif (misalnya keuangan) harus memerlukan konfirmasi sebelum dibagikan ke aplikasi lain.

## Notifications

- Notifikasi disimpan sebagai record persisten per pengguna dengan `id`, `type`, `title`, `body`, `link`, `readAt`, dan `createdAt`.
- In-app notification adalah kanal wajib Fase 1. Browser/push/email bukan bagian Fase 1 kecuali diputuskan terpisah.
- Badge menampilkan jumlah notifikasi belum dibaca; pengguna dapat membuka targetnya dan menandai sudah dibaca.
- Reminder dan insight tidak boleh berulang tanpa batas: satu event yang sama memiliki deduplication key dan batas frekuensi.
