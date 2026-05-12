'use client';
import { Queue } from '@/types/queue.types';

interface QueueDisplayProps {
  currentQueue: Queue | null;
  waitingQueues: Queue[];
}

export default function QueueDisplay({ currentQueue, waitingQueues }: QueueDisplayProps) {
  return (
    <div className="min-h-screen bg-red-700 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-yellow-300 mb-2">Sego Pedes Basman</h1>
        <p className="text-red-200 text-xl">Display Antrian</p>
      </div>

      <div className="bg-white text-red-700 rounded-3xl p-12 text-center mb-12 w-full max-w-lg shadow-2xl">
        <p className="text-2xl font-medium text-gray-600 mb-4">Sedang Dilayani</p>
        {currentQueue ? (
          <>
            <div className="text-9xl font-black leading-none mb-4">
              {String(currentQueue.queueNumber).padStart(3, '0')}
            </div>
            <p className="text-3xl font-bold text-gray-800">{currentQueue.customerName}</p>
          </>
        ) : (
          <div className="text-6xl font-black text-gray-300">---</div>
        )}
      </div>

      <div className="w-full max-w-lg">
        <h2 className="text-xl font-bold text-yellow-300 mb-4 text-center">Antrian Berikutnya</h2>
        <div className="space-y-3">
          {waitingQueues.slice(0, 5).map((q) => (
            <div
              key={q.id}
              className="bg-red-600 rounded-xl px-6 py-4 flex items-center justify-between"
            >
              <span className="text-4xl font-black">{String(q.queueNumber).padStart(3, '0')}</span>
              <span className="text-xl font-medium">{q.customerName}</span>
            </div>
          ))}
          {waitingQueues.length === 0 && (
            <p className="text-center text-red-300 text-lg">Tidak ada antrian menunggu</p>
          )}
        </div>
      </div>
    </div>
  );
}
