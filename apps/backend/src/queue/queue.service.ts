import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { startOfDay } from 'date-fns';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async getActive() {
    return this.prisma.order.findMany({
      where: { status: OrderStatus.AKTIF },
      include: { items: { include: { menu: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getCurrent() {
    // Kembalikan antrian pertama (terlama) yang masih AKTIF
    return this.prisma.order.findFirst({
      where: { status: OrderStatus.AKTIF },
      orderBy: { createdAt: 'asc' },
      include: { items: { include: { menu: true } } },
    });
  }

  async getStats() {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today.getTime() + 86400000);
    const [total, aktif, selesai, dibatalkan] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.order.count({ where: { status: OrderStatus.AKTIF, createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.order.count({ where: { status: OrderStatus.SELESAI, createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.order.count({ where: { status: OrderStatus.DIBATALKAN, createdAt: { gte: today, lt: tomorrow } } }),
    ]);
    return { total, aktif, selesai, dibatalkan };
  }
}
