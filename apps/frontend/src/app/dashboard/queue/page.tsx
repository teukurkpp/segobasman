'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveQueues, useCurrentQueue, useQueueStats } from '@/hooks/useQueue';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/constants/socket-events';
import { Queue } from '@/types/queue.types';
import QueueManager from '@/components/queue/QueueManager';
import Header from '@/components/layout/Header';

export default function DashboardQueuePage() {
  const { data: activeQueues = [] } = useActiveQueues();
  const { data: currentQueue } = useCurrentQueue();
  const { data: stats } = useQueueStats();
  const queryClient = useQueryClient();
  const { on } = useSocket();

  const waitingQueues = activeQueues.filter(q => q.status === 'MENUNGGU');

  useEffect(() => {
    const cleanup1 = on(SOCKET_EVENTS.QUEUE_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
    });
    const cleanup2 = on(SOCKET_EVENTS.QUEUE_CALLED, (queue: Queue) => {
      queryClient.setQueryData(['queues', 'current'], queue);
      queryClient.invalidateQueries({ queryKey: ['queues', 'active'] });
    });
    const cleanup3 = on(SOCKET_EVENTS.QUEUE_COMPLETED, () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
    });
    return () => { cleanup1(); cleanup2(); cleanup3(); };
  }, [on, queryClient]);

  return (
    <div>
      <Header title="Manajemen Antrian" />
      <div className="p-6">
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Menunggu', value: stats.menunggu, color: 'text-yellow-600 bg-yellow-50' },
              { label: 'Dipanggil', value: stats.dipanggil, color: 'text-blue-600 bg-blue-50' },
              { label: 'Selesai', value: stats.selesai, color: 'text-green-600 bg-green-50' },
              { label: 'Total', value: stats.total, color: 'text-gray-600 bg-gray-50' },
            ].map(stat => (
              <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
                <p className="text-sm font-medium opacity-70">{stat.label}</p>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <QueueManager currentQueue={currentQueue || null} waitingQueues={waitingQueues} />
        </div>
      </div>
    </div>
  );
}
