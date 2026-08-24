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

  const token = request.cookies.get('artisan_token')?.value;
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

  // 1. Check unauthenticated access to protected routes
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('reason', 'unauthenticated');
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect logged-in users away from /login
  if (pathname === '/login' && token) {
    if (role === 'SUPER_ADMIN' || permissions.includes('dashboard:view')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/pos', request.url));
  }

  // 2b. Root path always redirects: to /login when unauthenticated, otherwise to the user's home
  if (pathname === '/') {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('reason', 'unauthenticated');
      return NextResponse.redirect(loginUrl);
    }
    if (role === 'SUPER_ADMIN' || permissions.includes('dashboard:view')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/pos', request.url));
  }

  // 3. PBAC Route Access Evaluation
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
