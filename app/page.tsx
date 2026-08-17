import React from 'react';
import { cookies } from 'next/headers';
import LandingPageView from '@/app/components/landing-page-view';
import { LandingPageConfig, DEFAULT_LANDING_CONFIG } from '@/lib/landing-config';
import { AuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getLandingConfig(): Promise<LandingPageConfig> {
  const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  try {
    const res = await fetch(`${apiUrl}/landing-page-config`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.brand) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Server fetch landing config failed, using fallback:', err);
  }
  return DEFAULT_LANDING_CONFIG;
}

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('artisan_token')?.value;
  const role = cookieStore.get('artisan_user_role')?.value;
  const userName = cookieStore.get('artisan_user_name')?.value;
  const userId = cookieStore.get('artisan_user_id')?.value;

  let initialUser: AuthUser | null = null;
  if (token && role) {
    initialUser = {
      id: userId ? decodeURIComponent(userId) : 'user',
      username: 'user',
      fullName: userName ? decodeURIComponent(userName) : 'Quản trị viên',
      role: decodeURIComponent(role),
      token: decodeURIComponent(token),
    };
  }

  const config = await getLandingConfig();
  return <LandingPageView config={config} initialUser={initialUser} isPreview={false} />;
}
