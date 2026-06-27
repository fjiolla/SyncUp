import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · SyncUp` : 'SyncUp · Find your community';
  }, [title]);
}
