import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrderStatus, UserRole } from '@prisma/client';

@ApiTags('order')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(UserRole.KASIR, UserRole.ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat pesanan baru (Kasir)' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(dto, user.id);
  }

  @Roles(UserRole.KASIR, UserRole.ADMIN)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pesanan' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'date', required: false })
  findAll(@Query('status') status?: OrderStatus, @Query('date') date?: string) {
    return this.ordersService.findAll(status, date);
  }

  @Roles(UserRole.KASIR, UserRole.ADMIN)
  @Get('active')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pesanan aktif di antrian' })
  findActive() {
    return this.ordersService.findActive();
  }

  @Roles(UserRole.KASIR, UserRole.ADMIN)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail pesanan' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Roles(UserRole.KASIR, UserRole.ADMIN)
  @Get(':id/receipt')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate struk pesanan' })
  getReceipt(@Param('id') id: string) {
    return this.ordersService.getReceipt(id);
  }

  @Roles(UserRole.KASIR, UserRole.ADMIN)
  @Patch(':id/complete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tandai pesanan selesai' })
  complete(@Param('id') id: string) {
    return this.ordersService.complete(id);
  }

  @Roles(UserRole.KASIR, UserRole.ADMIN)
  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Batalkan pesanan' })
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
