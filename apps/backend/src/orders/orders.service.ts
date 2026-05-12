import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, MenuAvailability } from '@prisma/client';
import { startOfDay } from 'date-fns';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private appGateway: AppGateway,
  ) {}

  private async generateNomorAntrian(): Promise<number> {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today.getTime() + 86400000);
    const count = await this.prisma.order.count({
      where: { createdAt: { gte: today, lt: tomorrow } },
    });
    return count + 1;
  }

  async create(dto: CreateOrderDto, kasirId: string) {
    return this.prisma.$transaction(async (tx) => {
      const menuIds = dto.items.map(i => i.menuId);
      const menus = await tx.menu.findMany({ where: { id: { in: menuIds } } });

      if (menus.length !== menuIds.length) {
        throw new BadRequestException('Beberapa menu tidak ditemukan');
      }

      const habis = menus.filter(m => m.availability === MenuAvailability.HABIS);
      if (habis.length > 0) {
        throw new BadRequestException(`Menu sedang habis: ${habis.map(m => m.nama).join(', ')}`);
      }

      const menuMap = new Map(menus.map(m => [m.id, m]));
      let totalHarga = 0;
      const orderItems = dto.items.map(item => {
        const menu = menuMap.get(item.menuId)!;
        const hargaSatuan = Number(menu.harga);
        const subtotal = hargaSatuan * item.quantity;
        totalHarga += subtotal;
        return { menuId: item.menuId, quantity: item.quantity, hargaSatuan, subtotal };
      });

      const nomorAntrian = await this.generateNomorAntrian();

      const order = await tx.order.create({
        data: {
          nomorAntrian,
          namaPelanggan: dto.namaPelanggan,
          totalHarga,
          kasirId,
          items: { create: orderItems },
        },
        include: { items: { include: { menu: true } }, kasir: { select: { nama: true } } },
      });

      // Broadcast ke semua client
      const activeOrders = await tx.order.findMany({
        where: { status: OrderStatus.AKTIF },
        orderBy: { createdAt: 'asc' },
        include: { items: { include: { menu: true } } },
      });
      this.appGateway.emitQueueUpdated(activeOrders);
      this.appGateway.emitOrderCreated(order);

      return order;
    });
  }

  async findAll(status?: OrderStatus, date?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      where.createdAt = { gte: startOfDay(d), lt: new Date(d.getTime() + 86400000) };
    }
    return this.prisma.order.findMany({
      where,
      include: { items: { include: { menu: true } }, kasir: { select: { nama: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.order.findMany({
      where: { status: OrderStatus.AKTIF },
      include: { items: { include: { menu: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { menu: true } }, kasir: { select: { nama: true } } },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');
    return order;
  }

  async complete(id: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.SELESAI, completedAt: new Date() },
      include: { items: { include: { menu: true } } },
    });

    const activeOrders = await this.prisma.order.findMany({
      where: { status: OrderStatus.AKTIF },
      orderBy: { createdAt: 'asc' },
      include: { items: { include: { menu: true } } },
    });
    this.appGateway.emitQueueUpdated(activeOrders);
    this.appGateway.emitOrderCompleted(id, order.nomorAntrian);
    return order;
  }

  async cancel(id: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.DIBATALKAN },
      include: { items: { include: { menu: true } } },
    });

    const activeOrders = await this.prisma.order.findMany({
      where: { status: OrderStatus.AKTIF },
      orderBy: { createdAt: 'asc' },
      include: { items: { include: { menu: true } } },
    });
    this.appGateway.emitQueueUpdated(activeOrders);
    return order;
  }

  async getReceipt(id: string) {
    const order = await this.findOne(id);
    return {
      nomorAntrian: order.nomorAntrian,
      namaPelanggan: order.namaPelanggan,
      items: order.items.map((item: any) => ({
        nama: item.menu.nama,
        quantity: item.quantity,
        hargaSatuan: Number(item.hargaSatuan),
        subtotal: Number(item.subtotal),
      })),
      totalHarga: Number(order.totalHarga),
      kasir: order.kasir.nama,
      createdAt: order.createdAt,
    };
  }
}
