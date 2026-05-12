import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List antrian aktif (publik untuk display TV)' })
  getActive() {
    return this.queueService.getActive();
  }

  @Public()
  @Get('current')
  @ApiOperation({ summary: 'Pesanan pertama yang sedang dieksekusi' })
  getCurrent() {
    return this.queueService.getCurrent();
  }

  @Roles(UserRole.KASIR, UserRole.ADMIN)
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statistik antrian hari ini' })
  getStats() {
    return this.queueService.getStats();
  }
}
