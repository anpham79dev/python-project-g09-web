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
} from "../mock-data";

// Kiểm tra biến môi trường chuyển đổi mock <-> API thật
export const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCK !== "false";
};

// Giả lập độ trễ mạng khi dùng mock data (~300ms)
export const simulateDelay = <T>(data: T, delay = 300): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

// Key LocalStorage cho Stateful Mocking
export const LS_KEYS = {
  PRODUCTS: "artisan_mock_products",
  ORDERS: "artisan_mock_orders",
  USERS: "artisan_mock_users",
  ROLES: "artisan_mock_roles",
  PERMISSIONS: "artisan_mock_permissions",
  AUDIT_LOGS: "artisan_mock_audit_logs",
  SHIFTS: "artisan_mock_shifts",
  BRANCHES: "artisan_mock_branches",
  TEMPLATES: "artisan_mock_shift_templates",
  SETTINGS: "artisan_mock_system_settings",
  STOCKS: "artisan_mock_warehouse_stocks",
  TRANSACTIONS: "artisan_mock_transactions",
};

export const getStoredList = <T>(
  key: string,
  initial: T[],
  rejectEmptyArray = false,
): T[] => {
  if (typeof window === "undefined") return initial;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || (rejectEmptyArray && parsed.length === 0)) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return parsed;
  } catch {
    return initial;
  }
};

export const saveStoredList = <T>(key: string, data: T[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Helpers lấy/lưu mock data trong browser session
export const getStoredProducts = (): Product[] =>
  getStoredList(LS_KEYS.PRODUCTS, INITIAL_PRODUCTS);
export const saveStoredProducts = (products: Product[]) =>
  saveStoredList(LS_KEYS.PRODUCTS, products);

export const getStoredOrders = (): Order[] =>
  getStoredList(LS_KEYS.ORDERS, INITIAL_ORDERS);
export const saveStoredOrders = (orders: Order[]) =>
  saveStoredList(LS_KEYS.ORDERS, orders);

export const getStoredUsers = (): User[] =>
  getStoredList(LS_KEYS.USERS, INITIAL_USERS);
export const saveStoredUsers = (users: User[]) =>
  saveStoredList(LS_KEYS.USERS, users);

export const getStoredRoles = (): Role[] =>
  getStoredList(LS_KEYS.ROLES, INITIAL_ROLES, true);
export const saveStoredRoles = (roles: Role[]) =>
  saveStoredList(LS_KEYS.ROLES, roles);

export const getStoredAuditLogs = (): AuditLog[] =>
  getStoredList(LS_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
export const saveStoredAuditLogs = (logs: AuditLog[]) =>
  saveStoredList(LS_KEYS.AUDIT_LOGS, logs);

export const getStoredBranches = (): Branch[] =>
  getStoredList(LS_KEYS.BRANCHES, INITIAL_BRANCHES);
export const saveStoredBranches = (branches: Branch[]) =>
  saveStoredList(LS_KEYS.BRANCHES, branches);

export const getStoredStockOverrides = (): Record<string, number> => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.STOCKS) || "{}");
  } catch {
    return {};
  }
};
export const saveStoredStockOverrides = (
  overrides: Record<string, number>,
): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEYS.STOCKS, JSON.stringify(overrides));
  }
};
