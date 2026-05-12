import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('AppGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('display:subscribe')
  handleDisplaySubscribe(client: Socket) {
    client.join('display');
  }

  @SubscribeMessage('kasir:subscribe')
  handleKasirSubscribe(client: Socket) {
    client.join('kasir');
  }

  emitMenuAvailabilityChanged(menuId: string, availability: string) {
    this.server.emit('menu:availability-changed', { menuId, availability });
  }

  emitQueueUpdated(orders: any[]) {
    this.server.emit('queue:updated', { orders });
  }

  emitOrderCreated(order: any) {
    this.server.emit('order:created', { order });
  }

  emitOrderCompleted(orderId: string, nomorAntrian: number) {
    this.server.emit('order:completed', { orderId, nomorAntrian });
  }
}
