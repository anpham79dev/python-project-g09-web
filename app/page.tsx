import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SYSTEM_ROLES, ALL_PERMISSION_CODES } from '@/lib/rbac-config';

export const dynamic = 'force-dynamic';

function isTokenValid(token?: string | null): boolean {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return false;
  }
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
      const payload = JSON.parse(jsonPayload);
      if (payload.exp && typeof payload.exp === 'number') {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        if (payload.exp < nowInSeconds) {
          return false;
        }
      }
      return true;
    }
    return true;
  } catch {
    return true;
  }
}

export default async function RootPage() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get('artisan_token')?.value;
  const role = cookieStore.get('artisan_user_role')?.value;
  const rawPerms = cookieStore.get('artisan_permissions')?.value;

  const tokenValid = isTokenValid(rawToken);

  if (!tokenValid) {
    redirect('/login');
  }

  let permissions: string[] = [];
  if (rawPerms) {
    try {
      permissions = JSON.parse(decodeURIComponent(rawPerms));
    } catch {
      permissions = [];
    }
  }

  if (permissions.length === 0 && role) {
    if (role === 'SUPER_ADMIN') {
      permissions = ALL_PERMISSION_CODES;
    } else if (SYSTEM_ROLES[role]) {
      permissions = SYSTEM_ROLES[role].permissions;
    }
  }

  if (role === 'SUPER_ADMIN' || permissions.includes('dashboard:view')) {
    redirect('/dashboard');
  }

  redirect('/pos');
}
