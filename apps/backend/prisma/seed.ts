import { PrismaClient, UserRole, MenuAvailability } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      nama: 'Admin Sego Basman',
      role: UserRole.ADMIN,
    },
  });
  console.log('Admin created:', admin.username);

  // Create Kasir user
  const kasirPassword = await bcrypt.hash('kasir123', 12);
  const kasir = await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: {
      username: 'kasir',
      password: kasirPassword,
      nama: 'Kasir Sego Basman',
      role: UserRole.KASIR,
    },
  });
  console.log('Kasir created:', kasir.username);

  // Create Kategori
  const kategoriData = [
    { nama: 'Nasi Pedas', deskripsi: 'Varian nasi pedas khas Basman', urutan: 1 },
    { nama: 'Gorengan', deskripsi: 'Lauk gorengan pelengkap', urutan: 2 },
    { nama: 'Minuman', deskripsi: 'Minuman segar', urutan: 3 },
    { nama: 'Paket', deskripsi: 'Paket hemat nasi + lauk + minuman', urutan: 4 },
  ];

  const kategoriMap: Record<string, string> = {};
  for (const k of kategoriData) {
    const kategori = await prisma.kategori.upsert({
      where: { nama: k.nama },
      update: {},
      create: k,
    });
    kategoriMap[k.nama] = kategori.id;
  }
  console.log('Kategori seeded:', Object.keys(kategoriMap).join(', '));

  // Create Menu
  const menus = [
    { nama: 'Nasi Pedas Tongkol', deskripsi: 'Nasi pedas dengan lauk tongkol sambal merah', harga: 15000, kategori: 'Nasi Pedas' },
    { nama: 'Nasi Pedas Ayam', deskripsi: 'Nasi pedas dengan ayam goreng sambal', harga: 18000, kategori: 'Nasi Pedas' },
    { nama: 'Nasi Pedas Cumi', deskripsi: 'Nasi pedas dengan cumi hitam bumbu meresap', harga: 20000, kategori: 'Nasi Pedas' },
    { nama: 'Nasi Pedas Campur', deskripsi: 'Nasi pedas dengan lauk campur pilihan', harga: 22000, kategori: 'Nasi Pedas' },
    { nama: 'Tempe Goreng', deskripsi: 'Tempe goreng crispy', harga: 3000, kategori: 'Gorengan' },
    { nama: 'Tahu Goreng', deskripsi: 'Tahu goreng garing', harga: 3000, kategori: 'Gorengan' },
    { nama: 'Bakwan Jagung', deskripsi: 'Bakwan jagung renyah', harga: 3000, kategori: 'Gorengan' },
    { nama: 'Es Teh Manis', deskripsi: 'Es teh manis segar', harga: 5000, kategori: 'Minuman' },
    { nama: 'Es Jeruk', deskripsi: 'Es jeruk peras segar', harga: 7000, kategori: 'Minuman' },
    { nama: 'Air Mineral', deskripsi: 'Air mineral dingin', harga: 3000, kategori: 'Minuman' },
    { nama: 'Paket Hemat 1', deskripsi: 'Nasi Pedas Tongkol + Tempe + Es Teh', harga: 20000, kategori: 'Paket' },
    { nama: 'Paket Hemat 2', deskripsi: 'Nasi Pedas Ayam + Tahu + Es Jeruk', harga: 25000, kategori: 'Paket' },
  ];

  for (const menu of menus) {
    await prisma.menu.upsert({
      where: { id: `seed-${menu.nama.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `seed-${menu.nama.replace(/\s+/g, '-').toLowerCase()}`,
        nama: menu.nama,
        deskripsi: menu.deskripsi,
        harga: menu.harga,
        availability: MenuAvailability.TERSEDIA,
        kategoriId: kategoriMap[menu.kategori],
      },
    });
  }
  console.log(`${menus.length} menu items seeded`);

  console.log('Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
