'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentQueue, useActiveQueues } from '@/hooks/useQueue';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/constants/socket-events';
import { Queue } from '@/types/queue.types';
import QueueDisplay from '@/components/queue/QueueDisplay';

export default function QueuePage() {
  const { data: currentQueue } = useCurrentQueue();
  const { data: activeQueues = [] } = useActiveQueues();
  const queryClient = useQueryClient();
  const { on } = useSocket();

  const waitingQueues = activeQueues.filter(q => q.status === 'MENUNGGU');

  useEffect(() => {
    const cleanupCalled = on(SOCKET_EVENTS.QUEUE_CALLED, (queue: Queue) => {
      queryClient.setQueryData(['queues', 'current'], queue);
      queryClient.invalidateQueries({ queryKey: ['queues', 'active'] });
    });
    const cleanupUpdated = on(SOCKET_EVENTS.QUEUE_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
    });
    const cleanupCompleted = on(SOCKET_EVENTS.QUEUE_COMPLETED, () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
    });
    return () => {
      cleanupCalled();
      cleanupUpdated();
      cleanupCompleted();
    };
  }, [on, queryClient]);

  return <QueueDisplay currentQueue={currentQueue || null} waitingQueues={waitingQueues} />;
}
