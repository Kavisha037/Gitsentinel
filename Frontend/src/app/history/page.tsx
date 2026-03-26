'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const router = useRouter();

  useEffect(() => {
    // History is disabled as authentication has been removed for frictionless access
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground font-headline tracking-widest uppercase text-xs">
        REDIRECTING_TO_CORE...
      </div>
    </div>
  );
}
