/*
  Warnings:

  - The values [MENUNGGU,DIPROSES,SIAP] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `unitPrice` on the `order_items` table. All the data in the column will be lost.
  - You are about to alter the column `subtotal` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to drop the column `customerName` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `processedById` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `queueId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `daily_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `menus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `queues` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hargaSatuan` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kasirId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaPelanggan` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomorAntrian` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalHarga` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'KASIR');

-- CreateEnum
CREATE TYPE "MenuAvailability" AS ENUM ('TERSEDIA', 'HABIS');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('AKTIF', 'SELESAI', 'DIBATALKAN');
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'AKTIF';
COMMIT;

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_menuId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_processedById_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_queueId_fkey";

-- DropIndex
DROP INDEX "orders_customerName_idx";

-- DropIndex
DROP INDEX "orders_orderNumber_key";

-- DropIndex
DROP INDEX "orders_queueId_key";

-- DropIndex
DROP INDEX "orders_status_idx";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "unitPrice",
ADD COLUMN     "hargaSatuan" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "quantity" DROP DEFAULT,
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "customerName",
DROP COLUMN "notes",
DROP COLUMN "orderNumber",
DROP COLUMN "processedById",
DROP COLUMN "queueId",
DROP COLUMN "totalAmount",
DROP COLUMN "updatedAt",
ADD COLUMN     "kasirId" TEXT NOT NULL,
ADD COLUMN     "namaPelanggan" TEXT NOT NULL,
ADD COLUMN     "nomorAntrian" INTEGER NOT NULL,
ADD COLUMN     "totalHarga" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'AKTIF';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "nama" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- DropTable
DROP TABLE "daily_reports";

-- DropTable
DROP TABLE "menus";

-- DropTable
DROP TABLE "queues";

-- DropEnum
DROP TYPE "MenuCategory";

-- DropEnum
DROP TYPE "MenuStatus";

-- DropEnum
DROP TYPE "QueueStatus";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "harga" DECIMAL(10,2) NOT NULL,
    "gambar" TEXT,
    "availability" "MenuAvailability" NOT NULL DEFAULT 'TERSEDIA',
    "kategoriId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kategori_nama_key" ON "kategori"("nama");

-- CreateIndex
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_nomorAntrian_createdAt_idx" ON "orders"("nomorAntrian", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_kasirId_fkey" FOREIGN KEY ("kasirId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
