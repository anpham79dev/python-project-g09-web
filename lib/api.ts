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
  ShiftSummary,
  Branch,
  Warehouse,
  StockItem,
  ShiftTemplate,
  SystemSettings,
  Transaction,
  CashFlowSummary,
  PnLReport,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_ROLES,
  INITIAL_PERMISSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SHIFTS,
  INITIAL_BRANCHES,
  INITIAL_SHIFT_TEMPLATES,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_TRANSACTIONS,
} from './mock-data';
import { ALL_PERMISSION_CODES } from './rbac-config';

// Kiểm tra biến môi trường chuyển đổi mock <-> API thật
const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
};

// Giả lập độ trễ mạng khi dùng mock data (~300ms)
const simulateDelay = <T>(data: T, delay = 300): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

// Key LocalStorage cho Stateful Mocking
const LS_KEYS = {
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
const getStoredShifts = (): WorkShift[] => {
  if (typeof window === 'undefined') return INITIAL_SHIFTS;
  const stored = localStorage.getItem(LS_KEYS.SHIFTS);
  if (!stored) {
    localStorage.setItem(LS_KEYS.SHIFTS, JSON.stringify(INITIAL_SHIFTS));
    return INITIAL_SHIFTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_SHIFTS;
  }
};

const saveStoredShifts = (shifts: WorkShift[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.SHIFTS, JSON.stringify(shifts));
  }
};

// Helpers lấy/lưu mock data trong browser session
const getStoredProducts = (): Product[] => {
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

const saveStoredProducts = (products: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(products));
  }
};

const getStoredOrders = (): Order[] => {
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

const saveStoredOrders = (orders: Order[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(orders));
  }
};

const getStoredUsers = (): User[] => {
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

const saveStoredUsers = (users: User[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
  }
};

const getStoredRoles = (): Role[] => {
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

const saveStoredRoles = (roles: Role[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.ROLES, JSON.stringify(roles));
  }
};

const getStoredPermissions = (): Permission[] => {
  if (typeof window === 'undefined') return INITIAL_PERMISSIONS;
  const stored = localStorage.getItem(LS_KEYS.PERMISSIONS);
  if (!stored) {
    localStorage.setItem(LS_KEYS.PERMISSIONS, JSON.stringify(INITIAL_PERMISSIONS));
    return INITIAL_PERMISSIONS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LS_KEYS.PERMISSIONS, JSON.stringify(INITIAL_PERMISSIONS));
      return INITIAL_PERMISSIONS;
    }
    return parsed;
  } catch {
    return INITIAL_PERMISSIONS;
  }
};

const getStoredAuditLogs = (): AuditLog[] => {
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

const saveStoredAuditLogs = (logs: AuditLog[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }
};

// ==========================================
// 1. AUTHENTICATION API
// ==========================================
export const login = async (credentials: { username: string; password?: string }): Promise<{ token: string; user: User }> => {
  if (isMockMode()) {
    const users = getStoredUsers();
    const roles = getStoredRoles();
    const cleanUser = credentials.username.toLowerCase().trim();
    let found = users.find((u) => u.username.toLowerCase() === cleanUser);
    
    if (!found) {
      const isSuper = cleanUser === 'superadmin';
      const isAdmin = cleanUser === 'admin' || cleanUser.includes('admin');
      const rCode = isSuper ? 'SUPER_ADMIN' : (isAdmin ? 'ADMIN' : 'STAFF');
      const matchedRole = roles.find((r) => r.code === rCode) || roles[0];

      found = {
        id: isSuper ? 'user-000' : (isAdmin ? 'user-001' : 'user-002'),
        username: cleanUser,
        fullName: isSuper ? 'Tổng Quản Trị Hệ Thống' : (isAdmin ? 'Quản Trị Viên' : 'Thu Ngân Bán Hàng'),
        email: `${cleanUser}@artisanbakery.vn`,
        phone: '0901234567',
        role: rCode,
        roleId: matchedRole.id,
        roleName: matchedRole.name,
        permissions: matchedRole.permissions.map((p) => p.code),
        permissionsVersion: matchedRole.permissions_version || 1,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      } as User;
    } else {
      // Refresh permissions from role definition
      const userRole = roles.find((r) => r.id === found!.roleId || r.code === found!.role);
      if (userRole) {
        found.roleId = userRole.id;
        found.roleName = userRole.name;
        found.role = userRole.code;
        found.permissions = userRole.permissions.map((p) => p.code);
        found.permissionsVersion = userRole.permissions_version || 1;
      }
    }

    return simulateDelay({
      token: `mock_jwt_token_${found.role.toLowerCase()}_${Date.now()}`,
      user: found,
    });
  }

  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

// ==========================================
// 2. PRODUCTS API
// ==========================================
export const getProducts = async (params?: { search?: string; category?: string; status?: string }): Promise<Product[]> => {
  if (isMockMode()) {
    let list = getStoredProducts();
    if (params?.category && params.category !== 'Tất cả') {
      list = list.filter((p) => p.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (params?.status) {
      list = list.filter((p) => p.status === params.status);
    }
    return simulateDelay(list);
  }

  const response = await apiClient.get('/products', { params });
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  if (isMockMode()) {
    const list = getStoredProducts();
    const product = list.find((p) => p.id === id);
    if (!product) throw new Error('Không tìm thấy sản phẩm');
    return simulateDelay(product);
  }

  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  if (isMockMode()) {
    const list = getStoredProducts();
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    saveStoredProducts([newProduct, ...list]);
    return simulateDelay(newProduct);
  }

  const response = await apiClient.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  if (isMockMode()) {
    const list = getStoredProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy sản phẩm để cập nhật');
    
    const updated: Product = { ...list[index], ...data };
    list[index] = updated;
    saveStoredProducts([...list]);
    return simulateDelay(updated);
  }

  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<{ success: boolean }> => {
  if (isMockMode()) {
    const list = getStoredProducts();
    const filtered = list.filter((p) => p.id !== id);
    saveStoredProducts(filtered);
    return simulateDelay({ success: true });
  }

  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

// ==========================================
// 3. ORDERS API
// ==========================================
export const getOrders = async (params?: { search?: string; status?: string; staffId?: string; date?: string }): Promise<Order[]> => {
  if (isMockMode()) {
    let list = getStoredOrders();
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((o) => o.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          o.staffName.toLowerCase().includes(q)
      );
    }
    if (params?.staffId) {
      list = list.filter((o) => o.staffId === params.staffId);
    }
    return simulateDelay(list);
  }

  const response = await apiClient.get('/orders', { params });
  return response.data;
};

export const getOrderDetail = async (id: string): Promise<Order> => {
  if (isMockMode()) {
    const list = getStoredOrders();
    const order = list.find((o) => o.id === id || o.code === id);
    if (!order) throw new Error('Không tìm thấy đơn hàng');
    return simulateDelay(order);
  }

  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (data: Omit<Order, 'id' | 'code' | 'createdAt'>): Promise<Order> => {
  if (isMockMode()) {
    const list = getStoredOrders();
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const count = list.length + 1;
    const code = `HD-${dateStr}-${count < 10 ? '0' + count : count}`;

    const newOrder: Order = {
      ...data,
      id: `ord-${Date.now().toString().slice(-4)}`,
      code,
      createdAt: now.toISOString(),
    };

    // Giảm tồn kho các sản phẩm liên quan
    const products = getStoredProducts();
    data.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
        if (p.stock === 0) p.status = 'out_of_stock';
        else if (p.stock <= 5) p.status = 'low_stock';
      }
    });
    saveStoredProducts([...products]);
    saveStoredOrders([newOrder, ...list]);

    return simulateDelay(newOrder);
  }

  const response = await apiClient.post('/orders', data);
  return response.data;
};

// ==========================================
// 4. USERS API
// ==========================================
export const getUsers = async (): Promise<User[]> => {
  if (isMockMode()) {
    const list = getStoredUsers();
    return simulateDelay(list);
  }

  const response = await apiClient.get('/users');
  return response.data;
};

export const createUser = async (data: Omit<User, 'id' | 'createdAt'> & { password?: string; role_id?: string }): Promise<User> => {
  if (isMockMode()) {
    const list = getStoredUsers();
    const branches = getStoredBranches();
    const roles = getStoredRoles();
    const br = branches.find((b) => b.id === data.defaultBranchId);
    
    // Resolve role details
    let roleObj = roles.find((r) => r.id === (data.roleId || (data as any).role_id) || r.code === data.role);
    if (!roleObj) {
      roleObj = roles.find((r) => r.code === 'STAFF') || roles[0];
    }

    const newUser: User = {
      id: `user-${Date.now().toString().slice(-4)}`,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: roleObj.code,
      roleId: roleObj.id,
      roleName: roleObj.name,
      permissions: roleObj.permissions.map((p) => p.code),
      permissionsVersion: roleObj.permissions_version || 1,
      status: data.status || 'ACTIVE',
      defaultBranchId: data.defaultBranchId || null,
      defaultBranchName: br ? br.name : (data.defaultBranchName || null),
      createdAt: new Date().toISOString(),
    };
    saveStoredUsers([...list, newUser]);
    return simulateDelay(newUser);
  }

  const payload = {
    ...data,
    role_id: data.roleId || (data as any).role_id,
  };
  const response = await apiClient.post('/users', payload);
  return response.data;
};

export const updateUserActiveBranch = async (branchId: string): Promise<User> => {
  if (isMockMode()) {
    const users = getStoredUsers();
    const curUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (curUserStr) {
      try {
        const curUser = JSON.parse(curUserStr);
        curUser.lastActiveBranchId = branchId;
        localStorage.setItem('user', JSON.stringify(curUser));
        const idx = users.findIndex((u) => u.id === curUser.id);
        if (idx >= 0) {
          users[idx].lastActiveBranchId = branchId;
          saveStoredUsers(users);
        }
        return simulateDelay(curUser);
      } catch {
        // ignore
      }
    }
    return simulateDelay({} as User);
  }

  const response = await apiClient.patch('/users/me/active-branch', { branchId });
  if (typeof window !== 'undefined') {
    const curUserStr = localStorage.getItem('user');
    if (curUserStr) {
      const curUser = JSON.parse(curUserStr);
      curUser.lastActiveBranchId = branchId;
      localStorage.setItem('user', JSON.stringify(curUser));
    }
  }
  return response.data;
};

export const updateUser = async (id: string, data: Partial<User> & { password?: string; role_id?: string }): Promise<User> => {
  if (isMockMode()) {
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      const branches = getStoredBranches();
      const roles = getStoredRoles();
      const br = branches.find((b) => b.id === data.defaultBranchId);
      const oldUser = users[idx];

      let updatedRole = oldUser.role;
      let updatedRoleId = oldUser.roleId;
      let updatedRoleName = oldUser.roleName;
      let updatedPermissions = oldUser.permissions;
      let updatedPermissionsVersion = oldUser.permissionsVersion;

      const requestedRoleId = data.roleId || (data as any).role_id;
      if (requestedRoleId || (data.role && data.role !== oldUser.role)) {
        const matchedRole = roles.find((r) => r.id === requestedRoleId || r.code === data.role);
        if (matchedRole) {
          updatedRole = matchedRole.code;
          updatedRoleId = matchedRole.id;
          updatedRoleName = matchedRole.name;
          updatedPermissions = matchedRole.permissions.map((p) => p.code);
          updatedPermissionsVersion = matchedRole.permissions_version || 1;

          // Record audit log for user role change
          const auditLogs = getStoredAuditLogs();
          const newAudit: AuditLog = {
            id: `audit-${Date.now().toString().slice(-6)}`,
            user_id: 'user-000',
            user_name: 'Tổng Quản Trị Hệ Thống',
            action: 'USER_ROLE_CHANGE',
            target_type: 'USER',
            target_id: oldUser.id,
            target_name: oldUser.fullName || oldUser.username,
            changes_summary: `Đổi vai trò người dùng '${oldUser.username}' từ '${oldUser.roleName || oldUser.role}' sang '${matchedRole.name}'`,
            details_json: JSON.stringify({ old_role: oldUser.role, new_role: matchedRole.code }),
            ip_address: '127.0.0.1',
            created_at: new Date().toISOString(),
          };
          saveStoredAuditLogs([newAudit, ...auditLogs]);
        }
      }

      users[idx] = {
        ...users[idx],
        ...data,
        role: updatedRole,
        roleId: updatedRoleId,
        roleName: updatedRoleName,
        permissions: updatedPermissions,
        permissionsVersion: updatedPermissionsVersion,
        defaultBranchName: br ? br.name : (data.defaultBranchName !== undefined ? data.defaultBranchName : users[idx].defaultBranchName),
      };
      saveStoredUsers(users);
      return simulateDelay(users[idx]);
    }
    throw new Error('User not found');
  }

  const payload = {
    ...data,
    role_id: data.roleId || (data as any).role_id,
  };
  const response = await apiClient.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: string): Promise<User> => {
  if (isMockMode()) {
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      users[idx].status = 'INACTIVE';
      saveStoredUsers(users);
      return simulateDelay(users[idx]);
    }
    throw new Error('User not found');
  }
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
  if (isMockMode()) {
    const orders = getStoredOrders();
    const products = getStoredProducts();
    const users = getStoredUsers();

    const range = params?.range || 'today';
    const periodLabel = range === '7days' ? '7 ngày qua' : range === '30days' ? '30 ngày qua' : range === 'custom' ? 'Tùy chọn' : 'Hôm nay';
    const previousPeriodLabel = range === '7days' ? 'so với 7 ngày trước' : range === '30days' ? 'so với 30 ngày trước' : 'so với hôm qua';

    const branchId = params?.branchId || 'ALL';

    // Lọc đơn hàng theo chi nhánh nếu có chọn cụ thể
    const branchOrders = branchId !== 'ALL'
      ? orders.filter((o) => o.branchId === branchId)
      : orders;

    const completedOrders = branchOrders.filter((o) => o.status === 'COMPLETED');
    
    // Seed số liệu phân hóa theo chi nhánh để kiểm chứng trực quan
    let branchBaseRevenue = 2780000;
    let branchBaseOrders = 13;
    let branchTopProduct = 'Croissant Bơ Pháp Truyền Thống';

    if (branchId === 'branch-001') {
      branchBaseRevenue = 1450000;
      branchBaseOrders = 7;
      branchTopProduct = 'Croissant Bơ Pháp Truyền Thống';
    } else if (branchId === 'branch-002') {
      branchBaseRevenue = 920000;
      branchBaseOrders = 4;
      branchTopProduct = 'Sourdough Men Tự Nhiên (500g)';
    } else if (branchId === 'branch-003') {
      branchBaseRevenue = 410000;
      branchBaseOrders = 2;
      branchTopProduct = 'Bánh Mì Phô Mai Bơ Tỏi Hàn Quốc';
    }

    const calculatedRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayRevenue = completedOrders.length > 0 ? calculatedRevenue : branchBaseRevenue;
    const yesterdayRevenue = Math.round(todayRevenue * 0.72);
    const revenueGrowth = 38.9;

    const todayOrdersCount = completedOrders.length > 0 ? completedOrders.length : branchBaseOrders;
    const yesterdayOrdersCount = Math.max(1, Math.round(todayOrdersCount * 0.7));
    const ordersGrowth = 42.8;
    const averageOrderValue = todayOrdersCount > 0 ? Math.round(todayRevenue / todayOrdersCount) : 198777;

    const lowStockDetails = products
      .filter((p) => p.stock <= 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        stock: p.stock,
        threshold: 5,
        status: (p.stock === 0 ? 'Hết hàng' : 'Sắp hết') as 'Hết hàng' | 'Sắp hết',
        image: p.image,
      }));
    const lowStockCount = lowStockDetails.length;

    const recentSalesChart = [
      { time: '07:00 - 09:00', revenue: Math.round(todayRevenue * 0.15), orders: Math.max(1, Math.round(todayOrdersCount * 0.15)) },
      { time: '09:00 - 11:00', revenue: Math.round(todayRevenue * 0.1), orders: Math.max(0, Math.round(todayOrdersCount * 0.1)) },
      { time: '11:00 - 13:00', revenue: Math.round(todayRevenue * 0.25), orders: Math.max(1, Math.round(todayOrdersCount * 0.25)) },
      { time: '13:00 - 15:00', revenue: Math.round(todayRevenue * 0.05), orders: Math.max(0, Math.round(todayOrdersCount * 0.05)) },
      { time: '15:00 - 17:00', revenue: Math.round(todayRevenue * 0.2), orders: Math.max(1, Math.round(todayOrdersCount * 0.2)) },
      { time: '17:00 - 19:00', revenue: Math.round(todayRevenue * 0.15), orders: Math.max(1, Math.round(todayOrdersCount * 0.15)) },
      { time: '19:00 - 21:00', revenue: Math.round(todayRevenue * 0.1), orders: Math.max(0, Math.round(todayOrdersCount * 0.1)) },
    ];

    const topSellingProducts = [
      { id: 'prod-001', name: branchTopProduct, category: 'Bánh Mì Ngọt & Pastry', soldCount: Math.round(todayOrdersCount * 1.5), revenue: Math.round(todayRevenue * 0.35), image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
      { id: 'prod-003', name: 'Pain au Chocolat (Bánh Sô-cô-la)', category: 'Bánh Mì Ngọt & Pastry', soldCount: Math.max(1, Math.round(todayOrdersCount * 0.8)), revenue: Math.round(todayRevenue * 0.2), image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80' },
      { id: 'prod-004', name: 'Baguette Pháp Truyền Thống', category: 'Bánh Mì Nghệ Nhân (Artisan)', soldCount: Math.max(1, Math.round(todayOrdersCount * 0.6)), revenue: Math.round(todayRevenue * 0.15), image: 'https://images.unsplash.com/photo-1597079910443-60c43fc4f749?w=400&q=80' },
      { id: 'prod-008', name: 'Cà Phê Muối Kem Béo Artisan', category: 'Cà Phê & Đồ Uống', soldCount: Math.max(1, Math.round(todayOrdersCount * 0.4)), revenue: Math.round(todayRevenue * 0.1), image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80' },
      { id: 'prod-010', name: 'Bánh Mì Phô Mai Bơ Tỏi Hàn Quốc', category: 'Bánh Mì Ngọt & Pastry', soldCount: Math.max(1, Math.round(todayOrdersCount * 0.2)), revenue: Math.round(todayRevenue * 0.08), image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80' },
    ];

    const slowSellingProducts = [
      { id: 'prod-011', name: 'Cheesecake Cháy San Sebastian', category: 'Bánh Kem & Sinh Nhật', soldCount: 0, revenue: 0, stock: 6, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80' },
      { id: 'prod-009', name: 'Trà Sữa Oolong Nướng Trân Châu', category: 'Cà Phê & Đồ Uống', soldCount: 1, revenue: 38000, stock: 79, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
      { id: 'prod-007', name: 'Cinnamon Roll Phủ Kem Phô Mai', category: 'Bánh Mì Ngọt & Pastry', soldCount: 1, revenue: 42000, stock: 22, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
      { id: 'prod-006', name: 'Tiramisu Cacao Mascarpone Ý', category: 'Bánh Kem & Sinh Nhật', soldCount: 1, revenue: 55000, stock: 18, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80' },
      { id: 'prod-002', name: 'Sourdough Men Tự Nhiên (500g)', category: 'Bánh Mì Nghệ Nhân (Artisan)', soldCount: 1, revenue: 65000, stock: 14, image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&q=80' },
    ];

    const paymentMethods = [
      { method: 'QR_TRANSFER', methodLabel: 'Chuyển khoản QR', count: Math.round(todayOrdersCount * 0.65), revenue: Math.round(todayRevenue * 0.7), percentage: 70.0 },
      { method: 'CASH', methodLabel: 'Tiền mặt', count: Math.max(1, Math.round(todayOrdersCount * 0.2)), revenue: Math.round(todayRevenue * 0.18), percentage: 18.0 },
      { method: 'CARD', methodLabel: 'Quẹt thẻ POS', count: Math.max(0, Math.round(todayOrdersCount * 0.15)), revenue: Math.round(todayRevenue * 0.12), percentage: 12.0 },
    ];

    const categorySales = [
      { category: 'Bánh Mì Ngọt & Pastry', revenue: Math.round(todayRevenue * 0.55), soldCount: Math.round(todayOrdersCount * 1.8), percentage: 55.0 },
      { category: 'Bánh Kem & Sinh Nhật', revenue: Math.round(todayRevenue * 0.2), soldCount: Math.max(1, Math.round(todayOrdersCount * 0.3)), percentage: 20.0 },
      { category: 'Bánh Mì Nghệ Nhân (Artisan)', revenue: Math.round(todayRevenue * 0.15), soldCount: Math.max(1, Math.round(todayOrdersCount * 0.4)), percentage: 15.0 },
      { category: 'Cà Phê & Đồ Uống', revenue: Math.round(todayRevenue * 0.1), soldCount: Math.max(1, Math.round(todayOrdersCount * 0.5)), percentage: 10.0 },
    ];

    const staffPerformances = users.map((u, i) => ({
      staffId: u.id,
      staffName: u.fullName,
      ordersCount: i === 0 ? Math.round(todayOrdersCount * 0.6) : i === 1 ? Math.round(todayOrdersCount * 0.3) : Math.round(todayOrdersCount * 0.1),
      revenue: i === 0 ? Math.round(todayRevenue * 0.6) : i === 1 ? Math.round(todayRevenue * 0.3) : Math.round(todayRevenue * 0.1),
      averageOrderValue: averageOrderValue,
    })).sort((a, b) => b.revenue - a.revenue);

    return simulateDelay({
      periodLabel,
      previousPeriodLabel,
      todayRevenue,
      yesterdayRevenue,
      revenueGrowth,
      todayOrdersCount,
      yesterdayOrdersCount,
      ordersGrowth,
      averageOrderValue,
      totalProductsCount: products.length,
      lowStockCount,
      recentSalesChart,
      topSellingProducts,
      slowSellingProducts,
      paymentMethods,
      categorySales,
      staffPerformances,
      lowStockDetails,
    });
  }

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
export const getCurrentShift = async (): Promise<WorkShift> => {
  if (isMockMode()) {
    const shifts = getStoredShifts();
    const openShift = shifts.find((s) => s.status === 'OPEN') || {
      id: `shift-${Date.now().toString().slice(-4)}`,
      shiftName: 'Ca sáng (07:00 - 15:00) - 16/08/2026',
      staffId: 'user-002',
      staffName: 'Trần Thị Thu Ngân',
      startTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      endTime: null,
      initialCash: 500000,
      cashRevenue: 150000,
      cardRevenue: 380000,
      qrRevenue: 479000,
      totalRevenue: 1009000,
      ordersCount: 6,
      expectedCash: 650000,
      actualCash: 0,
      difference: -650000,
      status: 'OPEN',
      note: null,
      createdAt: new Date().toISOString(),
    };
    return simulateDelay(openShift);
  }

  const response = await apiClient.get('/shifts/current');
  return response.data;
};

export const closeCurrentShift = async (data: { actualCash: number; note?: string }): Promise<WorkShift> => {
  if (isMockMode()) {
    const shifts = getStoredShifts();
    const openIndex = shifts.findIndex((s) => s.status === 'OPEN');
    if (openIndex >= 0) {
      const shift = shifts[openIndex];
      shift.actualCash = data.actualCash;
      shift.difference = data.actualCash - shift.expectedCash;
      shift.note = data.note || null;
      shift.endTime = new Date().toISOString();
      shift.status = 'CLOSED';
      saveStoredShifts([...shifts]);
      return simulateDelay(shift);
    }
    const closed: WorkShift = {
      id: `shift-${Date.now().toString().slice(-4)}`,
      shiftName: 'Ca vừa đóng',
      staffId: 'user-current',
      staffName: 'Nhân Viên',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date().toISOString(),
      initialCash: 500000,
      cashRevenue: 150000,
      cardRevenue: 0,
      qrRevenue: 0,
      totalRevenue: 150000,
      ordersCount: 1,
      expectedCash: 650000,
      actualCash: data.actualCash,
      difference: data.actualCash - 650000,
      status: 'CLOSED',
      note: data.note || null,
      createdAt: new Date().toISOString(),
    };
    return simulateDelay(closed);
  }

  const response = await apiClient.post('/shifts/close', data);
  return response.data;
};

export const getShifts = async (params?: { status?: string; staffId?: string; date?: string; branchId?: string }): Promise<WorkShift[]> => {
  if (isMockMode()) {
    let list = getStoredShifts();
    if (params?.status) list = list.filter((s) => s.status === params.status);
    if (params?.staffId) list = list.filter((s) => s.staffId === params.staffId);
    if (params?.branchId && params.branchId !== 'ALL') {
      const match = list.filter((s) => !(s as any).branchId || (s as any).branchId === params.branchId);
      if (match.length > 0) list = match;
    }
    return simulateDelay(list);
  }

  const response = await apiClient.get('/shifts', { params });
  return response.data;
};

export const getShiftSummary = async (params?: { date?: string; branchId?: string }): Promise<ShiftSummary> => {
  if (isMockMode()) {
    let list = getStoredShifts();
    if (params?.branchId && params.branchId !== 'ALL') {
      const match = list.filter((s) => !(s as any).branchId || (s as any).branchId === params.branchId);
      if (match.length > 0) list = match;
    }
    const totalShiftsCount = list.length;
    const closedShiftsCount = list.filter((s) => s.status === 'CLOSED').length;
    const openShiftsCount = list.filter((s) => s.status === 'OPEN').length;
    const totalRevenue = list.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalCash = list.reduce((sum, s) => sum + s.cashRevenue, 0);
    const totalCard = list.reduce((sum, s) => sum + s.cardRevenue, 0);
    const totalQr = list.reduce((sum, s) => sum + s.qrRevenue, 0);
    const totalDifference = list.filter((s) => s.status === 'CLOSED').reduce((sum, s) => sum + s.difference, 0);

    return simulateDelay({
      totalShiftsCount,
      closedShiftsCount,
      openShiftsCount,
      totalRevenue,
      totalCash,
      totalCard,
      totalQr,
      totalDifference,
      shifts: list,
    });
  }

  const response = await apiClient.get('/shifts/summary', { params });
  return response.data;
};

// ==========================================
// 7. BRANCHES & WAREHOUSES API
// ==========================================
const getStoredBranches = (): Branch[] => {
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

const saveStoredBranches = (branches: Branch[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.BRANCHES, JSON.stringify(branches));
  }
};

export const getBranches = async (params?: { status?: string }): Promise<Branch[]> => {
  if (isMockMode()) {
    let list = getStoredBranches();
    if (params?.status) list = list.filter((b) => b.status === params.status);
    return simulateDelay(list);
  }
  const response = await apiClient.get('/branches', { params });
  return response.data;
};

export const createBranch = async (data: Omit<Branch, 'id' | 'createdAt' | 'warehouses'>): Promise<Branch> => {
  if (isMockMode()) {
    const branches = getStoredBranches();
    const newBranch: Branch = {
      ...data,
      id: `branch-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      warehouses: [
        {
          id: `wh-${Date.now().toString().slice(-4)}`,
          branchId: `branch-${Date.now().toString().slice(-4)}`,
          code: `KHO-${data.code}-POS`,
          name: `Kho Quầy Bán Lẻ - ${data.name}`,
          warehouseType: 'RETAIL',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        }
      ]
    };
    branches.push(newBranch);
    saveStoredBranches(branches);
    return simulateDelay(newBranch);
  }
  const response = await apiClient.post('/branches', data);
  return response.data;
};

export const updateBranch = async (id: string, data: Partial<Branch>): Promise<Branch> => {
  if (isMockMode()) {
    const branches = getStoredBranches();
    const idx = branches.findIndex((b) => b.id === id);
    if (idx >= 0) {
      branches[idx] = { ...branches[idx], ...data };
      saveStoredBranches(branches);
      return simulateDelay(branches[idx]);
    }
  }
  const response = await apiClient.put(`/branches/${id}`, data);
  return response.data;
};

export const getWarehouseStocks = async (params?: { warehouseId?: string; branchId?: string }): Promise<StockItem[]> => {
  if (isMockMode()) {
    const products = getStoredProducts();
    const branches = getStoredBranches();
    const stocks: StockItem[] = [];

    branches.forEach((b) => {
      b.warehouses.forEach((w) => {
        if (params?.warehouseId && w.id !== params.warehouseId) return;
        if (params?.branchId && b.id !== params.branchId) return;

        products.forEach((p) => {
          stocks.push({
            id: `stk-${w.id}-${p.id}`,
            warehouseId: w.id,
            warehouseName: w.name,
            branchId: b.id,
            branchName: b.name,
            productId: p.id,
            productName: p.name,
            productImage: p.image,
            productCategory: p.category,
            quantity: p.stock,
            minAlertStock: 5,
            status: p.stock > 5 ? 'in_stock' : p.stock > 0 ? 'low_stock' : 'out_of_stock',
            updatedAt: new Date().toISOString(),
          });
        });
      });
    });

    return simulateDelay(stocks);
  }
  const response = await apiClient.get('/branches/stocks', { params });
  return response.data;
};

export const updateWarehouseStock = async (data: { warehouseId: string; productId: string; quantity: number; minAlertStock?: number }): Promise<StockItem> => {
  if (isMockMode()) {
    const products = getStoredProducts();
    const prod = products.find((p) => p.id === data.productId);
    if (prod) {
      prod.stock = data.quantity;
      saveStoredProducts([...products]);
    }
    return simulateDelay({
      id: `stk-${data.warehouseId}-${data.productId}`,
      warehouseId: data.warehouseId,
      productId: data.productId,
      quantity: data.quantity,
      minAlertStock: data.minAlertStock || 5,
      status: data.quantity > 5 ? 'in_stock' : data.quantity > 0 ? 'low_stock' : 'out_of_stock',
      updatedAt: new Date().toISOString(),
    });
  }
  const response = await apiClient.put('/branches/stocks', data);
  return response.data;
};

// ==========================================
// 8. SYSTEM SETTINGS & SHIFT TEMPLATES API
// ==========================================
export const getSystemSettings = async (): Promise<SystemSettings> => {
  if (isMockMode()) {
    const stored = localStorage.getItem(LS_KEYS.SETTINGS);
    if (!stored) {
      localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(INITIAL_SYSTEM_SETTINGS));
      return simulateDelay(INITIAL_SYSTEM_SETTINGS);
    }
    try {
      return simulateDelay(JSON.parse(stored));
    } catch {
      return simulateDelay(INITIAL_SYSTEM_SETTINGS);
    }
  }
  const response = await apiClient.get('/settings');
  return response.data;
};

export const updateSystemSettings = async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
  if (isMockMode()) {
    const current = await getSystemSettings();
    const updated = { ...current, ...data };
    localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(updated));
    return simulateDelay(updated);
  }
  const response = await apiClient.put('/settings', data);
  return response.data;
};

export const getShiftTemplates = async (): Promise<ShiftTemplate[]> => {
  if (isMockMode()) {
    const stored = localStorage.getItem(LS_KEYS.TEMPLATES);
    if (!stored) {
      localStorage.setItem(LS_KEYS.TEMPLATES, JSON.stringify(INITIAL_SHIFT_TEMPLATES));
      return simulateDelay(INITIAL_SHIFT_TEMPLATES);
    }
    try {
      return simulateDelay(JSON.parse(stored));
    } catch {
      return simulateDelay(INITIAL_SHIFT_TEMPLATES);
    }
  }
  const response = await apiClient.get('/settings/shift-templates');
  return response.data;
};

export const createShiftTemplate = async (data: Omit<ShiftTemplate, 'id' | 'createdAt'>): Promise<ShiftTemplate> => {
  if (isMockMode()) {
    const templates = await getShiftTemplates();
    const newTmpl: ShiftTemplate = {
      ...data,
      id: `tmpl-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    templates.push(newTmpl);
    localStorage.setItem(LS_KEYS.TEMPLATES, JSON.stringify(templates));
    return simulateDelay(newTmpl);
  }
  const response = await apiClient.post('/settings/shift-templates', data);
  return response.data;
};

export const updateShiftTemplate = async (id: string, data: Partial<ShiftTemplate>): Promise<ShiftTemplate> => {
  if (isMockMode()) {
    const templates = await getShiftTemplates();
    const idx = templates.findIndex((t) => t.id === id);
    if (idx >= 0) {
      templates[idx] = { ...templates[idx], ...data };
      localStorage.setItem(LS_KEYS.TEMPLATES, JSON.stringify(templates));
      return simulateDelay(templates[idx]);
    }
  }
  const response = await apiClient.put(`/settings/shift-templates/${id}`, data);
  return response.data;
};

export const deleteShiftTemplate = async (id: string): Promise<void> => {
  if (isMockMode()) {
    const templates = await getShiftTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(LS_KEYS.TEMPLATES, JSON.stringify(filtered));
    return simulateDelay(undefined);
  }
  await apiClient.delete(`/settings/shift-templates/${id}`);
};

// ==========================================
// 9. BASIC ACCOUNTING & CASH FLOW API
// ==========================================
const getStoredTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  const stored = localStorage.getItem(LS_KEYS.TRANSACTIONS);
  if (!stored) {
    localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
};

const saveStoredTransactions = (txs: Transaction[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(txs));
  }
};

export const getTransactions = async (params?: { type?: string; category?: string; branchId?: string }): Promise<Transaction[]> => {
  if (isMockMode()) {
    let list = getStoredTransactions();
    if (params?.type) list = list.filter((t) => t.transactionType === params.type);
    if (params?.category) list = list.filter((t) => t.category === params.category);
    if (params?.branchId && params.branchId !== 'ALL') list = list.filter((t) => t.branchId === params.branchId);
    return simulateDelay(list);
  }
  const queryParams: any = {};
  if (params?.type) queryParams.type = params.type;
  if (params?.category) queryParams.category = params.category;
  if (params?.branchId && params.branchId !== 'ALL') {
    queryParams.branch_id = params.branchId;
    queryParams.branchId = params.branchId;
  }
  const response = await apiClient.get('/accounting/transactions', { params: queryParams });
  return response.data;
};

export const createTransaction = async (data: Omit<Transaction, 'id' | 'code' | 'createdAt'>): Promise<Transaction> => {
  if (isMockMode()) {
    const list = getStoredTransactions();
    const prefix = data.transactionType === 'INCOME' ? 'PT' : 'PC';
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now().toString().slice(-6)}`,
      code: `${prefix}-${dateStr}-${(list.length + 1).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newTx);
    saveStoredTransactions(list);
    return simulateDelay(newTx);
  }
  const response = await apiClient.post('/accounting/transactions', data);
  return response.data;
};

export const getCashFlowSummary = async (params?: { branchId?: string }): Promise<CashFlowSummary> => {
  if (isMockMode()) {
    const txs = getStoredTransactions().filter((t) => !params?.branchId || params.branchId === 'ALL' || t.branchId === params.branchId);
    const totalIncome = txs.filter((t) => t.transactionType === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = txs.filter((t) => t.transactionType === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalIncome - totalExpense;

    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    txs.forEach((t) => {
      if (t.transactionType === 'INCOME') {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      } else {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      }
    });

    return simulateDelay({
      periodLabel: 'Tháng này (08/2026)',
      totalIncome,
      totalExpense,
      netCashFlow,
      cashBalance: 2500000 + Math.max(0, netCashFlow * 0.2),
      bankBalance: 18500000 + Math.max(0, netCashFlow * 0.8),
      totalTransactionsCount: txs.length,
      incomeByCategory,
      expenseByCategory,
    });
  }
  const queryParams: any = {};
  if (params?.branchId && params.branchId !== 'ALL') {
    queryParams.branch_id = params.branchId;
    queryParams.branchId = params.branchId;
  }
  const response = await apiClient.get('/accounting/summary', { params: queryParams });
  return response.data;
};

export const getPnLReport = async (params?: { branchId?: string }): Promise<PnLReport> => {
  if (isMockMode()) {
    const orders = getStoredOrders().filter((o) => !params?.branchId || params.branchId === 'ALL' || o.branchId === params.branchId);
    const grossRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0) || 5500000;
    const cogs = Math.round(grossRevenue * 0.35);
    const grossProfit = grossRevenue - cogs;
    const operatingExpenses = Math.round(grossRevenue * 0.22);
    const netProfit = grossProfit - operatingExpenses;

    return simulateDelay({
      periodLabel: 'Tháng 08/2026',
      grossRevenue,
      cogs,
      grossProfit,
      grossMarginPercent: Math.round((grossProfit / grossRevenue) * 1000) / 10,
      operatingExpenses,
      netProfit,
      netMarginPercent: Math.round((netProfit / grossRevenue) * 1000) / 10,
      expensesBreakdown: {
        'Bột mì, Bơ lạt & Sữa': Math.round(cogs * 0.7),
        'Bao bì hộp bánh': Math.round(cogs * 0.3),
        'Điện nước & Gas nướng': Math.round(operatingExpenses * 0.4),
        'Lương nhân sự ca': Math.round(operatingExpenses * 0.6),
      },
    });
  }
  const queryParams: any = {};
  if (params?.branchId && params.branchId !== 'ALL') {
    queryParams.branch_id = params.branchId;
    queryParams.branchId = params.branchId;
  }
  const response = await apiClient.get('/accounting/pnl', { params: queryParams });
  return response.data;
};

// ==========================================
// 10. ROLES & PERMISSIONS API (PBAC)
// ==========================================
export const getPermissions = async (): Promise<Permission[]> => {
  if (isMockMode()) {
    const list = getStoredPermissions();
    return simulateDelay(list);
  }
  const response = await apiClient.get('/permissions');
  return response.data;
};

export const getRoles = async (): Promise<Role[]> => {
  if (isMockMode()) {
    const roles = getStoredRoles();
    const users = getStoredUsers();
    // Compute live user_count for each role
    const enriched = roles.map((r) => ({
      ...r,
      user_count: users.filter((u) => u.roleId === r.id || u.role === r.code).length,
    }));
    return simulateDelay(enriched);
  }
  const response = await apiClient.get('/roles');
  return response.data;
};

export const getRoleById = async (roleId: string): Promise<Role> => {
  if (isMockMode()) {
    const roles = getStoredRoles();
    const role = roles.find((r) => r.id === roleId);
    if (!role) throw new Error('Role not found');
    const users = getStoredUsers();
    role.user_count = users.filter((u) => u.roleId === role.id || u.role === role.code).length;
    return simulateDelay(role);
  }
  const response = await apiClient.get(`/roles/${roleId}`);
  return response.data;
};

export const createRole = async (data: { code: string; name: string; description?: string; permission_ids: string[] }): Promise<Role> => {
  if (isMockMode()) {
    const roles = getStoredRoles();
    const perms = getStoredPermissions();
    const selectedPerms = perms.filter((p) => data.permission_ids.includes(p.id));
    const cleanCode = data.code.trim().toUpperCase().replace(/\s+/g, '_');

    // Check duplicate code
    if (roles.some((r) => r.code === cleanCode)) {
      throw new Error(`Mã vai trò '${cleanCode}' đã tồn tại!`);
    }

    const newRole: Role = {
      id: `role-${Date.now().toString().slice(-4)}`,
      code: cleanCode,
      name: data.name.trim(),
      description: data.description || '',
      is_system: false,
      permissions_version: 1,
      permissions: selectedPerms,
      user_count: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStoredRoles([...roles, newRole]);

    // Record audit log
    const auditLogs = getStoredAuditLogs();
    const newAudit: AuditLog = {
      id: `audit-${Date.now().toString().slice(-6)}`,
      user_id: 'user-000',
      user_name: 'Tổng Quản Trị Hệ Thống',
      action: 'ROLE_CREATE',
      target_type: 'ROLE',
      target_id: newRole.id,
      target_name: newRole.name,
      changes_summary: `Tạo vai trò mới '${newRole.name}' (${newRole.code}) với ${selectedPerms.length} quyền`,
      details_json: JSON.stringify({ code: newRole.code, permissions: selectedPerms.map((p) => p.code) }),
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    saveStoredAuditLogs([newAudit, ...auditLogs]);

    return simulateDelay(newRole);
  }

  const response = await apiClient.post('/roles', data);
  return response.data;
};

export const updateRole = async (roleId: string, data: { name?: string; description?: string; permission_ids?: string[] }): Promise<Role> => {
  if (isMockMode()) {
    const roles = getStoredRoles();
    const idx = roles.findIndex((r) => r.id === roleId);
    if (idx === -1) throw new Error('Role not found');

    const role = roles[idx];
    const oldPermCodes = role.permissions.map((p) => p.code);
    let newPerms = role.permissions;

    if (data.permission_ids) {
      const allPerms = getStoredPermissions();
      newPerms = allPerms.filter((p) => data.permission_ids!.includes(p.id));
      role.permissions = newPerms;
      role.permissions_version = (role.permissions_version || 1) + 1;
    }
    if (data.name) role.name = data.name.trim();
    if (data.description !== undefined) role.description = data.description;
    role.updatedAt = new Date().toISOString();

    roles[idx] = role;
    saveStoredRoles(roles);

    // Update active user in localStorage if matching role
    const curUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (curUserStr) {
      try {
        const curUser = JSON.parse(curUserStr);
        if (curUser.roleId === role.id || curUser.role === role.code) {
          curUser.permissions = newPerms.map((p) => p.code);
          curUser.permissionsVersion = role.permissions_version;
          localStorage.setItem('user', JSON.stringify(curUser));
          document.cookie = `artisan_permissions=${encodeURIComponent(JSON.stringify(curUser.permissions))}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `artisan_perm_version=${encodeURIComponent(String(role.permissions_version))}; path=/; max-age=604800; SameSite=Lax`;
        }
      } catch {
        // ignore
      }
    }

    // Record audit log
    const newPermCodes = newPerms.map((p) => p.code);
    const diffAdded = newPermCodes.filter((c) => !oldPermCodes.includes(c));
    const diffRemoved = oldPermCodes.filter((c) => !newPermCodes.includes(c));
    const auditLogs = getStoredAuditLogs();
    const newAudit: AuditLog = {
      id: `audit-${Date.now().toString().slice(-6)}`,
      user_id: 'user-000',
      user_name: 'Tổng Quản Trị Hệ Thống',
      action: 'ROLE_UPDATE_PERMISSIONS',
      target_type: 'ROLE',
      target_id: role.id,
      target_name: role.name,
      changes_summary: `Cập nhật quyền vai trò '${role.name}' (+${diffAdded.length}/-${diffRemoved.length})`,
      details_json: JSON.stringify({ before: oldPermCodes, after: newPermCodes, diff_added: diffAdded, diff_removed: diffRemoved, version: role.permissions_version }),
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    saveStoredAuditLogs([newAudit, ...auditLogs]);

    return simulateDelay(role);
  }

  const response = await apiClient.put(`/roles/${roleId}`, data);
  return response.data;
};

export const deleteRole = async (roleId: string): Promise<{ message: string }> => {
  if (isMockMode()) {
    const roles = getStoredRoles();
    const role = roles.find((r) => r.id === roleId);
    if (!role) throw new Error('Role not found');
    if (role.is_system) throw new Error('Không thể xóa vai trò hệ thống gốc!');

    const users = getStoredUsers();
    const count = users.filter((u) => u.roleId === role.id || u.role === role.code).length;
    if (count > 0) throw new Error(`Không thể xóa vai trò đang có ${count} người dùng trực thuộc!`);

    saveStoredRoles(roles.filter((r) => r.id !== roleId));

    const auditLogs = getStoredAuditLogs();
    const newAudit: AuditLog = {
      id: `audit-${Date.now().toString().slice(-6)}`,
      user_id: 'user-000',
      user_name: 'Tổng Quản Trị Hệ Thống',
      action: 'ROLE_DELETE',
      target_type: 'ROLE',
      target_id: role.id,
      target_name: role.name,
      changes_summary: `Xóa vai trò tùy biến '${role.name}' (${role.code})`,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    saveStoredAuditLogs([newAudit, ...auditLogs]);

    return simulateDelay({ message: `Đã xóa vai trò '${role.name}' thành công!` });
  }

  const response = await apiClient.delete(`/roles/${roleId}`);
  return response.data;
};

export const getAuditLogs = async (targetType?: string): Promise<AuditLog[]> => {
  if (isMockMode()) {
    let logs = getStoredAuditLogs();
    if (targetType) {
      logs = logs.filter((l) => l.target_type === targetType);
    }
    return simulateDelay(logs);
  }

  const response = await apiClient.get('/audit-logs', { params: { target_type: targetType } });
  return response.data;
};





