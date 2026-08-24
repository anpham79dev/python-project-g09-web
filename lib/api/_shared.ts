// Internal helpers shared across domain API modules (mock-mode toggle, simulated
// network delay, and stateful mock storage for entities referenced by more than
// one domain). Not part of the public `@/lib/api` surface.
import {
  Product,
  Order,
  User,
  Role,
  AuditLog,
  Branch,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_ROLES,
  INITIAL_AUDIT_LOGS,
  INITIAL_BRANCHES,
} from '../mock-data';

// Kiểm tra biến môi trường chuyển đổi mock <-> API thật
export const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
};

// Giả lập độ trễ mạng khi dùng mock data (~300ms)
export const simulateDelay = <T>(data: T, delay = 300): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

// Key LocalStorage cho Stateful Mocking
export const LS_KEYS = {
  PRODUCTS: 'artisan_mock_products',
  ORDERS: 'artisan_mock_orders',
  USERS: 'artisan_mock_users',
  ROLES: 'artisan_mock_roles',
  PERMISSIONS: 'artisan_mock_permissions',
  AUDIT_LOGS: 'artisan_mock_audit_logs',
  SHIFTS: 'artisan_mock_shifts',
  BRANCHES: 'artisan_mock_branches',
  TEMPLATES: 'artisan_mock_shift_templates',
  SETTINGS: 'artisan_mock_system_settings',
  STOCKS: 'artisan_mock_warehouse_stocks',
  TRANSACTIONS: 'artisan_mock_transactions',
};

// Helpers lấy/lưu mock data trong browser session
export const getStoredProducts = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const stored = localStorage.getItem(LS_KEYS.PRODUCTS);
  if (!stored) {
    localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(products));
  }
};

export const getStoredOrders = (): Order[] => {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  const stored = localStorage.getItem(LS_KEYS.ORDERS);
  if (!stored) {
    localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_ORDERS;
  }
};

export const saveStoredOrders = (orders: Order[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(orders));
  }
};

export const getStoredUsers = (): User[] => {
  if (typeof window === 'undefined') return INITIAL_USERS;
  const stored = localStorage.getItem(LS_KEYS.USERS);
  if (!stored) {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_USERS;
  }
};

export const saveStoredUsers = (users: User[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
  }
};

export const getStoredRoles = (): Role[] => {
  if (typeof window === 'undefined') return INITIAL_ROLES;
  const stored = localStorage.getItem(LS_KEYS.ROLES);
  if (!stored) {
    localStorage.setItem(LS_KEYS.ROLES, JSON.stringify(INITIAL_ROLES));
    return INITIAL_ROLES;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LS_KEYS.ROLES, JSON.stringify(INITIAL_ROLES));
      return INITIAL_ROLES;
    }
    return parsed;
  } catch {
    return INITIAL_ROLES;
  }
};

export const saveStoredRoles = (roles: Role[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.ROLES, JSON.stringify(roles));
  }
};

export const getStoredAuditLogs = (): AuditLog[] => {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  const stored = localStorage.getItem(LS_KEYS.AUDIT_LOGS);
  if (!stored) {
    localStorage.setItem(LS_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
};

export const saveStoredAuditLogs = (logs: AuditLog[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }
};

export const getStoredBranches = (): Branch[] => {
  if (typeof window === 'undefined') return INITIAL_BRANCHES;
  const stored = localStorage.getItem(LS_KEYS.BRANCHES);
  if (!stored) {
    localStorage.setItem(LS_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
    return INITIAL_BRANCHES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_BRANCHES;
  }
};

export const saveStoredBranches = (branches: Branch[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.BRANCHES, JSON.stringify(branches));
  }
};
