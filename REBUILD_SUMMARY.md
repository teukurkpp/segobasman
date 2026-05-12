# Rebuild Summary — Sego Pedes Basman

> Migrasi dari schema awal ke spesifikasi **CLAUDEE.md** (POS-style: Kasir input pesanan + Display TV publik, tanpa public ordering)

---

## 1. Infrastructure & Setup

| Komponen | Konfigurasi |
|----------|-------------|
| **Node.js** | v22.17.0 |
| **Next.js** | Upgrade `14.2.0` → `14.2.29` (fix bug `next/font` di Windows) |
| **Next config** | `next.config.ts` → `next.config.mjs` (Next 14 belum support TS config) |
| **PostgreSQL** | v18 native install (port **5433**) — tidak pakai Docker karena virtualization disabled |
| **Redis** | **Upstash Cloud** dengan TLS — pengganti Docker Redis |
| **Database** | `sego_basman_db` di PostgreSQL 18 |

### File yang diubah untuk infra
- `apps/frontend/next.config.mjs` (baru)
- `apps/backend/.env` (port 5433, kredensial Upstash Redis)
- `apps/backend/src/redis/redis.module.ts` (auto-detect Upstash → enable TLS)

---

## 2. Database — Prisma Schema

### Schema lama → baru

| Aspek | Lama | Baru (CLAUDEE.md) |
|-------|------|-------------------|
| Auth User | `email` + `name` | `username` + `nama` |
| Kategori | Enum hardcoded | Model **`Kategori`** terpisah |
| Harga | `Int` | `Decimal(10,2)` |
| Antrian | Model `Queue` terpisah | Field `nomorAntrian` di `Order` |
| Status Order | MENUNGGU / DIPROSES / SIAP / SELESAI / DIBATALKAN | **AKTIF / SELESAI / DIBATALKAN** |
| Status Menu | `status` (TERSEDIA/HABIS) | `availability` (TERSEDIA/HABIS) |
| `DailyReport` | Model terpisah | Dihapus — laporan dihitung on-the-fly |

### Models final
```
User      (id, username, password, nama, role, isActive)
Kategori  (id, nama, deskripsi, urutan)
Menu      (id, nama, deskripsi, harga, gambar, availability, kategoriId)
Order     (id, nomorAntrian, namaPelanggan, totalHarga, status, kasirId, completedAt)
OrderItem (id, orderId, menuId, quantity, hargaSatuan, subtotal)
```

### Seed data
- Admin: `admin` / `admin123`
- Kasir: `kasir` / `kasir123`
- 4 Kategori: Nasi Pedas, Gorengan, Minuman, Paket
- 12 Menu dengan harga & deskripsi

---

## 3. Backend (NestJS)

### Module yang di-rebuild

| Module | Status | Endpoints utama |
|--------|--------|----------------|
| **Auth** | ♻️ Rewrite | `POST /auth/login` (username), `GET /auth/me` |
| **Users** | ♻️ Update field | `GET/POST/PATCH/DELETE /users` |
| **Kategori** | ✨ Baru | `GET/POST/PATCH/DELETE /kategori` |
| **Menu** | ♻️ Rewrite | `GET /menu`, `PATCH /menu/:id/availability` |
| **Orders** | ♻️ Rewrite | `POST /order`, `GET /order/active`, `PATCH /order/:id/complete\|cancel`, `GET /order/:id/receipt` |
| **Queue** | ♻️ Simplified | `GET /queue` (read-only dari Order AKTIF), `GET /queue/stats` |
| **Reports** | ♻️ Rewrite | `GET /report/sales?period=daily\|weekly\|monthly` (+ top 5 menu terlaris) |
| **Gateway** | ♻️ Update | WebSocket events baru |

### WebSocket Events
```
queue:updated               → broadcast list order AKTIF
menu:availability-changed   → broadcast saat menu toggle TERSEDIA/HABIS
order:created               → broadcast order baru
order:completed             → broadcast saat order selesai
```

### Fitur Backend yang Berfungsi ✅
1. **Simpan pesanan** — `POST /order` create Order + OrderItems dalam transaction, generate `nomorAntrian` per hari
2. **History order untuk laporan** — Order tetap tersimpan permanen di DB, query laporan agregasi by tanggal
3. **Real-time menu sync** — Menu baru/update di Admin langsung muncul di Kasir & Display via WebSocket + cache invalidation
4. **Cetak struk** — Endpoint `GET /order/:id/receipt` mengembalikan data struk lengkap (items, kasir, timestamp)
5. **Snapshot harga** — `hargaSatuan` di OrderItem disimpan saat order dibuat (tidak terpengaruh perubahan harga menu)

---

## 4. Frontend (Next.js 14 App Router)

### Struktur Route Baru

```
/login                      → Halaman login (username + password)
/display                    → TV publik (auto-switch antrian ↔ menu tiap 10s)
/kasir/transaksi            → POS — input pesanan + cetak struk
/kasir/antrian              → Kelola antrian aktif (selesai/batal)
/kasir/menu                 → Toggle ketersediaan menu (Tersedia/Habis)
/admin/menu                 → CRUD menu + toggle status
/admin/kategori             → CRUD kategori
/admin/laporan              → Laporan harian/mingguan/bulanan
```

### File yang Diubah/Dibuat
- `src/stores/authStore.ts` — User pakai `nama` + `username`
- `src/hooks/useAuth.ts` — Auto-redirect role-based (Admin → /admin/menu, Kasir → /kasir/transaksi)
- `src/constants/api.ts` — Endpoint baru
- `src/constants/socket-events.ts` — Events baru
- `src/app/login/page.tsx` — Field username (bukan email)
- `src/app/display/page.tsx` — TV publik dengan auto-switch
- `src/app/kasir/layout.tsx` + `transaksi/`, `antrian/`, `menu/`
- `src/app/admin/layout.tsx` + `menu/`, `kategori/`, `laporan/`

### Fitur Frontend
| Halaman | Fitur |
|---------|-------|
| **Display TV** | Auto-switch tiap 10s, jam real-time, kartu antrian besar (kode A001), grid menu dengan badge HABIS, real-time WebSocket |
| **Kasir Transaksi** | Grid menu + filter kategori, keranjang dengan +/-/hapus, validasi nama pelanggan (min 2 char), modal struk siap-print |
| **Kasir Antrian** | List order AKTIF urut FIFO, tombol Selesai/Batal, real-time stats |
| **Kasir Menu** | Toggle TERSEDIA/HABIS langsung dari kasir |
| **Admin Menu** | CRUD lengkap, grouped by kategori, toggle availability |
| **Admin Kategori** | CRUD dengan urutan tampil |
| **Admin Laporan** | Filter periode + date picker, 4 stat cards, top 5 menu terlaris |

---

## 5. Cara Menjalankan

### Backend
```bash
cd apps/backend
npm run start:dev       # http://localhost:3001
```

### Frontend
```bash
cd apps/frontend
npm run dev             # http://localhost:3000
```

### Database (jika perlu re-seed)
```bash
cd apps/backend
npx prisma migrate dev
npm run prisma:seed
```

---

## 6. Akun Demo

| Role | Username | Password | Redirect Awal |
|------|----------|----------|---------------|
| Admin | `admin` | `admin123` | `/admin/menu` |
| Kasir | `kasir` | `kasir123` | `/kasir/transaksi` |

---

## 7. Status Verifikasi

- ✅ Backend compile tanpa error
- ✅ Redis Upstash terhubung (TLS)
- ✅ Database PostgreSQL 18 di port 5433 ter-seed
- ✅ Login Admin/Kasir berfungsi
- ✅ Order tersimpan ke database (untuk history & laporan)
- ✅ Menu baru/update di Admin langsung muncul di Kasir & Display (real-time)
- ✅ WebSocket connected & broadcasting

---

## 8. File Lama yang Tidak Dipakai (Bisa Dihapus)

```
apps/frontend/src/app/menu/         (public menu lama)
apps/frontend/src/app/order/        (public order lama)
apps/frontend/src/app/queue/        (public queue lama)
apps/frontend/src/app/dashboard/    (struktur dashboard lama)
apps/frontend/src/components/menu/  (komponen lama)
apps/frontend/src/components/orders/
apps/frontend/src/components/queue/
```

Tidak mengganggu sistem karena tidak di-route, tapi bisa dihapus untuk kebersihan.

---

*Last updated: 2026-04-08*
