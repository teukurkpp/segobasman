import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';

@Injectable()
export class KategoriService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.kategori.findMany({ orderBy: { urutan: 'asc' } });
  }

  async findOne(id: string) {
    const kategori = await this.prisma.kategori.findUnique({
      where: { id },
      include: { menus: true },
    });
    if (!kategori) throw new NotFoundException('Kategori tidak ditemukan');
    return kategori;
  }

  async create(dto: CreateKategoriDto) {
    const exists = await this.prisma.kategori.findUnique({ where: { nama: dto.nama } });
    if (exists) throw new ConflictException('Nama kategori sudah ada');
    return this.prisma.kategori.create({ data: dto });
  }

  async update(id: string, dto: UpdateKategoriDto) {
    await this.findOne(id);
    return this.prisma.kategori.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.kategori.delete({ where: { id } });
  }
}
