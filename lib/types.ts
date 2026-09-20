export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  image: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
}

export interface Order {
  id: string;
  code: string;
  customerName?: string;
  customerPhone?: string;
  branchId?: string | null;
  branchName?: string | null;
  staffId: string;
  staffName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'QR_TRANSFER' | 'CARD';
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  note?: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
  createdAt?: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_system: boolean;
  permissions_version: number;
  permissions: Permission[];
  user_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: 'ROLE_CREATE' | 'ROLE_UPDATE_PERMISSIONS' | 'ROLE_DELETE' | 'USER_ROLE_CHANGE';
  target_type: string;
  target_id: string;
  target_name: string;
  changes_summary: string;
  details_json?: string;
  ip_address?: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string; // 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | or custom role code
  roleId?: string;
  roleName?: string;
  permissions?: string[];
  permissionsVersion?: number;
  status: 'ACTIVE' | 'INACTIVE';
  defaultBranchId?: string | null;
  defaultBranchName?: string | null;
  lastActiveBranchId?: string | null;
  createdAt: string;
}

export interface SlowSellingProduct {
  id: string;
  name: string;
  category: string;
  soldCount: number;
  revenue: number;
  stock: number;
  image: string;
}

export interface PaymentMethodStat {
  method: string;
  methodLabel: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface CategoryStat {
  category: string;
  revenue: number;
  soldCount: number;
  percentage: number;
}

export interface StaffPerformanceStat {
  staffId: string;
  staffName: string;
  ordersCount: number;
  revenue: number;
  averageOrderValue: number;
}

export interface LowStockDetailItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  threshold: number;
  status: string;
  image: string;
}

export interface WorkShift {
  id: string;
  shiftName: string;
  staffId: string;
  staffName: string;
  startTime: string;
  endTime?: string | null;
  initialCash: number;
  cashRevenue: number;
  cardRevenue: number;
  qrRevenue: number;
  totalRevenue: number;
  ordersCount: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  status: 'OPEN' | 'CLOSED';
  note?: string | null;
  createdAt: string;
  branchId?: string | null;
  templateId?: string | null;
}

export interface ShiftScheduleResponse {
  templateId?: string | null;
  templateName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  defaultInitialCash: number;
  displayText: string;
  isCustom: boolean;
}

export interface ShiftSummary {
  totalShiftsCount: number;
  closedShiftsCount: number;
  openShiftsCount: number;
  totalRevenue: number;
  totalCash: number;
  totalCard: number;
  totalQr: number;
  totalDifference: number;
  shifts: WorkShift[];
}

export interface Warehouse {
  id: string;
  branchId: string;
  code: string;
  name: string;
  warehouseType: 'RETAIL' | 'COLD_STORAGE' | 'CENTRAL';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  isMain?: boolean;
  is_main?: boolean;
  managerName?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  warehouses: Warehouse[];
}

export interface StockItem {
  id: string;
  warehouseId: string;
  warehouseName?: string;
  branchId?: string;
  branchName?: string;
  productId: string;
  productName?: string;
  productImage?: string;
  productCategory?: string;
  quantity: number;
  minAlertStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  updatedAt: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  defaultInitialCash: number;
  isActive: boolean;
  note?: string | null;
  createdAt: string;
}

export interface SystemSettings {
  storeName: string;
  storeSlogan: string;
  hotline: string;
  address: string;
  defaultVatRate: number;
  lowStockThreshold: number;
  allowNegativeStock: boolean;
  requireShiftReconciliationNote: boolean;
  bankAccountNumber: string;
  bankName: string;
  bankAccountHolder: string;
  receiptFooterNote: string;
}

export interface Transaction {
  id: string;
  code: string;
  transactionType: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  branchId?: string | null;
  branchName?: string | null;
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  recipientPayer: string;
  note?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface CashFlowSummary {
  periodLabel: string;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  cashBalance: number;
  bankBalance: number;
  totalTransactionsCount: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
}

export interface PnLReport {
  periodLabel: string;
  grossRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  netProfit: number;
  netMarginPercent: number;
  expensesBreakdown: Record<string, number>;
}

export interface DashboardStats {
  periodLabel: string;
  previousPeriodLabel: string;
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueGrowth: number;
  todayOrdersCount: number;
  yesterdayOrdersCount: number;
  ordersGrowth: number;
  averageOrderValue: number;
  totalProductsCount: number;
  lowStockCount: number;
  recentSalesChart: { time: string; revenue: number; orders: number }[];
  topSellingProducts: { id: string; name: string; category: string; soldCount: number; revenue: number; image: string }[];
  slowSellingProducts: SlowSellingProduct[];
  paymentMethods: PaymentMethodStat[];
  categorySales: CategoryStat[];
  staffPerformances: StaffPerformanceStat[];
  lowStockDetails: LowStockDetailItem[];
  lowStockThreshold?: number;
}

export const CATEGORIES = [
  'Tất cả',
  'Bánh Mì Nghệ Nhân (Artisan)',
  'Bánh Mì Ngọt & Pastry',
  'Bánh Kem & Sinh Nhật',
  'Cà Phê & Đồ Uống',
];
