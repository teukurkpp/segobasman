import { useCallback, useEffect } from 'react';
import { getSocketInstance } from '@/lib/socket';

export const useSocket = () => {
  const socket = getSocketInstance();

  const on = useCallback(
    (event: string, handler: (...args: any[]) => void) => {
      socket.on(event, handler);
      return () => socket.off(event, handler);
    },
    [socket]
  );

  return { socket, on, emit: socket.emit.bind(socket) };
};
