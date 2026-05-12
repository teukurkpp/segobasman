import { create } from 'zustand';
import { Queue } from '@/types/queue.types';

interface QueueState {
  currentQueue: Queue | null;
  activeQueues: Queue[];
  setCurrentQueue: (queue: Queue | null) => void;
  setActiveQueues: (queues: Queue[]) => void;
  addOrUpdateQueue: (queue: Queue) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  currentQueue: null,
  activeQueues: [],
  setCurrentQueue: (queue) => set({ currentQueue: queue }),
  setActiveQueues: (queues) => set({ activeQueues: queues }),
  addOrUpdateQueue: (queue) =>
    set((state) => {
      const exists = state.activeQueues.find((q) => q.id === queue.id);
      if (exists) {
        return { activeQueues: state.activeQueues.map((q) => q.id === queue.id ? queue : q) };
      }
      return { activeQueues: [...state.activeQueues, queue] };
    }),
}));
