import { useEffect } from 'react';
import { getSocket } from '../api/socket';
import { useAuthStore } from '../store/auth.store';

/**
 * Hook qui connecte le Socket.IO.
 * À monter une seule fois dans l'app authentifiée.
 */
export function useSocket(): void {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    getSocket(accessToken);
  }, [accessToken]);
}
