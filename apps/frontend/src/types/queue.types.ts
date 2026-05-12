export type QueueStatus = 'MENUNGGU' | 'DIPANGGIL' | 'SELESAI' | 'MELEWATI';

export interface Queue {
  id: string;
  queueNumber: number;
  customerName: string;
  status: QueueStatus;
  calledAt?: string;
  completedAt?: string;
  estimatedWait?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  total: number;
  menunggu: number;
  dipanggil: number;
  selesai: number;
  melewati: number;
}
