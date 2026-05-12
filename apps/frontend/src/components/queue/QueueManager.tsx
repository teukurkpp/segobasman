'use client';
import { Queue } from '@/types/queue.types';
import { useCallNext, useCompleteQueue, useSkipQueue } from '@/hooks/useQueue';
import { cn } from '@/lib/utils';

interface QueueManagerProps {
  currentQueue: Queue | null;
  waitingQueues: Queue[];
}

export default function QueueManager({ currentQueue, waitingQueues }: QueueManagerProps) {
  const callNext = useCallNext();
  const completeQueue = useCompleteQueue();
  const skipQueue = useSkipQueue();

  return (
    <div className="space-y-6">
      {currentQueue && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
          <p className="text-sm font-medium text-green-600 mb-2">Sedang Dipanggil</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-5xl font-black text-green-700">
                {String(currentQueue.queueNumber).padStart(3, '0')}
              </span>
              <p className="text-lg font-semibold text-gray-800 mt-1">{currentQueue.customerName}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => completeQueue.mutate(currentQueue.id)}
                disabled={completeQueue.isPending}
                className="min-h-[44px] px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Selesai
              </button>
              <button
                onClick={() => skipQueue.mutate(currentQueue.id)}
                disabled={skipQueue.isPending}
                className="min-h-[44px] px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Lewati
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => callNext.mutate()}
        disabled={callNext.isPending || waitingQueues.length === 0}
        className="w-full min-h-[60px] py-4 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
      >
        {callNext.isPending ? 'Memanggil...' : 'Panggil Antrian Berikutnya'}
      </button>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Antrian Menunggu ({waitingQueues.length})</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {waitingQueues.map((q) => (
            <div key={q.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-gray-700">
                  {String(q.queueNumber).padStart(3, '0')}
                </span>
                <span className="font-medium text-gray-800">{q.customerName}</span>
              </div>
              {q.estimatedWait !== undefined && (
                <span className="text-xs text-gray-500">~{q.estimatedWait} mnt</span>
              )}
            </div>
          ))}
          {waitingQueues.length === 0 && (
            <p className="text-center text-gray-400 py-8">Tidak ada antrian menunggu</p>
          )}
        </div>
      </div>
    </div>
  );
}
