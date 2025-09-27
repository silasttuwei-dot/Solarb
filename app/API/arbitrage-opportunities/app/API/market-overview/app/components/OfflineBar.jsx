'use client';
import { useEffect, useState } from 'react';

export default function OfflineBar() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const toggle = () => setOnline(navigator.onLine);
    window.addEventListener('online', toggle);
    window.addEventListener('offline', toggle);
    return () => {
      window.removeEventListener('online', toggle);
      window.removeEventListener('offline', toggle);
    };
  }, []);
  if (online) return null;
  return <div className="h-6 bg-red-600 text-white text-xs flex items-center justify-center">You’re offline – data may be stale</div>;
}
