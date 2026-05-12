import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KategoriModule } from './kategori/kategori.module';
import { MenuModule } from './menu/menu.module';
import { QueueModule } from './queue/queue.module';
import { OrdersModule } from './orders/orders.module';
import { ReportsModule } from './reports/reports.module';
import { GatewayModule } from './gateway/gateway.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    GatewayModule,
    AuthModule,
    UsersModule,
    KategoriModule,
    MenuModule,
    QueueModule,
    OrdersModule,
    ReportsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
