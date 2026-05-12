Summary — Rebuild Sego Pedes Basman ke CLAUDEE.md
Infrastructure & Setup
Next.js upgrade ke 14.2.29 (fix bug font Windows)
Ganti next.config.ts → next.config.mjs
PostgreSQL 18 diinstall langsung (port 5433, bukan Docker karena virtualization disabled)
Upstash Redis (cloud) sebagai pengganti Docker Redis + TLS config di redis.module.ts
.env diupdate dengan kredensial baru
Database
Prisma schema di-rewrite total sesuai CLAUDEE.md:
User: username (bukan email), nama, UserRole
Kategori: model terpisah (bukan enum)
Menu: harga Decimal, availability, relasi ke Kategori
Order: nomorAntrian + namaPelanggan langsung di Order, hapus model Queue
OrderItem: hargaSatuan + subtotal Decimal
Hapus model DailyReport
Migrasi ulang + seed: admin/kasir + 4 kategori + 12 menu
Backend (NestJS)
Module	Perubahan
Auth	Login pakai username, JWT payload berubah
Users	CRUD pakai username + nama
Kategori ✨	Module baru — CRUD lengkap, role Admin
Menu	Pakai kategoriId relasi, availability enum, Decimal harga
Orders	nomorAntrian auto-increment harian, endpoint /order/:id/receipt (cetak struk), complete, cancel
Queue	Disederhanakan — hanya read dari Order yang AKTIF, tanpa Redis counter
Reports	Endpoint tunggal /report/sales?period=daily|weekly|monthly + top 5 menu terlaris
Gateway	Events baru: queue:updated, menu:availability-changed, order:created, order:completed + subscribe rooms (display, kasir)
Frontend (Next.js)
Struktur route baru

/login
/display                    → TV publik (auto-switch 10s)
/kasir/transaksi            → input pesanan + struk
/kasir/antrian              → kelola antrian aktif
/admin/menu                 → CRUD menu + toggle tersedia/habis
/admin/kategori             → CRUD kategori
/admin/laporan              → harian/mingguan/bulanan + top menu
Perubahan utama
authStore: user pakai nama + username (bukan email)
useAuth: redirect otomatis — Admin → /admin/menu, Kasir → /kasir/transaksi
Login page: field username (bukan email)
Display TV:
Auto-switch antara halaman antrian ↔ menu setiap 10 detik
Nomor antrian besar + nama pelanggan
Menu HABIS tampak tapi di-dim + label
Real-time via WebSocket
Kasir transaksi:
Grid menu + keranjang + filter kategori
Validasi nama pelanggan (wajib, min 2 karakter)
Otomatis generate struk setelah submit (print-friendly)
Kasir antrian:
List pesanan AKTIF + tombol Selesai/Batal
Real-time update via WebSocket
Admin menu:
Grouped by kategori
Toggle tersedia/habis inline
Modal form tambah/edit
Admin kategori: CRUD lengkap dengan urutan tampil
Admin laporan:
Filter periode (harian/mingguan/bulanan) + date picker
4 stat cards + top 5 menu terlaris
File lama yang masih ada (tidak dipakai)
/menu, /order, /queue (public pages lama)
/dashboard/* (struktur lama)
Komponen di components/menu, components/orders, components/queue
Bisa dihapus manual jika mau bersih, tapi tidak mengganggu karena tidak di-route.

Status
✅ Backend compile tanpa error, Redis terhubung (Upstash), database seeded
✅ Frontend struktur route baru sudah dibuat, siap di-run
⏳ Next step: jalankan npm run dev di frontend, test flow lengkap

Akun Demo
Admin: admin / admin123
Kasir: kasir / kasir123