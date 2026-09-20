import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequiredPermissionForRoute, SYSTEM_ROLES, ALL_PERMISSION_CODES } from './lib/rbac-config';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/pos',
  '/products',
  '/branches',
  '/shifts',
  '/accounting',
  '/users',
  '/settings',
  '/orders',
];

function isTokenValid(token?: string | null): boolean {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return false;
  }
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const rawToken = request.cookies.get('artisan_token')?.value;
  const isExpiredOrInvalid = rawToken ? !isTokenValid(rawToken) : false;
  const token = isExpiredOrInvalid ? null : rawToken;
  const role = request.cookies.get('artisan_user_role')?.value;
  const rawPerms = request.cookies.get('artisan_permissions')?.value;

  let permissions: string[] = [];
  if (rawPerms) {
    try {
      permissions = JSON.parse(decodeURIComponent(rawPerms));
    } catch {
      permissions = [];
    }
  }

  // Fallback if permissions cookie is empty
  if (permissions.length === 0 && role) {
    if (role === 'SUPER_ADMIN') {
      permissions = ALL_PERMISSION_CODES;
    } else if (SYSTEM_ROLES[role]) {
      permissions = SYSTEM_ROLES[role].permissions;
    }
  }

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Helper to attach cookie cleanup if token was expired
  const attachCleanupIfNeeded = (res: NextResponse) => {
    if (isExpiredOrInvalid) {
      res.cookies.delete('artisan_token');
      res.cookies.delete('artisan_user_role');
      res.cookies.delete('artisan_user_name');
      res.cookies.delete('artisan_user_id');
      res.cookies.delete('artisan_permissions');
      res.cookies.delete('artisan_perm_version');
    }
    return res;
  };

  // 1. Root route '/' handling: redirect to ERP if token is valid, otherwise redirect to /login
  if (pathname === '/') {
    if (token) {
      if (role === 'SUPER_ADMIN' || permissions.includes('dashboard:view')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/pos', request.url));
    }
    const loginUrl = new URL('/login', request.url);
    return attachCleanupIfNeeded(NextResponse.redirect(loginUrl));
  }

  // 2. Check unauthenticated or expired token access to protected routes
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('reason', 'unauthenticated');
    loginUrl.searchParams.set('redirect', pathname);
    return attachCleanupIfNeeded(NextResponse.redirect(loginUrl));
  }

  // 3. Redirect logged-in users away from /login
  if (pathname === '/login' && token) {
    if (role === 'SUPER_ADMIN' || permissions.includes('dashboard:view')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/pos', request.url));
  }

  // 4. PBAC Route Access Evaluation
  if (isProtectedRoute && token) {
    if (role === 'SUPER_ADMIN') {
      return NextResponse.next();
    }

    const requiredPermission = getRequiredPermissionForRoute(pathname);
    if (requiredPermission) {
      const hasPerm = permissions.includes(requiredPermission);
      if (!hasPerm) {
        const fallbackPath = permissions.includes('dashboard:view') ? '/dashboard' : '/pos';
        const fallbackUrl = new URL(fallbackPath, request.url);
        fallbackUrl.searchParams.set('reason', 'forbidden');
        fallbackUrl.searchParams.set('required_perm', requiredPermission);
        return NextResponse.redirect(fallbackUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Khớp tất cả các đường dẫn ngoại trừ static files
     */
    '/((?!_next/static|_next/image|favicon.ico|emerald_bakery_logo.png|icon.png).*)',
  ],
};
