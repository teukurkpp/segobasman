'use client';
import { Queue } from '@/types/queue.types';

interface QueueTicketProps {
  queue: Queue;
}

export default function QueueTicket({ queue }: QueueTicketProps) {
  return (
    <div className="bg-white border-4 border-red-700 rounded-2xl p-8 text-center max-w-sm mx-auto shadow-xl">
      <div className="text-red-700 font-bold text-lg mb-1">Sego Pedes Basman</div>
      <div className="text-gray-500 text-sm mb-6">Tiket Antrian</div>
      <div className="text-8xl font-black text-red-700 leading-none mb-4">
        {String(queue.queueNumber).padStart(3, '0')}
      </div>
      <div className="text-xl font-bold text-gray-800 mb-2">{queue.customerName}</div>
      {queue.estimatedWait !== undefined && queue.estimatedWait > 0 && (
        <div className="text-sm text-gray-500 bg-gray-100 rounded-lg px-4 py-2 mt-4">
          Estimasi waktu tunggu: <span className="font-bold text-gray-800">{queue.estimatedWait} menit</span>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400">
        {new Date(queue.createdAt).toLocaleString('id-ID')}
      </div>
    </div>
  );
}
