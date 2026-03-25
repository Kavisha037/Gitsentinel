'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Manages scan tracking for general telemetry.
 * Limits have been removed to allow frictionless scanning.
 */
export function useScanManager() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const incrementScanCount = useCallback(async () => {
    // Analytics tracking could happen here anonymously
  }, []);

  return {
    remainingScans: Infinity,
    isLimitReached: false,
    incrementScanCount,
    isLoading: !mounted,
    isAuthenticated: false
  };
}