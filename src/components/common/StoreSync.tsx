'use client';

import { useEffect } from 'react';
import { syncStoreFromServer } from '@/lib/store-sync';

export default function StoreSync() {
  useEffect(() => {
    void syncStoreFromServer();
  }, []);

  return null;
}
