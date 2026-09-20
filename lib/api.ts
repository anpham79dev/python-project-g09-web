import apiClient from './axios';
import {
  Product,
  Order,
  User,
  Role,
  Permission,
  AuditLog,
  DashboardStats,
  WorkShift,
  ShiftScheduleResponse,
  ShiftSummary,
  Branch,
  Warehouse,
  StockItem,
  ShiftTemplate,
  SystemSettings,
  Transaction,
  CashFlowSummary,
  PnLReport,
} from './types';

// ==========================================
// 1. AUTHENTICATION API
// ==========================================
export const login = async (credentials: { username: string; password?: string }): Promise<{ token: string; user: User }> => {
  const response = await apiClient.post('/auth/login', credentials);
  return {
    token: response.data.token || response.data.access_token,
    user: response.data.user,
  };
};

// ==========================================
// 2. PRODUCTS API
// ==========================================
export const getProducts = async (params?: { search?: string; category?: string; status?: string; branchId?: string; warehouseId?: string }): Promise<Product[]> => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

export const getProductById = async (id: string, params?: { branchId?: string; warehouseId?: string }): Promise<Product> => {
  const response = await apiClient.get(`/products/${id}`, { params });
  return response.data;
};

export const createProduct = async (data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  const response = await apiClient.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

// ==========================================
// 3. ORDERS API
// ==========================================
export const getOrders = async (params?: { search?: string; status?: string; staffId?: string; date?: string; branchId?: string }): Promise<Order[]> => {
  const response = await apiClient.get('/orders', { params });
  return response.data;
};

export const getOrderDetail = async (id: string): Promise<Order> => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const getOrderById = getOrderDetail;

export const createOrder = async (data: Omit<Order, 'id' | 'code' | 'createdAt'>): Promise<Order> => {
  const response = await apiClient.post('/orders', data);
  return response.data;
};

// ==========================================
// 4. USERS API
// ==========================================
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const createUser = async (data: Omit<User, 'id' | 'createdAt'> & { password?: string; role_id?: string }): Promise<User> => {
  const payload = {
    ...data,
    role_id: data.roleId || (data as any).role_id,
  };
  const response = await apiClient.post('/users', payload);
  return response.data;
};

export const updateUserActiveBranch = async (branchId: string): Promise<User> => {
  const response = await apiClient.patch('/users/me/active-branch', { branch_id: branchId });
  if (typeof window !== 'undefined') {
    const curUserStr = localStorage.getItem('user');
    if (curUserStr) {
      try {
        const curUser = JSON.parse(curUserStr);
        curUser.lastActiveBranchId = branchId;
        localStorage.setItem('user', JSON.stringify(curUser));
      } catch {
        // ignore
      }
    }
  }
  return response.data;
};

export const updateUser = async (id: string, data: Partial<User> & { password?: string; role_id?: string }): Promise<User> => {
  const payload = {
    ...data,
    role_id: data.roleId || (data as any).role_id,
  };
  const response = await apiClient.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: string): Promise<User> => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

// ==========================================
// 5. DASHBOARD STATS API
// ==========================================
export const getDashboardStats = async (params?: {
  range?: string;
  startDate?: string;
  endDate?: string;
  branchId?: string;
}): Promise<DashboardStats> => {
  const response = await apiClient.get('/dashboard/stats', {
    params: {
      range: params?.range || 'today',
      start_date: params?.startDate,
      end_date: params?.endDate,
      branch_id: params?.branchId !== 'ALL' ? params?.branchId : undefined,
    },
  });
  return response.data;
};

// ==========================================
// 6. SHIFT & CASH RECONCILIATION API
// ==========================================
export const getCurrentShift = async (): Promise<WorkShift | null> => {
  const response = await apiClient.get('/shifts/current');
  return response.data;
};

export const openShift = async (data: { initialCash: number; branchId?: string; note?: string }): Promise<WorkShift> => {
  const response = await apiClient.post('/shifts/open', data);
  return response.data;
};

export const closeCurrentShift = async (data: { actualCash: number; note?: string }): Promise<WorkShift> => {
  const response = await apiClient.post('/shifts/close', data);
  return response.data;
};

export const getCurrentSchedule = async (): Promise<ShiftScheduleResponse> => {
  const response = await apiClient.get('/shifts/current-schedule');
  return response.data;
};

export const getShifts = async (params?: { status?: string; staffId?: string; date?: string; branchId?: string }): Promise<WorkShift[]> => {
  const response = await apiClient.get('/shifts', { params });
  return response.data;
};

export const getShiftSummary = async (params?: { date?: string; branchId?: string }): Promise<ShiftSummary> => {
  const response = await apiClient.get('/shifts/summary', { params });
  return response.data;
};

// ==========================================
// 7. BRANCHES & WAREHOUSES API
// ==========================================
export const getBranches = async (params?: { status?: string }): Promise<Branch[]> => {
  const response = await apiClient.get('/branches', { params });
  return response.data;
};

export const createBranch = async (data: Omit<Branch, 'id' | 'createdAt' | 'warehouses'>): Promise<Branch> => {
  const response = await apiClient.post('/branches', data);
  return response.data;
};

export const updateBranch = async (id: string, data: Partial<Branch>): Promise<Branch> => {
  const response = await apiClient.put(`/branches/${id}`, data);
  return response.data;
};

export const getWarehouseStocks = async (params?: { warehouseId?: string; branchId?: string; productId?: string }): Promise<StockItem[]> => {
  const response = await apiClient.get('/branches/stocks', { params });
  return response.data;
};

export const updateWarehouseStock = async (data: { warehouseId: string; productId: string; quantity: number; minAlertStock?: number }): Promise<StockItem> => {
  const response = await apiClient.put('/branches/stocks', data);
  return response.data;
};

// ==========================================
// 8. SYSTEM SETTINGS & SHIFT TEMPLATES API
// ==========================================
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await apiClient.get('/settings');
  return response.data;
};

export const updateSystemSettings = async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await apiClient.put('/settings', data);
  return response.data;
};

export const getShiftTemplates = async (): Promise<ShiftTemplate[]> => {
  const response = await apiClient.get('/settings/shift-templates');
  return response.data;
};

export const createShiftTemplate = async (data: Omit<ShiftTemplate, 'id' | 'createdAt'>): Promise<ShiftTemplate> => {
  const response = await apiClient.post('/settings/shift-templates', data);
  return response.data;
};

export const updateShiftTemplate = async (id: string, data: Partial<ShiftTemplate>): Promise<ShiftTemplate> => {
  const response = await apiClient.put(`/settings/shift-templates/${id}`, data);
  return response.data;
};

export const deleteShiftTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`/settings/shift-templates/${id}`);
};

// ==========================================
// 9. BASIC ACCOUNTING & CASH FLOW API
// ==========================================
export const getTransactions = async (params?: { type?: string; category?: string; branchId?: string }): Promise<Transaction[]> => {
  const response = await apiClient.get('/accounting/transactions', { params });
  return response.data;
};

export const createTransaction = async (data: Omit<Transaction, 'id' | 'code' | 'createdAt'>): Promise<Transaction> => {
  const response = await apiClient.post('/accounting/transactions', data);
  return response.data;
};

export const getCashFlowSummary = async (params?: { branchId?: string }): Promise<CashFlowSummary> => {
  const response = await apiClient.get('/accounting/summary', { params });
  return response.data;
};

export const getPnLReport = async (params?: { branchId?: string }): Promise<PnLReport> => {
  const response = await apiClient.get('/accounting/pnl', { params });
  return response.data;
};

// ==========================================
// 10. ROLES & PERMISSIONS API (PBAC)
// ==========================================
export const getPermissions = async (): Promise<Permission[]> => {
  const response = await apiClient.get('/permissions');
  return response.data;
};

export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('/roles');
  return response.data;
};

export const getRoleById = async (roleId: string): Promise<Role> => {
  const response = await apiClient.get(`/roles/${roleId}`);
  return response.data;
};

export const createRole = async (data: { code: string; name: string; description?: string; permission_ids: string[] }): Promise<Role> => {
  const response = await apiClient.post('/roles', data);
  return response.data;
};

export const updateRole = async (roleId: string, data: { name?: string; description?: string; permission_ids?: string[] }): Promise<Role> => {
  const response = await apiClient.put(`/roles/${roleId}`, data);
  return response.data;
};

export const deleteRole = async (roleId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/roles/${roleId}`);
  return response.data;
};

export const getAuditLogs = async (targetType?: string): Promise<AuditLog[]> => {
  const response = await apiClient.get('/audit-logs', { params: { targetType } });
  return response.data;
};
