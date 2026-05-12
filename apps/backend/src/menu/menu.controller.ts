import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { MenuAvailability, UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateAvailabilityDto {
  @ApiProperty({ enum: MenuAvailability })
  @IsEnum(MenuAvailability)
  availability: MenuAvailability;
}

@ApiTags('menu')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List semua menu (publik)' })
  @ApiQuery({ name: 'kategoriId', required: false })
  findAll(@Query('kategoriId') kategoriId?: string) {
    return this.menuService.findAll(kategoriId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Detail menu' })
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah menu baru (Admin)' })
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @Patch(':id/availability')
  @Roles(UserRole.ADMIN, UserRole.KASIR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ketersediaan menu (Admin & Kasir)' })
  updateAvailability(@Param('id') id: string, @Body() body: UpdateAvailabilityDto) {
    return this.menuService.updateAvailability(id, body.availability);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus menu (Admin)' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
