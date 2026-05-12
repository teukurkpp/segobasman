# CLAUDE CODE — Project Specification
# Aplikasi Digitalisasi UMKM Sego Pedes Basman

> **Instruksi ini adalah sumber kebenaran tunggal (single source of truth) untuk seluruh pengembangan aplikasi.**
> Baca seluruh dokumen ini sebelum menulis satu baris kode pun.

---

## 📋 DAFTAR ISI

1. [Gambaran Umum Proyek](#1-gambaran-umum-proyek)
2. [Tech Stack](#2-tech-stack)
3. [Struktur Direktori](#3-struktur-direktori)
4. [Database Schema](#4-database-schema)
5. [Environment Variables](#5-environment-variables)
6. [Backend — NestJS](#6-backend--nestjs)
7. [Frontend — Next.js](#7-frontend--nextjs)
8. [Real-Time WebSocket](#8-real-time-websocket)
9. [Functional Requirements Implementation](#9-functional-requirements-implementation)
10. [Non-Functional Requirements Checklist](#10-non-functional-requirements-checklist)
11. [API Endpoints Reference](#11-api-endpoints-reference)
12. [Urutan Pengerjaan (Step-by-Step)](#12-urutan-pengerjaan-step-by-step)

---

## 1. GAMBARAN UMUM PROYEK

### Konteks Bisnis
**Sego Pedes Basman** adalah UMKM kuliner yang menjual nasi bungkus pedas khas nusantara. Bisnis ini menghadapi tiga masalah utama yang harus diselesaikan oleh aplikasi ini:

| # | Masalah | Dampak |
|---|---------|--------|
| 1 | Antrian tidak terstruktur — pelanggan datang lebih awal belum tentu dilayani duluan | Ketidakpuasan pelanggan, kehilangan repeat order |
| 2 | Pesanan siap tanpa identitas pelanggan — tidak jelas milik siapa | Pesanan tertukar, inefisiensi operasional |
| 3 | Informasi menu tidak real-time — pelanggan tidak tahu stok habis | Kehilangan penjualan, proses pemesanan lambat |

### Solusi yang Dibangun
Satu platform web terintegrasi dengan tiga komponen utama:
1. **Sistem Antrian Digital FIFO** — antrian otomatis berdasarkan urutan waktu kedatangan
2. **Sistem Pemesanan Berbasis Nama** — setiap pesanan terikat identitas pelanggan
3. **Dashboard Menu Real-Time** — status ketersediaan menu diperbarui instan via WebSocket

### Aktor & Peran
| Aktor | Akses | Deskripsi |
|-------|-------|-----------|
| `ADMIN` | Full access | Kelola menu, lihat laporan, kelola akun kasir |
| `KASIR` | Operasional | Proses antrian, update status pesanan |
| `PELANGGAN` | Public | Lihat menu, ambil nomor antrian, pantau status |

---

## 2. TECH STACK

### Backend
```
Runtime         : Node.js 20 LTS
Framework       : NestJS 10.x (TypeScript)
ORM             : Prisma 5.x
Database Utama  : PostgreSQL 16
Cache / Pub-Sub : Redis 7 (via ioredis)
Real-Time       : Socket.io 4.x (@nestjs/platform-socket.io)
Auth            : JWT (@nestjs/jwt + @nestjs/passport + passport-jwt)
Validation      : class-validator + class-transformer
API Docs        : @nestjs/swagger (Swagger UI auto-generated)
Testing         : Jest + Supertest
Containerization: Docker + docker-compose
```

### Frontend
```
Framework       : Next.js 14.x (App Router, TypeScript)
Styling         : Tailwind CSS 3.x
State Server    : TanStack Query (React Query) v5
State Global    : Zustand 4.x
Real-Time       : socket.io-client 4.x
Form Handling   : React Hook Form + Zod
UI Components   : shadcn/ui (berbasis Radix UI)
Icons           : Lucide React
HTTP Client     : Axios
Toast / Notif   : react-hot-toast
```

### Infrastructure
```
Frontend Deploy : Vercel
Backend Deploy  : Railway (atau Render)
DB Deploy       : Railway PostgreSQL (managed)
Redis Deploy    : Upstash Redis (managed)
Container Local : Docker Compose
CI/CD           : GitHub Actions
```

---

## 3. STRUKTUR DIREKTORI

### Monorepo Root
```
sego-basman/
├── apps/
│   ├── backend/          # NestJS application
│   └── frontend/         # Next.js application
├── docker-compose.yml    # PostgreSQL + Redis lokal
├── .env.example
├── .gitignore
└── README.md
```

### Backend — `apps/backend/`
```
apps/backend/
├── src/
│   ├── main.ts                        # Bootstrap NestJS + Swagger + Socket.io CORS
│   ├── app.module.ts                  # Root module — import semua module
│   │
│   ├── config/
│   │   └── configuration.ts           # ConfigService wrapper (env vars)
│   │
│   ├── prisma/
│   │   ├── prisma.service.ts          # PrismaClient singleton
│   │   └── prisma.module.ts
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts         # POST /auth/login, POST /auth/refresh
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts        # Passport JWT strategy
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts     # @Roles(Role.ADMIN)
│   │   │   └── current-user.decorator.ts
│   │   └── dto/
│   │       └── login.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts        # CRUD user (admin only)
│   │   ├── users.service.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── menu/
│   │   ├── menu.module.ts
│   │   ├── menu.controller.ts         # CRUD menu + update availability
│   │   ├── menu.service.ts
│   │   └── dto/
│   │       ├── create-menu.dto.ts
│   │       └── update-menu.dto.ts
│   │
│   ├── queue/
│   │   ├── queue.module.ts
│   │   ├── queue.controller.ts        # Ambil nomor antrian, panggil antrian
│   │   ├── queue.service.ts           # Logika FIFO + Redis
│   │   └── dto/
│   │       └── join-queue.dto.ts
│   │
│   ├── orders/
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts       # CRUD pesanan
│   │   ├── orders.service.ts
│   │   └── dto/
│   │       ├── create-order.dto.ts
│   │       └── update-order-status.dto.ts
│   │
│   ├── reports/
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts      # Laporan harian (admin only)
│   │   └── reports.service.ts
│   │
│   └── gateway/
│       ├── app.gateway.ts             # Socket.io gateway utama
│       └── gateway.module.ts
│
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── seed.ts                        # Data awal (admin user, contoh menu)
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── Dockerfile
├── .env
└── package.json
```

### Frontend — `apps/frontend/`
```
apps/frontend/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout (providers)
│   │   ├── page.tsx                   # Redirect ke /menu
│   │   │
│   │   ├── menu/
│   │   │   └── page.tsx               # Halaman menu publik (pelanggan)
│   │   │
│   │   ├── queue/
│   │   │   └── page.tsx               # Halaman display antrian publik
│   │   │
│   │   ├── order/
│   │   │   └── page.tsx               # Halaman pemesanan + input nama
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx             # Dashboard layout (sidebar + auth guard)
│   │   │   ├── page.tsx               # Dashboard home (ringkasan)
│   │   │   ├── queue/
│   │   │   │   └── page.tsx           # Manajemen antrian (kasir)
│   │   │   ├── orders/
│   │   │   │   └── page.tsx           # Daftar pesanan aktif (kasir)
│   │   │   ├── menu/
│   │   │   │   └── page.tsx           # Manajemen menu (admin)
│   │   │   └── reports/
│   │   │       └── page.tsx           # Laporan penjualan (admin)
│   │   │
│   │   └── login/
│   │       └── page.tsx               # Halaman login
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── menu/
│   │   │   ├── MenuCard.tsx           # Card item menu dengan status badge
│   │   │   ├── MenuGrid.tsx           # Grid layout menu
│   │   │   └── MenuForm.tsx           # Form tambah/edit menu (admin)
│   │   ├── queue/
│   │   │   ├── QueueDisplay.tsx       # Tampilan antrian besar (layar display)
│   │   │   ├── QueueTicket.tsx        # Tiket nomor antrian pelanggan
│   │   │   └── QueueManager.tsx       # Kontrol antrian kasir
│   │   └── orders/
│   │       ├── OrderCard.tsx          # Card pesanan dengan nama + status
│   │       ├── OrderList.tsx          # List pesanan aktif
│   │       └── OrderForm.tsx          # Form input pesanan + nama pelanggan
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                 # Auth state + login/logout
│   │   ├── useSocket.ts               # Socket.io connection hook
│   │   ├── useQueue.ts                # Antrian real-time hook
│   │   ├── useMenu.ts                 # Menu queries + mutations
│   │   └── useOrders.ts               # Orders queries + mutations
│   │
│   ├── lib/
│   │   ├── axios.ts                   # Axios instance + interceptors
│   │   ├── socket.ts                  # Socket.io client singleton
│   │   └── utils.ts                   # cn() utility, formatters
│   │
│   ├── stores/
│   │   ├── authStore.ts               # Zustand auth store (token, user)
│   │   └── queueStore.ts              # Zustand queue store (nomor aktif)
│   │
│   ├── types/
│   │   ├── api.types.ts               # Response types dari API
│   │   ├── menu.types.ts
│   │   ├── queue.types.ts
│   │   └── order.types.ts
│   │
│   └── constants/
│       ├── api.ts                     # API base URL, endpoint paths
│       └── socket-events.ts           # Nama event WebSocket (enum/const)
│
├── public/
│   └── logo.png
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. DATABASE SCHEMA

Buat file ini di `apps/backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// ENUM DEFINITIONS
// ─────────────────────────────────────────────

enum Role {
  ADMIN
  KASIR
}

enum MenuCategory {
  NASI_PEDAS
  GORENGAN
  MINUMAN
  PAKET
}

enum MenuStatus {
  TERSEDIA
  HABIS
}

enum OrderStatus {
  MENUNGGU      // Pesanan diterima, belum diproses
  DIPROSES      // Sedang dibuat
  SIAP          // Siap diambil
  SELESAI       // Sudah diambil pelanggan
  DIBATALKAN    // Dibatalkan
}

enum QueueStatus {
  MENUNGGU      // Antrian aktif, belum dipanggil
  DIPANGGIL     // Sedang dipanggil kasir
  SELESAI       // Sudah selesai dilayani
  MELEWATI      // Tidak hadir saat dipanggil
}

// ─────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed
  role      Role     @default(KASIR)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders    Order[]  // Order yang diproses user ini

  @@map("users")
}

model Menu {
  id           String       @id @default(cuid())
  name         String
  description  String?
  price        Int          // dalam Rupiah (tidak menggunakan float)
  category     MenuCategory
  status       MenuStatus   @default(TERSEDIA)
  imageUrl     String?
  stock        Int?         // null = tidak terbatas
  isActive     Boolean      @default(true)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  orderItems   OrderItem[]

  @@map("menus")
}

model Queue {
  id            String      @id @default(cuid())
  queueNumber   Int         // Nomor antrian (1, 2, 3, ...)
  customerName  String      // Nama pelanggan WAJIB diisi
  status        QueueStatus @default(MENUNGGU)
  calledAt      DateTime?   // Waktu dipanggil kasir
  completedAt   DateTime?   // Waktu selesai
  estimatedWait Int?        // Estimasi menit tunggu (computed)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  order         Order?      // Relasi ke pesanan (optional)

  @@map("queues")
}

model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique // Format: ORD-YYYYMMDD-XXXX
  customerName  String      // Nama pelanggan (WAJIB — salin dari Queue)
  status        OrderStatus @default(MENUNGGU)
  totalAmount   Int         // Total harga dalam Rupiah
  notes         String?     // Catatan tambahan pelanggan
  processedBy   User?       @relation(fields: [processedById], references: [id])
  processedById String?
  queue         Queue?      @relation(fields: [queueId], references: [id])
  queueId       String?     @unique
  completedAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  items         OrderItem[]

  @@map("orders")
}

model OrderItem {
  id        String  @id @default(cuid())
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
  menu      Menu    @relation(fields: [menuId], references: [id])
  menuId    String
  quantity  Int     @default(1)
  unitPrice Int     // Harga satuan saat dipesan (snapshot)
  subtotal  Int     // quantity * unitPrice

  @@map("order_items")
}

model DailyReport {
  id              String   @id @default(cuid())
  date            DateTime @db.Date @unique
  totalOrders     Int      @default(0)
  completedOrders Int      @default(0)
  cancelledOrders Int      @default(0)
  totalRevenue    Int      @default(0) // Rupiah
  avgWaitTime     Int?     // Rata-rata menit tunggu
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("daily_reports")
}
```

---

## 5. ENVIRONMENT VARIABLES

### Backend — `apps/backend/.env`
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/sego_basman_db"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# JWT
JWT_SECRET="ganti-dengan-secret-yang-sangat-panjang-dan-random-minimal-64-karakter"
JWT_EXPIRES_IN="8h"
JWT_REFRESH_SECRET="ganti-dengan-refresh-secret-yang-berbeda-dan-sama-panjangnya"
JWT_REFRESH_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV="development"
APP_URL="http://localhost:3001"

# CORS — URL frontend
FRONTEND_URL="http://localhost:3000"

# Bcrypt
BCRYPT_ROUNDS=12
```

### Frontend — `apps/frontend/.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### Docker Compose — `docker-compose.yml` (di root)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sego_postgres
    environment:
      POSTGRES_DB: sego_basman_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: sego_redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 6. BACKEND — NestJS

### 6.1 Bootstrap (`main.ts`)
```typescript
// Konfigurasi yang WAJIB ada di main.ts:
// 1. ValidationPipe global dengan whitelist: true, forbidNonWhitelisted: true
// 2. Swagger setup di /api/docs
// 3. CORS allow dari FRONTEND_URL
// 4. Socket.io CORS match dengan CORS Express
// 5. Port dari env PORT

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Sego Pedes Basman API')
    .setDescription('API untuk sistem antrian dan pemesanan digital')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
```

### 6.2 Auth Module

**`login.dto.ts`**
```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

**`auth.service.ts` — Logika penting:**
- `login()`: validasi email+password dengan bcrypt, return `{ access_token, refresh_token, user }`
- `validateUser()`: cari user by email, compare password hash
- Gunakan `@nestjs/jwt` untuk sign token dengan payload `{ sub: user.id, email: user.email, role: user.role }`

**`jwt.strategy.ts`**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
```

**`roles.guard.ts`** — Cek `user.role` dari JWT payload terhadap `@Roles()` decorator.

### 6.3 Menu Module

**`create-menu.dto.ts`**
```typescript
export class CreateMenuDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsInt() @Min(0)
  price: number; // Rupiah, integer

  @IsEnum(MenuCategory)
  category: MenuCategory;

  @IsInt() @Min(0) @IsOptional()
  stock?: number;

  @IsUrl() @IsOptional()
  imageUrl?: string;
}
```

**`menu.service.ts` — Method penting:**
```typescript
// Setelah update status menu, WAJIB emit WebSocket event
async updateAvailability(id: string, status: MenuStatus) {
  const menu = await this.prisma.menu.update({
    where: { id },
    data: { status },
  });
  // Emit ke semua klien yang mendengarkan
  this.appGateway.emitMenuUpdated(menu);
  return menu;
}

// Ambil semua menu aktif (untuk halaman publik)
async findAllPublic() {
  return this.prisma.menu.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}
```

### 6.4 Queue Module

**Aturan FIFO yang WAJIB diikuti:**
- Nomor antrian di-generate dari Redis INCR untuk atomicity: `INCR queue:daily:{YYYY-MM-DD}`
- Reset nomor antrian setiap hari (key Redis expired tengah malam)
- Estimasi waktu tunggu: `(jumlah_antrian_aktif_sebelum_saya) * AVG_SERVICE_TIME_MENIT`
- `AVG_SERVICE_TIME_MENIT` default = 3 menit (bisa dikonfigurasi)

**`join-queue.dto.ts`**
```typescript
export class JoinQueueDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  customerName: string; // WAJIB — tidak boleh kosong
}
```

**`queue.service.ts` — Method penting:**
```typescript
async joinQueue(dto: JoinQueueDto): Promise<Queue> {
  // 1. Generate nomor antrian dari Redis (atomic increment)
  const today = format(new Date(), 'yyyy-MM-dd');
  const redisKey = `queue:daily:${today}`;
  const queueNumber = await this.redis.incr(redisKey);
  // Set expiry 24 jam jika belum ada
  await this.redis.expire(redisKey, 86400);

  // 2. Hitung estimasi tunggu
  const activeCount = await this.prisma.queue.count({
    where: { status: 'MENUNGGU', createdAt: { gte: startOfDay(new Date()) } },
  });
  const estimatedWait = activeCount * AVG_SERVICE_TIME;

  // 3. Simpan ke database
  const queue = await this.prisma.queue.create({
    data: { queueNumber, customerName: dto.customerName, estimatedWait },
  });

  // 4. Emit WebSocket ke semua klien
  this.appGateway.emitQueueUpdated(queue);

  return queue;
}

async callNext(): Promise<Queue | null> {
  // Panggil antrian berikutnya (status MENUNGGU, terlama)
  const next = await this.prisma.queue.findFirst({
    where: { status: 'MENUNGGU' },
    orderBy: { createdAt: 'asc' }, // FIFO — yang pertama masuk, pertama keluar
  });

  if (!next) return null;

  const updated = await this.prisma.queue.update({
    where: { id: next.id },
    data: { status: 'DIPANGGIL', calledAt: new Date() },
  });

  this.appGateway.emitQueueCalled(updated);
  return updated;
}
```

### 6.5 Orders Module

**`create-order.dto.ts`**
```typescript
export class CreateOrderDto {
  @IsString() @IsNotEmpty() @MinLength(2)
  customerName: string; // WAJIB — identitas pelanggan

  @IsString() @IsOptional()
  queueId?: string; // Link ke antrian jika ada

  @IsArray() @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString() @IsOptional()
  notes?: string;
}

export class OrderItemDto {
  @IsString() @IsNotEmpty()
  menuId: string;

  @IsInt() @Min(1)
  quantity: number;
}
```

**`orders.service.ts` — Logika penting:**
```typescript
async create(dto: CreateOrderDto, processedById?: string): Promise<Order> {
  // 1. Validasi semua menu tersedia dan aktif
  // 2. Snapshot harga saat ini (bukan ambil harga nanti — harga bisa berubah)
  // 3. Hitung subtotal tiap item dan total order
  // 4. Generate orderNumber format: ORD-20240115-0001
  // 5. Create order + orderItems dalam satu Prisma transaction
  // 6. Emit WebSocket event order baru

  return this.prisma.$transaction(async (tx) => {
    // ... implementasi dalam transaction
  });
}

async updateStatus(id: string, status: OrderStatus, userId: string): Promise<Order> {
  const order = await this.prisma.order.update({
    where: { id },
    data: {
      status,
      processedById: userId,
      completedAt: status === 'SELESAI' ? new Date() : undefined,
    },
    include: { items: { include: { menu: true } } },
  });

  // Emit real-time update
  this.appGateway.emitOrderUpdated(order);
  return order;
}
```

### 6.6 Seed Data (`prisma/seed.ts`)
```typescript
// Data yang harus di-seed:
// 1. Admin user: email=admin@segobasman.com, password=admin123, role=ADMIN
// 2. Kasir user: email=kasir@segobasman.com, password=kasir123, role=KASIR
// 3. Minimal 10 item menu dengan kategori bervariasi:
//    - NASI_PEDAS: Nasi Pedas Tongkol, Nasi Pedas Ayam, Nasi Pedas Cumi, Nasi Pedas Campur
//    - GORENGAN: Tempe Goreng, Tahu Goreng, Bakwan
//    - MINUMAN: Es Teh Manis, Es Jeruk, Air Mineral
```

---

## 7. FRONTEND — Next.js

### 7.1 Providers (`app/layout.tsx`)
```tsx
// Wrap app dengan:
// 1. QueryClientProvider (TanStack Query)
// 2. Toaster (react-hot-toast)
// 3. AuthProvider (dari authStore Zustand)
// Urutan: QueryClientProvider > AuthProvider > children > Toaster
```

### 7.2 Halaman Publik (Tanpa Login)

#### `/menu` — Halaman Menu Pelanggan
**Behavior:**
- Tampilkan semua menu aktif dalam grid responsif (2 kolom mobile, 3 kolom desktop, 4 kolom large)
- Setiap kartu menu tampilkan: nama, harga (format Rupiah), kategori, badge status (TERSEDIA hijau / HABIS merah)
- Menu HABIS: kartu di-grey-out, tombol pesan disabled
- Filter menu berdasarkan kategori (tab/chip)
- Real-time: subscribe WebSocket event `menu:updated` → update status menu tanpa reload halaman

#### `/queue` — Halaman Display Antrian
**Behavior:**
- Tampilan besar untuk layar display di kasir / meja tunggu
- Tampilkan nomor yang SEDANG dipanggil (besar, terbaca dari jauh)
- Tampilkan daftar 5 nomor antrian berikutnya yang menunggu
- Real-time: subscribe `queue:called` dan `queue:updated`

#### `/order` — Halaman Pemesanan
**Behavior:**
- Form input nama pelanggan (REQUIRED — validasi tidak boleh kosong, min 2 karakter)
- Pilih item menu (hanya yang TERSEDIA)
- Tampilkan ringkasan pesanan + total harga
- Submit → create order → tampilkan nomor antrian yang didapat
- Setelah berhasil: tampilkan tiket antrian dengan nama dan nomor

### 7.3 Dashboard (Dengan Login)

#### `/dashboard/queue` — Manajemen Antrian (Kasir)
**Behavior:**
- Tombol besar "Panggil Antrian Berikutnya" (POST /queue/call-next)
- Tampilkan antrian yang sedang dipanggil
- Tampilkan daftar antrian menunggu (dengan nama pelanggan)
- Tombol "Selesai" untuk menutup antrian yang dipanggil
- Real-time: update otomatis saat ada antrian baru

#### `/dashboard/orders` — Daftar Pesanan Aktif (Kasir)
**Behavior:**
- Tampilkan semua pesanan aktif (status: MENUNGGU, DIPROSES, SIAP)
- Setiap kartu pesanan tampilkan: **nama pelanggan (prominent)**, nomor pesanan, daftar item, total, status
- Dropdown/tombol update status: MENUNGGU → DIPROSES → SIAP → SELESAI
- Filter berdasarkan status
- Real-time: update otomatis saat ada pesanan baru atau perubahan status

#### `/dashboard/menu` — Manajemen Menu (Admin Only)
**Behavior:**
- Tabel/grid semua menu
- Tombol toggle TERSEDIA/HABIS per menu (PATCH /menu/:id/availability)
- CRUD menu: tambah, edit, hapus (soft delete — set isActive = false)
- Perubahan status langsung emit WebSocket ke halaman publik

#### `/dashboard/reports` — Laporan Harian (Admin Only)
**Behavior:**
- Pilih tanggal (date picker)
- Tampilkan: total pesanan, pesanan selesai, dibatalkan, total pendapatan, rata-rata waktu tunggu
- Grafik sederhana penjualan per jam (opsional)

### 7.4 Auth Guard
```tsx
// AuthGuard.tsx — Redirect ke /login jika tidak ada token
// Cek token dari Zustand authStore
// Jika token expired (dari response API 401), logout otomatis dan redirect
// Proteksi role: halaman menu (admin only) redirect kasir ke /dashboard/queue
```

### 7.5 Axios Instance (`lib/axios.ts`)
```typescript
// Konfigurasi wajib:
// 1. baseURL dari NEXT_PUBLIC_API_URL
// 2. Request interceptor: tambahkan Authorization: Bearer {token} dari authStore
// 3. Response interceptor: jika 401 → clear authStore → redirect ke /login
```

### 7.6 Format Rupiah
```typescript
// Gunakan fungsi ini konsisten di seluruh aplikasi
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};
// Output: "Rp 15.000"
```

---

## 8. REAL-TIME WEBSOCKET

### 8.1 Socket.io Gateway (Backend)

```typescript
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
  namespace: '/',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // ── Method yang dipanggil dari service lain ──

  emitMenuUpdated(menu: Menu) {
    this.server.emit('menu:updated', menu);
  }

  emitQueueUpdated(queue: Queue) {
    this.server.emit('queue:updated', queue);
  }

  emitQueueCalled(queue: Queue) {
    this.server.emit('queue:called', queue);
  }

  emitOrderUpdated(order: Order) {
    this.server.emit('order:updated', order);
  }

  emitOrderCreated(order: Order) {
    this.server.emit('order:created', order);
  }
}
```

### 8.2 Daftar Socket Events

```typescript
// constants/socket-events.ts (Frontend)
export const SOCKET_EVENTS = {
  // Menu events
  MENU_UPDATED: 'menu:updated',         // Payload: Menu object

  // Queue events
  QUEUE_UPDATED: 'queue:updated',       // Payload: Queue object (antrian baru)
  QUEUE_CALLED: 'queue:called',         // Payload: Queue object (dipanggil)
  QUEUE_COMPLETED: 'queue:completed',   // Payload: Queue object (selesai)

  // Order events
  ORDER_CREATED: 'order:created',       // Payload: Order object
  ORDER_UPDATED: 'order:updated',       // Payload: Order object (status berubah)
} as const;
```

### 8.3 Socket Hook (Frontend)

```typescript
// hooks/useSocket.ts
export const useSocket = () => {
  const socket = getSocketInstance(); // singleton dari lib/socket.ts

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socket.on(event, handler);
    return () => socket.off(event, handler); // cleanup
  }, [socket]);

  return { socket, on, emit: socket.emit.bind(socket) };
};

// Contoh penggunaan di komponen:
useEffect(() => {
  const cleanup = on(SOCKET_EVENTS.MENU_UPDATED, (updatedMenu: Menu) => {
    queryClient.setQueryData(['menus'], (old: Menu[]) =>
      old.map(m => m.id === updatedMenu.id ? updatedMenu : m)
    );
  });
  return cleanup;
}, [on]);
```

---

## 9. FUNCTIONAL REQUIREMENTS IMPLEMENTATION

### FR-01 s/d FR-04 — Antrian FIFO
| ID | Implementasi |
|----|-------------|
| FR-01 | `QueueService.joinQueue()` → Redis INCR + Prisma create |
| FR-02 | WebSocket event `queue:updated` → `QueueDisplay.tsx` |
| FR-03 | `QueueService.callNext()` → Prisma findFirst orderBy createdAt ASC |
| FR-04 | Hitung `activeCount * AVG_SERVICE_TIME` saat join queue |

### FR-05 s/d FR-08 — Pesanan Berbasis Nama
| ID | Implementasi |
|----|-------------|
| FR-05 | `customerName` field REQUIRED di `JoinQueueDto` dan `CreateOrderDto` |
| FR-06 | `OrderCard.tsx` tampilkan nama pelanggan sebagai heading utama |
| FR-07 | GET `/orders?customerName=xxx` endpoint dengan pencarian partial |
| FR-08 | WebSocket `order:updated` saat status → SIAP, tampilkan nama |

### FR-09 s/d FR-11 — Dashboard Menu Real-Time
| ID | Implementasi |
|----|-------------|
| FR-09 | CRUD endpoint menu dengan `@Roles(Role.ADMIN)` guard |
| FR-10 | PATCH `/menu/:id/availability` → update + emit WebSocket |
| FR-11 | Frontend subscribe `menu:updated` → update TanStack Query cache |

### FR-12 s/d FR-14 — Transaksi
| ID | Implementasi |
|----|-------------|
| FR-12 | `OrdersService.create()` dalam Prisma transaction + emit event |
| FR-13 | GET `/reports/daily?date=YYYY-MM-DD` dengan aggregasi Prisma |
| FR-14 | PATCH `/orders/:id/status` dengan role guard KASIR atau ADMIN |

---

## 10. NON-FUNCTIONAL REQUIREMENTS CHECKLIST

### NFR-01 — Response Time < 2 detik
- [ ] Tambahkan index Prisma pada field yang sering di-query: `Queue.status`, `Queue.createdAt`, `Order.status`, `Order.customerName`, `Menu.status`, `Menu.isActive`
- [ ] Gunakan Redis cache untuk data menu publik (TTL 30 detik, invalidate saat ada update)
- [ ] Hindari N+1 query — gunakan `include` Prisma atau batching

```prisma
// Tambahkan di schema.prisma
@@index([status, createdAt]) // di model Queue
@@index([status])            // di model Order
@@index([isActive, status])  // di model Menu
```

### NFR-02 — Uptime ≥ 99%
- [ ] Health check endpoint: GET `/health` → return `{ status: 'ok', timestamp: Date.now() }`
- [ ] Graceful shutdown di `main.ts`
- [ ] Docker restart policy: `restart: unless-stopped`

### NFR-03 — WebSocket Latensi < 500ms
- [ ] Jangan broadcast data besar — kirim hanya data yang berubah (bukan seluruh list)
- [ ] Gunakan Redis pub/sub untuk horizontal scaling (jika perlu multiple instance)

### NFR-04 & NFR-05 — JWT + RBAC
- [ ] JWT expire 8 jam, refresh token 7 hari
- [ ] `@Roles()` decorator + `RolesGuard` pada setiap endpoint sensitif
- [ ] Endpoint publik eksplisit: beri `@Public()` decorator agar tidak kena guard global

### NFR-06 — HTTPS/WSS
- [ ] Di production, paksa HTTPS via platform (Vercel/Railway auto-handle)
- [ ] Socket.io gunakan WSS otomatis jika origin HTTPS

### NFR-07 — Responsif
- [ ] Tailwind breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- [ ] Dashboard sidebar collapsible di mobile
- [ ] QueueDisplay (`/queue`) harus terbaca dari jarak 3 meter — font minimum 48px untuk nomor antrian

### NFR-08 — Onboarding < 30 menit
- [ ] UI bahasa Indonesia sepenuhnya
- [ ] Tombol aksi utama besar dan jelas (min height 44px — touch friendly)
- [ ] Pesan error dalam bahasa Indonesia yang mudah dipahami

### NFR-09 — ≥ 100 Pesanan Bersamaan
- [ ] Connection pool Prisma: `connection_limit=10` di DATABASE_URL
- [ ] Redis untuk session/cache agar tidak query DB untuk setiap request

### NFR-10 — Modular Architecture
- [ ] Setiap fitur dalam NestJS module terpisah
- [ ] Tidak ada circular dependency antar module
- [ ] Dependency injection — tidak ada `new Service()` manual

### NFR-11 — Swagger Docs
- [ ] Setiap DTO memiliki `@ApiProperty()` decorator
- [ ] Setiap controller method memiliki `@ApiOperation()` dan `@ApiResponse()`
- [ ] Akses di `/api/docs`

### NFR-12 — Error Logging
- [ ] Gunakan NestJS built-in Logger
- [ ] Log setiap error dengan context: `this.logger.error(message, error.stack, context)`
- [ ] Di production: integrate dengan Sentry (opsional)

---

## 11. API ENDPOINTS REFERENCE

### Auth
```
POST   /auth/login              Public  Body: { email, password }
POST   /auth/refresh            Public  Body: { refresh_token }
GET    /auth/me                 JWT     Kembalikan data user yang sedang login
POST   /auth/logout             JWT     Invalidate refresh token
```

### Users (Admin Only)
```
GET    /users                   ADMIN   List semua user
POST   /users                   ADMIN   Buat user baru (kasir)
GET    /users/:id               ADMIN
PATCH  /users/:id               ADMIN   Update nama/password/role
DELETE /users/:id               ADMIN   Soft delete (set isActive=false)
```

### Menu
```
GET    /menu                    Public  List menu aktif (dengan filter ?category=)
GET    /menu/:id                Public
POST   /menu                    ADMIN   Buat menu baru
PATCH  /menu/:id                ADMIN   Update menu
PATCH  /menu/:id/availability   ADMIN   { status: 'TERSEDIA' | 'HABIS' }
DELETE /menu/:id                ADMIN   Soft delete
```

### Queue
```
POST   /queue/join              Public  Body: { customerName } → return Queue + nomor
GET    /queue/active            KASIR   List antrian aktif hari ini
GET    /queue/current           Public  Antrian yang sedang dipanggil
POST   /queue/call-next         KASIR   Panggil antrian berikutnya
PATCH  /queue/:id/complete      KASIR   Tandai antrian selesai
PATCH  /queue/:id/skip          KASIR   Lewati antrian (tidak hadir)
GET    /queue/stats             KASIR   Statistik antrian hari ini
```

### Orders
```
POST   /orders                  Public  Body: CreateOrderDto
GET    /orders                  KASIR   List pesanan (filter ?status= ?date=)
GET    /orders/active           KASIR   Pesanan aktif saja (bukan SELESAI/BATAL)
GET    /orders/:id              KASIR
PATCH  /orders/:id/status       KASIR   Body: { status: OrderStatus }
GET    /orders/search           KASIR   Query: ?customerName=xxx
```

### Reports (Admin Only)
```
GET    /reports/daily           ADMIN   Query: ?date=YYYY-MM-DD
GET    /reports/summary         ADMIN   Query: ?startDate= &endDate=
```

### Health
```
GET    /health                  Public  { status: 'ok', timestamp, uptime }
```

---

## 12. URUTAN PENGERJAAN (STEP-BY-STEP)

Ikuti urutan ini. Jangan skip langkah.

### FASE 1 — Setup & Infrastruktur (Lakukan Pertama)
```
[ ] 1.  Inisialisasi monorepo: buat folder apps/backend dan apps/frontend
[ ] 2.  Setup NestJS di apps/backend (nest new backend --skip-git)
[ ] 3.  Setup Next.js di apps/frontend (npx create-next-app@latest frontend)
[ ] 4.  Buat docker-compose.yml → jalankan PostgreSQL + Redis
[ ] 5.  Install dependensi backend: prisma, @nestjs/jwt, @nestjs/passport, passport-jwt,
         bcrypt, ioredis, @nestjs/platform-socket.io, socket.io, @nestjs/swagger,
         class-validator, class-transformer
[ ] 6.  Install dependensi frontend: tanstack/react-query, zustand, socket.io-client,
         react-hook-form, zod, @hookform/resolvers, axios, react-hot-toast, lucide-react
[ ] 7.  Setup shadcn/ui di frontend (npx shadcn@latest init)
[ ] 8.  Buat prisma/schema.prisma sesuai schema di Bagian 4
[ ] 9.  Buat .env files sesuai Bagian 5
[ ] 10. Jalankan prisma migrate dev --name init
[ ] 11. Jalankan prisma db seed
```

### FASE 2 — Backend Core (Sebelum Frontend)
```
[ ] 12. Buat PrismaModule dan PrismaService
[ ] 13. Buat AppGateway (WebSocket Gateway kosong dulu)
[ ] 14. Buat AuthModule (login, JWT strategy, guards, decorators)
[ ] 15. Buat UsersModule (CRUD user)
[ ] 16. Buat MenuModule (CRUD + updateAvailability + emit WebSocket)
[ ] 17. Buat QueueModule (joinQueue FIFO + callNext + emit WebSocket)
[ ] 18. Buat OrdersModule (create order + updateStatus + emit WebSocket)
[ ] 19. Buat ReportsModule (laporan harian)
[ ] 20. Setup Swagger di main.ts
[ ] 21. Test semua endpoint dengan Postman / Swagger UI
```

### FASE 3 — Frontend Publik
```
[ ] 22. Setup providers di app/layout.tsx (QueryClient, Toaster)
[ ] 23. Buat lib/axios.ts dengan interceptors
[ ] 24. Buat lib/socket.ts singleton
[ ] 25. Buat authStore.ts (Zustand)
[ ] 26. Buat halaman /login
[ ] 27. Buat halaman /menu (grid menu + real-time status)
[ ] 28. Buat halaman /order (form pesan + input nama pelanggan)
[ ] 29. Buat halaman /queue (display antrian besar)
```

### FASE 4 — Frontend Dashboard
```
[ ] 30. Buat AuthGuard + dashboard layout (sidebar + header)
[ ] 31. Buat /dashboard/queue (manajemen antrian kasir)
[ ] 32. Buat /dashboard/orders (daftar pesanan aktif kasir)
[ ] 33. Buat /dashboard/menu (manajemen menu admin)
[ ] 34. Buat /dashboard/reports (laporan admin)
```

### FASE 5 — Polish & Deployment
```
[ ] 35. Tambahkan semua index database (NFR-01)
[ ] 36. Test seluruh alur: pelanggan pesan → antrian → kasir proses → selesai
[ ] 37. Test real-time: buka 2 tab browser, update status di satu tab, cek tab lain
[ ] 38. Test responsif di mobile
[ ] 39. Buat Dockerfile untuk backend
[ ] 40. Deploy backend ke Railway
[ ] 41. Deploy frontend ke Vercel
[ ] 42. Update environment variables production
[ ] 43. Final E2E test di production URL
```

---

## ⚠️ ATURAN PENTING — BACA SEBELUM CODING

1. **customerName TIDAK BOLEH KOSONG** di seluruh aplikasi. Validasi di DTO backend DAN di form frontend.

2. **Gunakan Prisma transaction** untuk operasi yang melibatkan lebih dari satu tabel (create order + order items).

3. **Snapshot harga** — saat membuat OrderItem, salin `menu.price` ke `orderItem.unitPrice`. Jangan referensikan harga langsung dari Menu karena harga bisa berubah.

4. **Nomor antrian dari Redis** — jangan generate di aplikasi (race condition). Gunakan `INCR` Redis yang atomic.

5. **Selalu emit WebSocket** setelah operasi yang mengubah state (update menu, antrian baru, status order berubah).

6. **Jangan hardcode URL** — gunakan environment variables untuk semua URL.

7. **Bahasa Indonesia** — seluruh UI, pesan error, label, dan notifikasi dalam Bahasa Indonesia.

8. **Format harga konsisten** — gunakan `formatRupiah()` di semua tempat yang menampilkan harga.

9. **FIFO yang benar** — `callNext()` HARUS `orderBy: { createdAt: 'asc' }` dan hanya mengambil status `MENUNGGU`.

10. **Soft delete** — jangan hapus data dari database. Gunakan `isActive: false` untuk menu dan user.

---

*Dokumen ini dibuat untuk proyek mata kuliah Developing Business Applications — Kelompok 4*
*UMKM Sego Pedes Basman | 2025/2026*
