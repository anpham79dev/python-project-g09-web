'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { App } from 'antd';
import { getCurrentUser, hasPermission } from '@/lib/auth';

interface UsePageGuardOptions {
  permission?: string;
  deniedMessage?: string;
  fallbackPath?: string;
}

/**
 * Client-side PBAC guard: redirects to /login when unauthenticated, or to
 * fallbackPath when the user lacks the given permission (SUPER_ADMIN always passes).
 */
export function usePageGuard({
  permission,
  deniedMessage,
  fallbackPath = '/pos',
}: UsePageGuardOptions = {}) {
  const router = useRouter();
  const { message } = App.useApp();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (permission && !hasPermission(user, permission) && user.role !== 'SUPER_ADMIN') {
      if (deniedMessage) message.error(deniedMessage);
      router.push(fallbackPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, message]);
}
