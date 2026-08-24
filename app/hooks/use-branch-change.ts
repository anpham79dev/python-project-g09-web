'use client';

import { useEffect, useRef } from 'react';

/**
 * Subscribes to the global 'artisan_branch_changed' event fired by the branch
 * switcher in the topbar, calling `onChange` with the newly active branch id
 * (falling back to localStorage when the event carries no detail).
 */
export function useBranchChange(onChange: (branchId: string | null) => void) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const handleBranchChange = (e: any) => {
      const branchId = e.detail || (typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : null);
      onChangeRef.current(branchId);
    };
    window.addEventListener('artisan_branch_changed', handleBranchChange);
    return () => window.removeEventListener('artisan_branch_changed', handleBranchChange);
  }, []);
}
