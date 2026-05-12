import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSales(period: string, date?: string) {
    const baseDate = date ? new Date(date) : new Date();
    let start: Date;
    let end: Date;

    if (period === 'weekly') {
      start = startOfWeek(baseDate, { weekStartsOn: 1 });
      end = endOfWeek(baseDate, { weekStartsOn: 1 });
    } else if (period === 'monthly') {
      start = startOfMonth(baseDate);
      end = endOfMonth(baseDate);
    } else {
      start = startOfDay(baseDate);
      end = endOfDay(baseDate);
    }

    const [totalOrders, completedOrders, cancelledOrders, revenueData, topMenus] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
      this.prisma.order.count({ where: { status: OrderStatus.SELESAI, createdAt: { gte: start, lte: end } } }),
      this.prisma.order.count({ where: { status: OrderStatus.DIBATALKAN, createdAt: { gte: start, lte: end } } }),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.SELESAI, createdAt: { gte: start, lte: end } },
        _sum: { totalHarga: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['menuId'],
        where: { order: { status: OrderStatus.SELESAI, createdAt: { gte: start, lte: end } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const topMenusWithNames = await Promise.all(
      topMenus.map(async (item) => {
        const menu = await this.prisma.menu.findUnique({ where: { id: item.menuId }, select: { nama: true } });
        return { nama: menu?.nama, terjual: item._sum.quantity };
      })
    );

    return {
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: Number(revenueData._sum.totalHarga ?? 0),
      topMenus: topMenusWithNames,
    };
  }
}
