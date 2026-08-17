import { ALL_PERMISSION_CODES, SYSTEM_ROLES, getRequiredPermissionForRoute } from './rbac-config';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: string; // e.g. 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | or custom role code
  roleId?: string;
  roleName?: string;
  permissions?: string[];
  permissionsVersion?: number;
  defaultBranchId?: string | null;
  defaultBranchName?: string | null;
  lastActiveBranchId?: string | null;
  token: string;
}

/**
 * Get current authenticated user from browser LocalStorage.
 */
export const getCurrentUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) return null;
    const user = JSON.parse(userStr);

    // Ensure permissions array is populated
    if (!Array.isArray(user.permissions) || user.permissions.length === 0) {
      if (user.role === 'SUPER_ADMIN') {
        user.permissions = ALL_PERMISSION_CODES;
      } else if (SYSTEM_ROLES[user.role]) {
        user.permissions = SYSTEM_ROLES[user.role].permissions;
      } else {
        user.permissions = [];
      }
    }

    return { ...user, token };
  } catch {
    return null;
  }
};

/**
 * Persist authentication session in LocalStorage and Cookies.
 */
export const setAuthSession = (
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
    roleId?: string;
    roleName?: string;
    permissions?: string[];
    permissionsVersion?: number;
    defaultBranchId?: string | null;
    defaultBranchName?: string | null;
    lastActiveBranchId?: string | null;
  },
  token: string
) => {
  if (typeof window === 'undefined') return;

  // Resolve permissions if missing
  let perms = user.permissions;
  if (!Array.isArray(perms) || perms.length === 0) {
    if (user.role === 'SUPER_ADMIN') {
      perms = ALL_PERMISSION_CODES;
    } else if (SYSTEM_ROLES[user.role]) {
      perms = SYSTEM_ROLES[user.role].permissions;
    } else {
      perms = [];
    }
  }

  const fullUserData: AuthUser = {
    ...user,
    permissions: perms,
    permissionsVersion: user.permissionsVersion || 1,
    token,
  };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(fullUserData));

  const activeBranch = user.lastActiveBranchId || user.defaultBranchId;
  if (activeBranch) {
    localStorage.setItem('artisan_active_branch_id', activeBranch);
  }

  // Synchronize auth session into browser cookies for Edge Middleware & SSR Hydration
  try {
    document.cookie = `artisan_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `artisan_user_role=${encodeURIComponent(user.role)}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `artisan_user_name=${encodeURIComponent(user.fullName || '')}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `artisan_user_id=${encodeURIComponent(user.id || '')}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `artisan_permissions=${encodeURIComponent(JSON.stringify(perms))}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `artisan_perm_version=${encodeURIComponent(String(fullUserData.permissionsVersion))}; path=/; max-age=604800; SameSite=Lax`;
  } catch (e) {
    console.error('Failed to set auth cookies:', e);
  }
};

/**
 * Clear authentication session and cookies.
 */
export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  try {
    document.cookie = 'artisan_token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'artisan_user_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'artisan_user_name=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'artisan_user_id=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'artisan_permissions=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'artisan_perm_version=; path=/; max-age=0; SameSite=Lax';
  } catch (e) {
    console.error('Failed to clear auth cookies:', e);
  }
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

/**
 * PBAC: Check if user has a specific atomic permission.
 * SUPER_ADMIN always has all permissions.
 */
export const hasPermission = (user: AuthUser | null | undefined, permissionCode: string): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;

  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(permissionCode);
  }

  // Fallback to system role
  if (SYSTEM_ROLES[user.role]) {
    return SYSTEM_ROLES[user.role].permissions.includes(permissionCode);
  }

  return false;
};

/**
 * PBAC: Check if user has AT LEAST ONE of the requested permissions.
 */
export const hasAnyPermission = (user: AuthUser | null | undefined, permissionCodes: string[]): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return permissionCodes.some((code) => hasPermission(user, code));
};

/**
 * PBAC: Check if user has ALL of the requested permissions.
 */
export const hasAllPermissions = (user: AuthUser | null | undefined, permissionCodes: string[]): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return permissionCodes.every((code) => hasPermission(user, code));
};

/**
 * Legacy compatibility helper: check if user is Admin or SuperAdmin.
 */
export const hasAdminAccess = (user?: AuthUser | null | string): boolean => {
  if (!user) return false;
  if (typeof user === 'string') {
    return user === 'SUPER_ADMIN' || user === 'ADMIN';
  }
  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || hasPermission(user, 'dashboard:view');
};

/**
 * Check if user is specifically SUPER_ADMIN.
 */
export const isSuperAdmin = (user?: AuthUser | null | string): boolean => {
  if (!user) return false;
  const role = typeof user === 'string' ? user : user.role;
  return role === 'SUPER_ADMIN';
};

/**
 * Helper to determine if a user can access a specific route pathname.
 */
export const canAccessRoute = (pathname: string, user?: AuthUser | null): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;

  const requiredPerm = getRequiredPermissionForRoute(pathname);
  if (!requiredPerm) return true; // Public or unconstrained authenticated route

  return hasPermission(user, requiredPerm);
};

export const hasRole = (allowedRoles: string[]): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return allowedRoles.includes(user.role);
};
