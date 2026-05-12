# CLAUDE.md — Sego Pedes Basman Order Management System

> **Single source of truth** untuk pengembangan aplikasi digitalisasi UMKM Sego Pedes Basman oleh Kelompok 4 — Developing Business Applications.

---

## 1. Project Overview

### 1.1 Konteks Bisnis
**Sego Pedes Basman** adalah UMKM kuliner yang menjual nasi bungkus khas Nusantara dengan cita rasa pedas autentik. Lokasi outlet kecil dengan pelanggan utama mahasiswa dan masyarakat sekitar. Sistem ini dirancang khusus untuk **operasional dine-in saat jam sibuk** (siang & malam), bukan untuk take-away atau delivery.

### 1.2 Problem yang Diselesaikan
- Antrian tidak terstruktur
- Pesanan tidak memiliki identitas jelas
- Pesanan bisa tertukar atau diambil orang lain
- Tidak ada transparansi status pesanan
- Informasi ketersediaan menu tidak real-time

### 1.3 Solusi Inti
**Single-Screen Unified Dashboard System** — satu layar TV publik yang menjadi *single source of truth* untuk pelanggan, kasir, dan staf dapur. Layar menampilkan antrian aktif (visual kiri-ke-kanan) dan ketersediaan menu secara bergantian otomatis.

### 1.4 Prinsip Desain
- **Dine-in only** — tidak ada take-away, delivery, atau multi-channel ordering
- **Frugal innovation** — menyesuaikan skala UMKM kecil, bukan meniru POS enterprise
- **2 role sistem**: Admin & Kasir (staf dapur dan pelanggan adalah pengguna pasif layar TV)
- **Tidak ada aplikasi pelanggan** — pelanggan cukup melihat layar TV publik
- **Cetak struk wajib** untuk setiap transaksi (standar transparansi)

---

## 2. Tech Stack

### 2.1 Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Real-time**: Socket.io client

### 2.2 Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Authentication**: Passport.js + JWT
- **Validation**: class-validator + class-transformer
- **API Documentation**: Swagger / OpenAPI
- **Real-time**: Socket.io server

### 2.3 Database & Infrastructure
- **Primary Database**: PostgreSQL 16
- **Cache & Pub/Sub**: Redis 7
- **ORM**: Prisma
- **Containerization**: Docker & Docker Compose

### 2.4 Development Tools
- **Version Control**: Git + GitHub
- **API Testing**: Postman
- **IDE**: VS Code
- **Design**: Figma
- **Diagramming**: draw.io

### 2.5 Architecture Pattern
**Modular Monolith** dengan NestJS — pemisahan modul secara logis (auth, menu, order, queue, report) dalam satu service. Pendekatan ini dipilih karena sesuai skala UMKM dan menghindari overhead microservices yang tidak dibutuhkan. Struktur modular memudahkan extraction ke microservices di masa depan jika skala membesar.

---

## 3. Directory Structure

```
sego-basman/
├── frontend/                          # Next.js 14 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/              # Admin dashboard routes
│   │   │   │   ├── menu/
│   │   │   │   ├── kategori/
│   │   │   │   └── laporan/
│   │   │   ├── (kasir)/              # Kasir POS routes
│   │   │   │   ├── transaksi/
│   │   │   │   └── antrian/
│   │   │   ├── display/              # Public TV display (no auth)
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable components
│   │   │   ├── admin/
│   │   │   ├── kasir/
│   │   │   └── display/
│   │   ├── lib/
│   │   │   ├── api.ts                # API client
│   │   │   ├── socket.ts             # Socket.io client setup
│   │   │   └── auth.ts               # JWT helpers
│   │   ├── stores/                   # Zustand stores
│   │   │   ├── auth-store.ts
│   │   │   ├── order-store.ts
│   │   │   └── queue-store.ts
│   │   └── types/
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                           # NestJS app
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                 # JWT authentication
│   │   │   ├── users/                # Admin & Kasir management
│   │   │   ├── menu/                 # Menu & Kategori CRUD
│   │   │   ├── order/                # Order & Transaction
│   │   │   ├── queue/                # Queue management
│   │   │   ├── report/               # Sales report
│   │   │   └── websocket/            # Socket.io gateway
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── filters/
│   │   ├── prisma/
│   │   │   └── prisma.service.ts
│   │   ├── config/
│   │   ├── main.ts
│   │   └── app.module.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── test/
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── README.md
└── CLAUDE.md                          # This file
```

---

## 4. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  KASIR
}

enum OrderStatus {
  AKTIF       // Sedang dalam antrian
  SELESAI     // Sudah diambil pelanggan
  DIBATALKAN  // Dibatalkan (optional future use)
}

enum MenuAvailability {
  TERSEDIA
  HABIS
}

model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // bcrypt hashed
  nama      String
  role      UserRole
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders    Order[]

  @@map("users")
}

model Kategori {
  id        String   @id @default(uuid())
  nama      String   @unique
  deskripsi String?
  urutan    Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  menus     Menu[]

  @@map("kategori")
}

model Menu {
  id            String            @id @default(uuid())
  nama          String
  deskripsi     String?
  harga         Decimal           @db.Decimal(10, 2)
  gambar        String?
  availability  MenuAvailability  @default(TERSEDIA)
  kategoriId    String
  kategori      Kategori          @relation(fields: [kategoriId], references: [id])
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  orderItems    OrderItem[]

  @@map("menu")
}

model Order {
  id              String       @id @default(uuid())
  nomorAntrian    Int          // Auto-increment harian
  namaPelanggan   String
  totalHarga      Decimal      @db.Decimal(10, 2)
  status          OrderStatus  @default(AKTIF)
  kasirId         String
  kasir           User         @relation(fields: [kasirId], references: [id])
  createdAt       DateTime     @default(now())
  completedAt     DateTime?

  items           OrderItem[]

  @@index([status, createdAt])
  @@index([nomorAntrian, createdAt])
  @@map("orders")
}

model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuId    String
  menu      Menu     @relation(fields: [menuId], references: [id])
  quantity  Int
  hargaSatuan Decimal @db.Decimal(10, 2)
  subtotal  Decimal  @db.Decimal(10, 2)

  @@map("order_items")
}
```

---

## 5. Environment Variables

```env
# .env.example

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sego_basman"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="8h"

# Backend
BACKEND_PORT=3001
CORS_ORIGIN="http://localhost:3000"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# Node Environment
NODE_ENV="development"
```

---

## 6. Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sego-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sego_basman
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sego-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sego-backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/sego_basman
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sego-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXT_PUBLIC_WS_URL: ws://localhost:3001
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## 7. API Endpoints

### 7.1 Authentication (`/auth`)
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/auth/login` | Login admin/kasir | No | — |
| POST | `/auth/logout` | Logout & invalidate token | Yes | All |
| GET | `/auth/me` | Get current user info | Yes | All |

### 7.2 Menu Management (`/menu`)
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/menu` | List semua menu (public untuk display TV) | No | — |
| GET | `/menu/:id` | Detail menu | No | — |
| POST | `/menu` | Tambah menu baru | Yes | Admin |
| PATCH | `/menu/:id` | Update menu | Yes | Admin |
| DELETE | `/menu/:id` | Hapus menu | Yes | Admin |
| PATCH | `/menu/:id/availability` | Update ketersediaan (tersedia/habis) | Yes | Admin, Kasir |

### 7.3 Kategori (`/kategori`)
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/kategori` | List semua kategori | No | — |
| POST | `/kategori` | Tambah kategori | Yes | Admin |
| PATCH | `/kategori/:id` | Update kategori | Yes | Admin |
| DELETE | `/kategori/:id` | Hapus kategori | Yes | Admin |

### 7.4 Order & Transaction (`/order`)
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/order` | Buat pesanan baru (input transaksi) | Yes | Kasir |
| GET | `/order/active` | List pesanan aktif di antrian | Yes | Kasir |
| GET | `/order/:id` | Detail pesanan | Yes | Kasir |
| PATCH | `/order/:id/complete` | Tandai pesanan selesai | Yes | Kasir |
| GET | `/order/:id/receipt` | Generate struk untuk dicetak | Yes | Kasir |

### 7.5 Queue (`/queue`)
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/queue` | Get daftar antrian aktif (public untuk display TV) | No | — |
| GET | `/queue/current` | Get pesanan yang sedang dieksekusi | No | — |

### 7.6 Report (`/report`)
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/report/sales?period=daily` | Laporan penjualan harian | Yes | Admin |
| GET | `/report/sales?period=weekly` | Laporan penjualan mingguan | Yes | Admin |
| GET | `/report/sales?period=monthly` | Laporan penjualan bulanan | Yes | Admin |

---

## 8. WebSocket Events

### 8.1 Server → Client Events
| Event | Payload | Description |
|-------|---------|-------------|
| `queue:updated` | `{ orders: Order[] }` | Antrian diperbarui (pesanan baru/selesai) |
| `menu:availability-changed` | `{ menuId, availability }` | Status ketersediaan menu berubah |
| `order:completed` | `{ orderId, nomorAntrian }` | Pesanan ditandai selesai |
| `order:created` | `{ order: Order }` | Pesanan baru masuk antrian |

### 8.2 Client → Server Events
| Event | Payload | Description |
|-------|---------|-------------|
| `display:subscribe` | `{}` | Subscribe ke update antrian & menu (untuk TV display) |
| `kasir:subscribe` | `{}` | Subscribe ke update antrian (untuk dashboard kasir) |

### 8.3 Socket.io Rooms
- `display` — semua klien layar TV publik
- `kasir` — semua dashboard kasir yang login
- `admin` — semua dashboard admin yang login

---

## 9. Functional Requirements Mapping

| FR ID | Requirement | Implementation |
|-------|-------------|----------------|
| FR-01 | Antrian otomatis FIFO | `Order.nomorAntrian` auto-increment, `createdAt` sebagai urutan |
| FR-02 | Nomor antrian di layar display | WebSocket `queue:updated` → display room |
| FR-03 | Admin CRUD menu | Module `menu` dengan guard role Admin |
| FR-04 | Input nama pelanggan | Field `Order.namaPelanggan` wajib di POST `/order` |
| FR-05 | Update ketersediaan menu real-time | PATCH `/menu/:id/availability` + WebSocket broadcast |
| FR-06 | Cari & verifikasi pesanan | GET `/order/active` dengan filter, visual scan di dashboard kasir |
| FR-07 | Dashboard antrian publik di TV | Route `/display` (no auth) + Socket.io subscription |
| FR-08 | Tandai pesanan selesai manual | PATCH `/order/:id/complete` → broadcast ke display room |
| FR-09 | Nama + nomor antrian sebagai identitas visual | Display component render `nomorAntrian` + `namaPelanggan` |
| FR-10 | Status ketersediaan menu di display | Display page subscribe `menu:availability-changed` |
| FR-11 | Laporan penjualan | Module `report` dengan aggregate query harian/mingguan/bulanan |

---

## 10. Non-Functional Requirements Mapping

| NFR ID | Requirement | Implementation |
|--------|-------------|----------------|
| NFR-01 | Response time < 2 detik | Database indexing, React Query caching, Redis caching |
| NFR-02 | Uptime ≥ 99% (08.00–22.00) | Docker health checks, graceful shutdown, auto-restart |
| NFR-03 | Latensi update < 500ms via WebSocket | Socket.io dengan Redis adapter untuk pub/sub |
| NFR-04 | JWT dengan expire 8 jam | `JWT_EXPIRES_IN=8h`, refresh token mechanism |
| NFR-05 | RBAC: 2 role (Admin, Kasir) | NestJS Guards + `@Roles()` decorator |
| NFR-06 | HTTPS/WSS wajib | Nginx reverse proxy dengan SSL termination di production |
| NFR-07 | Responsive design | Tailwind CSS responsive utilities, mobile-first |
| NFR-08 | ≥ 100 pesanan bersamaan | PostgreSQL connection pooling, Redis caching |
| NFR-09 | Swagger/OpenAPI docs | `@nestjs/swagger` decorators di semua controller |
| NFR-10 | Centralized error logging | Winston logger + error filter global |

---

## 11. Use Case Implementation Notes

### 11.1 Admin Use Cases
- **Kelola Menu**: CRUD menu + extend (Edit/Tambah/Hapus Menu) → Module `menu`
- **Kelola Kategori**: CRUD kategori + extend (Edit/Tambah/Hapus Kategori) → Module `menu/kategori`
- **Lihat Laporan Penjualan**: Module `report` dengan filter harian/mingguan/bulanan
- **Login**: Include untuk semua use case admin → Module `auth`

### 11.2 Kasir Use Cases
- **Pilih Menu** → Halaman `/kasir/transaksi` dengan grid menu yang tersedia
- **Input Transaksi** (include: Input nama + Input pembayaran) → Form di halaman transaksi
- **Cetak Struk** (included by Input Transaksi) → Otomatis generate receipt setelah POST `/order` berhasil
- **Update Status Pesanan** (implicit include Lihat Daftar Antrian) → Halaman `/kasir/antrian` dengan list + tombol "Selesai"
- **Ubah Status Ketersediaan Menu** → Toggle di halaman menu kasir
- **Login**: Include untuk semua use case kasir

### 11.3 Pelanggan Use Cases
- **Melihat Menu** → Bagian dari display TV (halaman A)
- **Melihat Display Antrian** → Bagian dari display TV (halaman B)
- **Tanpa login** — route `/display` public, auto-switch antara halaman A & B setiap 10 detik

---

## 12. Development Checklist

### Phase 1: Foundation (Week 1)
- [ ] Setup Docker Compose dengan PostgreSQL & Redis
- [ ] Initialize NestJS backend project
- [ ] Initialize Next.js 14 frontend project
- [ ] Setup Prisma schema & initial migration
- [ ] Configure environment variables & config module
- [ ] Setup Git repository dengan branching strategy

### Phase 2: Authentication & User Management (Week 1-2)
- [ ] Implement JWT authentication (login/logout/me)
- [ ] Setup Passport.js dengan JWT strategy
- [ ] Create User entity & seeder (admin + kasir default)
- [ ] Implement RBAC guards & decorators
- [ ] Frontend: login page + auth store (Zustand)
- [ ] Frontend: protected route middleware

### Phase 3: Menu & Kategori Management (Week 2)
- [ ] Backend: CRUD kategori endpoints
- [ ] Backend: CRUD menu endpoints
- [ ] Backend: Update menu availability endpoint
- [ ] Frontend: Admin dashboard layout
- [ ] Frontend: Kategori management page
- [ ] Frontend: Menu management page
- [ ] Frontend: Kasir menu availability toggle

### Phase 4: Order & Transaction (Week 3)
- [ ] Backend: Order creation endpoint (input transaksi)
- [ ] Backend: Auto-increment nomor antrian harian
- [ ] Backend: Generate receipt endpoint
- [ ] Backend: Complete order endpoint
- [ ] Backend: Get active orders endpoint
- [ ] Frontend: Kasir transaction page (pilih menu + input nama)
- [ ] Frontend: Receipt printing component
- [ ] Frontend: Kasir queue management page

### Phase 5: Real-time Display (Week 3-4)
- [ ] Backend: Socket.io gateway setup
- [ ] Backend: Redis adapter untuk Socket.io
- [ ] Backend: Broadcast events (queue:updated, menu:availability-changed, etc.)
- [ ] Frontend: Socket.io client setup
- [ ] Frontend: Public display page (route `/display`)
- [ ] Frontend: Auto-switching antara halaman menu & halaman antrian
- [ ] Frontend: Real-time queue display dengan animasi geser

### Phase 6: Reporting (Week 4)
- [ ] Backend: Sales report aggregation queries
- [ ] Backend: Report endpoints (daily/weekly/monthly)
- [ ] Frontend: Laporan penjualan page dengan chart
- [ ] Frontend: Export laporan (optional)

### Phase 7: Polish & Testing (Week 4-5)
- [ ] Setup Swagger documentation untuk semua endpoints
- [ ] Setup Winston logger + error filter
- [ ] Unit tests untuk critical services
- [ ] Integration tests untuk endpoints utama
- [ ] E2E test untuk flow transaksi lengkap
- [ ] Performance testing (100+ concurrent orders)
- [ ] Responsive design testing (tablet, desktop, smartphone)

### Phase 8: Deployment Preparation (Week 5)
- [ ] Production Dockerfile untuk backend & frontend
- [ ] Nginx reverse proxy config dengan SSL
- [ ] Database backup strategy
- [ ] Deployment documentation
- [ ] User manual untuk admin & kasir

---

## 13. Key Business Rules

1. **Nomor antrian reset setiap hari** — mulai dari 1 setiap jam 00:00
2. **Cetak struk wajib** untuk setiap transaksi (no exception)
3. **Nama pelanggan wajib diinput** — tidak boleh anonim/default
4. **Hanya kasir yang bisa menyelesaikan pesanan** — tidak otomatis
5. **Menu habis tetap terlihat di display** tapi ditandai gelap + label "habis"
6. **Display TV tidak memerlukan login** — public read-only access
7. **Staf dapur melihat layar TV yang sama dengan pelanggan** — tidak ada dashboard terpisah
8. **Pengambilan pesanan** dilakukan dengan memanggil nama + nomor antrian secara verbal

---

## 14. Out of Scope (Explicit Non-Requirements)

Berikut adalah fitur yang **TIDAK akan diimplementasikan** dalam sistem ini, untuk menghindari scope creep:

- ❌ Take-away / delivery flow
- ❌ Multi-channel ordering (Instagram DM, WhatsApp, dll)
- ❌ Aplikasi mobile untuk pelanggan
- ❌ QR code ordering dari meja
- ❌ Sistem verifikasi digital saat pengambilan (cukup panggil nama)
- ❌ Kitchen Dashboard terpisah untuk staf dapur
- ❌ Sistem pembayaran digital / e-wallet integration (cash only)
- ❌ Loyalty program / member card
- ❌ Booking / reservasi meja
- ❌ Integrasi dengan aplikasi akuntansi eksternal
- ❌ Push notification ke pelanggan

Jika fitur-fitur di atas dibutuhkan di masa depan, harus melalui proses review ulang FR, NFR, VPC, dan Lean Canvas.

---

## 15. Project Team

**Kelompok 4 — Developing Business Applications**

| Nama | NIM |
|------|-----|
| Teuku Raka Pratama Putra | 2310631250106 |
| Winata Suryana | 2310631250038 |
| Muhammad Rafly Dwi Gunawan | 2310631250100 |
| Dwi Septian | 2310631250048 |

---

## 16. References

- **Value Proposition Canvas**: Lihat slide PPT halaman 7
- **Lean Canvas**: Lihat slide PPT halaman 8
- **Use Case Diagram**: Lihat slide PPT halaman 11
- **FR & NFR**: Lihat slide PPT halaman 9-10

---

**Last Updated**: April 2026
**Status**: Ready for development
**Version**: 1.0.0
