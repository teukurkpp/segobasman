import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { AppGateway } from '../gateway/app.gateway';
import { MenuAvailability } from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private appGateway: AppGateway,
  ) {}

  async findAll(kategoriId?: string) {
    return this.prisma.menu.findMany({
      where: { ...(kategoriId ? { kategoriId } : {}) },
      include: { kategori: true },
      orderBy: [{ kategori: { urutan: 'asc' } }, { nama: 'asc' }],
    });
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { kategori: true },
    });
    if (!menu) throw new NotFoundException('Menu tidak ditemukan');
    return menu;
  }

  async create(dto: CreateMenuDto) {
    return this.prisma.menu.create({
      data: dto,
      include: { kategori: true },
    });
  }

  async update(id: string, dto: UpdateMenuDto) {
    await this.findOne(id);
    return this.prisma.menu.update({
      where: { id },
      data: dto,
      include: { kategori: true },
    });
  }

  async updateAvailability(id: string, availability: MenuAvailability) {
    await this.findOne(id);
    const menu = await this.prisma.menu.update({
      where: { id },
      data: { availability },
      include: { kategori: true },
    });
    this.appGateway.emitMenuAvailabilityChanged(id, availability);
    return menu;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.menu.delete({ where: { id } });
  }
}
