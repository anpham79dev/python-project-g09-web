import { ALL_PERMISSIONS, ALL_PERMISSION_CODES } from "./rbac-config";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  image: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
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
  paymentMethod: "CASH" | "QR_TRANSFER" | "CARD";
  status: "COMPLETED" | "PENDING" | "CANCELLED";
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
  action:
    | "ROLE_CREATE"
    | "ROLE_UPDATE_PERMISSIONS"
    | "ROLE_DELETE"
    | "USER_ROLE_CHANGE";
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
  status: "ACTIVE" | "INACTIVE";
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
  branchId?: string;
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
  status: "OPEN" | "CLOSED";
  note?: string | null;
  createdAt: string;
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
  warehouseType: "RETAIL" | "COLD_STORAGE" | "CENTRAL";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  managerName?: string | null;
  status: "ACTIVE" | "INACTIVE";
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
  status: "in_stock" | "low_stock" | "out_of_stock";
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
  transactionType: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  branchId?: string | null;
  branchName?: string | null;
  paymentMethod: "CASH" | "BANK_TRANSFER";
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
  topSellingProducts: {
    id: string;
    name: string;
    category: string;
    soldCount: number;
    revenue: number;
    image: string;
  }[];
  slowSellingProducts: SlowSellingProduct[];
  paymentMethods: PaymentMethodStat[];
  categorySales: CategoryStat[];
  staffPerformances: StaffPerformanceStat[];
  lowStockDetails: LowStockDetailItem[];
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "Croissant Bơ Pháp Truyền Thống",
    category: "Bánh Mì Ngọt & Pastry",
    price: 35000,
    stock: 45,
    description:
      "Vỏ bánh ngàn lớp giòn xốp, thơm nồng mùi bơ Pháp nhập khẩu cao cấp Elle & Vire.",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80",
    status: "in_stock",
    createdAt: "2026-08-01T08:00:00Z",
  },
  {
    id: "prod-002",
    name: "Sourdough Men Tự Nhiên (500g)",
    category: "Bánh Mì Nghệ Nhân (Artisan)",
    price: 65000,
    stock: 14,
    description:
      "Lên men tự nhiên hơn 24 giờ, vỏ giòn ruột dai mềm xốp, vị chua nhẹ đặc trưng dễ tiêu hóa.",
    image:
      "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&q=80",
    status: "in_stock",
    createdAt: "2026-08-02T08:00:00Z",
  },
  {
    id: "prod-003",
    name: "Pain au Chocolat (Bánh Sô-cô-la)",
    category: "Bánh Mì Ngọt & Pastry",
    price: 40000,
    stock: 28,
    description:
      "Bánh bột ngàn lớp cuộn nhân 2 thanh sô-cô-la đen nguyên chất 65% tan chảy quyến rũ.",
    image:
      "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80",
    status: "in_stock",
    createdAt: "2026-08-03T08:00:00Z",
  },
  {
    id: "prod-004",
    name: "Baguette Pháp Truyền Thống",
    category: "Bánh Mì Nghệ Nhân (Artisan)",
    price: 25000,
    stock: 35,
    description:
      "Bánh mì dài kiểu Pháp truyền thống, vỏ mỏng vàng ruộm giòn tan, ruột xốp mềm dai.",
    image:
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80",
    status: "in_stock",
    createdAt: "2026-08-04T08:00:00Z",
  },
  {
    id: "prod-005",
    name: "Bánh Kem Dâu Tây Matcha Nhật Bản",
    category: "Bánh Kem & Sinh Nhật",
    price: 280000,
    stock: 6,
    description:
      "Cốt bánh chiffon trà xanh Uji xốp ẩm, kem tươi béo nhẹ hòa quyện cùng dâu tây Đà Lạt tươi mọng.",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80",
    status: "low_stock",
    createdAt: "2026-08-05T08:00:00Z",
  },
  {
    id: "prod-006",
    name: "Tiramisu Cacao Mascarpone Ý",
    category: "Bánh Kem & Sinh Nhật",
    price: 55000,
    stock: 18,
    description:
      "Bánh ngón tay Savoiardi thấm đẫm cà phê espresso đậm đặc và phô mai mascarpone béo ngậy.",
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80",
    status: "in_stock",
    createdAt: "2026-08-06T08:00:00Z",
  },
  {
    id: "prod-007",
    name: "Cinnamon Roll Phủ Kem Phô Mai",
    category: "Bánh Mì Ngọt & Pastry",
    price: 42000,
    stock: 22,
    description:
      "Bánh cuộn quế thơm lừng với sốt cream cheese sánh mịn rưới đều bề mặt.",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    status: "in_stock",
    createdAt: "2026-08-07T08:00:00Z",
  },
  {
    id: "prod-008",
    name: "Cà Phê Muối Kem Béo Artisan",
    category: "Cà Phê & Đồ Uống",
    price: 35000,
    stock: 99,
    description:
      "Cà phê Robusta rang mộc pha phin truyền thống hòa quyện lớp kem muối hồng mặn mà thơm béo.",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
    status: "in_stock",
    createdAt: "2026-08-08T08:00:00Z",
  },
  {
    id: "prod-009",
    name: "Trà Sữa Oolong Nướng Trân Châu",
    category: "Cà Phê & Đồ Uống",
    price: 38000,
    stock: 80,
    description:
      "Trà Oolong nướng thơm đượm vị khói quyện sữa tươi thanh trùng và trân châu hoàng kim dẻo dai.",
    image:
      "https://images.unsplash.com/photo-1558857563-b37fcbfca614?w=400&q=80",
    status: "in_stock",
    createdAt: "2026-08-09T08:00:00Z",
  },
  {
    id: "prod-010",
    name: "Bánh Mì Phô Mai Bơ Tỏi Hàn Quốc",
    category: "Bánh Mì Ngọt & Pastry",
    price: 48000,
    stock: 3,
    description:
      "Vỏ bánh giòn rụm ngập sốt bơ tỏi ngọt dịu, nhân phô mai kem tan chảy béo ngậy.",
    image:
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80",
    status: "low_stock",
    createdAt: "2026-08-10T08:00:00Z",
  },
  {
    id: "prod-011",
    name: "Cheesecake Cháy San Sebastian",
    category: "Bánh Kem & Sinh Nhật",
    price: 60000,
    stock: 0,
    description:
      "Bánh phô mai nướng bề mặt caramel đậm đà, lõi bên trong mềm mịn tan ngay trên đầu lưỡi.",
    image:
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80",
    status: "out_of_stock",
    createdAt: "2026-08-11T08:00:00Z",
  },
];

export const INITIAL_PERMISSIONS: Permission[] = ALL_PERMISSIONS.map((p) => ({
  id: `perm-${p.code.replace(":", "-")}`,
  code: p.code,
  name: p.name,
  module: p.module,
  description: p.description,
  createdAt: "2026-01-01T00:00:00Z",
}));

export const INITIAL_ROLES: Role[] = [
  {
    id: "role-superadmin",
    code: "SUPER_ADMIN",
    name: "Tổng Quản Trị Hệ Thống",
    description: "Toàn quyền truy cập và quản trị toàn bộ hệ thống ERP SaaS.",
    is_system: true,
    permissions_version: 1,
    permissions: INITIAL_PERMISSIONS,
    user_count: 1,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role-admin",
    code: "ADMIN",
    name: "Quản Trị Viên (Chủ Chuỗi)",
    description:
      "Toàn quyền quản trị nghiệp vụ chuỗi tiệm bánh (Bán hàng, Kho, Đơn, Sổ quỹ, Nhân sự, Cài đặt).",
    is_system: true,
    permissions_version: 1,
    permissions: INITIAL_PERMISSIONS,
    user_count: 1,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role-staff",
    code: "STAFF",
    name: "Nhân Viên Thu Ngân",
    description:
      "Quyền bán hàng POS, xem danh mục sản phẩm, quản lý đơn hàng và bàn giao ca làm việc.",
    is_system: true,
    permissions_version: 1,
    permissions: INITIAL_PERMISSIONS.filter((p) =>
      [
        "pos:access",
        "pos:checkout",
        "products:read",
        "orders:read",
        "shifts:read",
      ].includes(p.code),
    ),
    user_count: 3,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "audit-260817-001",
    user_id: "user-000",
    user_name: "Tổng Quản Trị Hệ Thống",
    action: "ROLE_CREATE",
    target_type: "ROLE",
    target_id: "role-superadmin",
    target_name: "Tổng Quản Trị Hệ Thống",
    changes_summary: "Khởi tạo vai trò hệ thống gốc SUPER_ADMIN với 20 quyền",
    details_json: JSON.stringify({
      code: "SUPER_ADMIN",
      permissions_count: 20,
    }),
    ip_address: "127.0.0.1",
    created_at: "2026-08-16T12:00:00Z",
  },
  {
    id: "audit-260817-002",
    user_id: "user-000",
    user_name: "Tổng Quản Trị Hệ Thống",
    action: "ROLE_CREATE",
    target_type: "ROLE",
    target_id: "role-admin",
    target_name: "Quản Trị Viên (Chủ Chuỗi)",
    changes_summary: "Khởi tạo vai trò hệ thống gốc ADMIN với 20 quyền",
    details_json: JSON.stringify({ code: "ADMIN", permissions_count: 20 }),
    ip_address: "127.0.0.1",
    created_at: "2026-08-16T12:00:00Z",
  },
  {
    id: "audit-260817-003",
    user_id: "user-000",
    user_name: "Tổng Quản Trị Hệ Thống",
    action: "ROLE_CREATE",
    target_type: "ROLE",
    target_id: "role-staff",
    target_name: "Nhân Viên Thu Ngân",
    changes_summary: "Khởi tạo vai trò hệ thống gốc STAFF với 5 quyền",
    details_json: JSON.stringify({ code: "STAFF", permissions_count: 5 }),
    ip_address: "127.0.0.1",
    created_at: "2026-08-16T12:00:00Z",
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: "user-000",
    username: "superadmin",
    fullName: "Tổng Quản Trị Hệ Thống",
    email: "superadmin@artisanbakery.vn",
    phone: "0999888777",
    role: "SUPER_ADMIN",
    roleId: "role-superadmin",
    roleName: "Tổng Quản Trị Hệ Thống",
    permissions: ALL_PERMISSION_CODES,
    permissionsVersion: 1,
    status: "ACTIVE",
    defaultBranchId: null,
    defaultBranchName: "Toàn Nền Tảng (SaaS Platform)",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "user-001",
    username: "admin",
    fullName: "Nguyễn Quản Trị",
    email: "admin@artisanbakery.vn",
    phone: "0901234567",
    role: "ADMIN",
    roleId: "role-admin",
    roleName: "Quản Trị Viên (Chủ Chuỗi)",
    permissions: ALL_PERMISSION_CODES,
    permissionsVersion: 1,
    status: "ACTIVE",
    defaultBranchId: null,
    defaultBranchName: "Toàn Chuỗi / Quản Trị",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "user-002",
    username: "staff",
    fullName: "Trần Thị Thu Ngân",
    email: "thungan@artisanbakery.vn",
    phone: "0912345678",
    role: "STAFF",
    roleId: "role-staff",
    roleName: "Nhân Viên Thu Ngân",
    permissions: [
      "pos:access",
      "pos:checkout",
      "products:read",
      "orders:read",
      "shifts:read",
    ],
    permissionsVersion: 1,
    status: "ACTIVE",
    defaultBranchId: "branch-001",
    defaultBranchName: "Artisan Bakery - Chi Nhánh Quận 1 (Trụ Sở)",
    createdAt: "2026-02-15T08:00:00Z",
  },
  {
    id: "user-003",
    username: "lethuha",
    fullName: "Lê Thu Hà",
    email: "thuha@artisanbakery.vn",
    phone: "0988776655",
    role: "STAFF",
    roleId: "role-staff",
    roleName: "Nhân Viên Thu Ngân",
    permissions: [
      "pos:access",
      "pos:checkout",
      "products:read",
      "orders:read",
      "shifts:read",
    ],
    permissionsVersion: 1,
    status: "ACTIVE",
    defaultBranchId: "branch-002",
    defaultBranchName: "Artisan Bakery - Chi Nhánh Thảo Điền",
    createdAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "user-004",
    username: "phamminh",
    fullName: "Phạm Minh Bếp Bánh",
    email: "minh.chef@artisanbakery.vn",
    phone: "0977665544",
    role: "STAFF",
    roleId: "role-staff",
    roleName: "Nhân Viên Thu Ngân",
    permissions: [
      "pos:access",
      "pos:checkout",
      "products:read",
      "orders:read",
      "shifts:read",
    ],
    permissionsVersion: 1,
    status: "INACTIVE",
    defaultBranchId: "branch-001",
    defaultBranchName: "Artisan Bakery - Chi Nhánh Quận 1 (Trụ Sở)",
    createdAt: "2026-04-10T08:00:00Z",
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1001",
    code: "HD-260816-01",
    customerName: "Khách lẻ - Anh Hoàng",
    customerPhone: "0933112233",
    staffId: "user-002",
    staffName: "Trần Thị Thu Ngân",
    items: [
      {
        productId: "prod-001",
        productName: "Croissant Bơ Pháp Truyền Thống",
        price: 35000,
        quantity: 2,
        subtotal: 70000,
        image:
          "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80",
      },
      {
        productId: "prod-008",
        productName: "Cà Phê Muối Kem Béo Artisan",
        price: 35000,
        quantity: 2,
        subtotal: 70000,
        image:
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
      },
    ],
    subtotal: 140000,
    discount: 0,
    totalAmount: 140000,
    paymentMethod: "QR_TRANSFER",
    status: "COMPLETED",
    note: "Uống tại chỗ, ít ngọt",
    createdAt: "2026-08-16T08:30:00Z",
  },
  {
    id: "ord-1002",
    code: "HD-260816-02",
    customerName: "Chị Mai Lan",
    customerPhone: "0918889999",
    staffId: "user-002",
    staffName: "Trần Thị Thu Ngân",
    items: [
      {
        productId: "prod-005",
        productName: "Bánh Kem Dâu Tây Matcha Nhật Bản",
        price: 280000,
        quantity: 1,
        subtotal: 280000,
        image:
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80",
      },
      {
        productId: "prod-003",
        productName: "Pain au Chocolat (Bánh Sô-cô-la)",
        price: 40000,
        quantity: 3,
        subtotal: 120000,
        image:
          "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80",
      },
    ],
    subtotal: 400000,
    discount: 20000,
    totalAmount: 380000,
    paymentMethod: "CARD",
    status: "COMPLETED",
    note: "Kèm dao dĩa và nến số 25",
    createdAt: "2026-08-16T09:15:00Z",
  },
  {
    id: "ord-1003",
    code: "HD-260816-03",
    customerName: "Khách vãng lai",
    customerPhone: "",
    staffId: "user-003",
    staffName: "Lê Thu Hà",
    items: [
      {
        productId: "prod-002",
        productName: "Sourdough Men Tự Nhiên (500g)",
        price: 65000,
        quantity: 1,
        subtotal: 65000,
        image:
          "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&q=80",
      },
      {
        productId: "prod-004",
        productName: "Baguette Pháp Truyền Thống",
        price: 25000,
        quantity: 2,
        subtotal: 50000,
        image:
          "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80",
      },
    ],
    subtotal: 115000,
    discount: 0,
    totalAmount: 115000,
    paymentMethod: "CASH",
    status: "COMPLETED",
    note: "Cắt lát sẵn bánh sourdough",
    createdAt: "2026-08-16T10:00:00Z",
  },
  {
    id: "ord-1004",
    code: "HD-260816-04",
    customerName: "Bác Hùng Bakery Club",
    customerPhone: "0909090909",
    staffId: "user-002",
    staffName: "Trần Thị Thu Ngân",
    items: [
      {
        productId: "prod-007",
        productName: "Cinnamon Roll Phủ Kem Phô Mai",
        price: 42000,
        quantity: 4,
        subtotal: 168000,
        image:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
      },
      {
        productId: "prod-009",
        productName: "Trà Sữa Oolong Nướng Trân Châu",
        price: 38000,
        quantity: 4,
        subtotal: 152000,
        image:
          "https://images.unsplash.com/photo-1558857563-b37fcbfca614?w=400&q=80",
      },
    ],
    subtotal: 320000,
    discount: 0,
    totalAmount: 320000,
    paymentMethod: "QR_TRANSFER",
    status: "COMPLETED",
    note: "Đóng hộp quà 4 bánh",
    createdAt: "2026-08-16T11:20:00Z",
  },
  {
    id: "ord-1005",
    code: "HD-260816-05",
    customerName: "Khách công ty FPT",
    customerPhone: "0987654321",
    staffId: "user-003",
    staffName: "Lê Thu Hà",
    items: [
      {
        productId: "prod-001",
        productName: "Croissant Bơ Pháp Truyền Thống",
        price: 35000,
        quantity: 10,
        subtotal: 350000,
        image:
          "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80",
      },
      {
        productId: "prod-006",
        productName: "Tiramisu Cacao Mascarpone Ý",
        price: 55000,
        quantity: 6,
        subtotal: 330000,
        image:
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80",
      },
    ],
    subtotal: 680000,
    discount: 50000,
    totalAmount: 630000,
    paymentMethod: "QR_TRANSFER",
    status: "COMPLETED",
    note: "Tiệc trà chiều công ty",
    createdAt: "2026-08-16T14:10:00Z",
  },
  {
    id: "ord-1006",
    code: "HD-260815-01",
    customerName: "Cô Thu Ba",
    customerPhone: "0903344556",
    staffId: "user-002",
    staffName: "Trần Thị Thu Ngân",
    items: [
      {
        productId: "prod-004",
        productName: "Baguette Pháp Truyền Thống",
        price: 25000,
        quantity: 4,
        subtotal: 100000,
        image:
          "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80",
      },
    ],
    subtotal: 100000,
    discount: 0,
    totalAmount: 100000,
    paymentMethod: "CASH",
    status: "COMPLETED",
    createdAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "ord-1007",
    code: "HD-260815-02",
    customerName: "Anh Tuấn",
    customerPhone: "0912233445",
    staffId: "user-003",
    staffName: "Lê Thu Hà",
    items: [
      {
        productId: "prod-010",
        productName: "Bánh Mì Phô Mai Bơ Tỏi Hàn Quốc",
        price: 48000,
        quantity: 2,
        subtotal: 96000,
        image:
          "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80",
      },
      {
        productId: "prod-008",
        productName: "Cà Phê Muối Kem Béo Artisan",
        price: 35000,
        quantity: 1,
        subtotal: 35000,
        image:
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
      },
    ],
    subtotal: 131000,
    discount: 0,
    totalAmount: 131000,
    paymentMethod: "QR_TRANSFER",
    status: "COMPLETED",
    createdAt: "2026-08-15T15:45:00Z",
  },
];

export const CATEGORIES = [
  "Tất cả",
  "Bánh Mì Nghệ Nhân (Artisan)",
  "Bánh Mì Ngọt & Pastry",
  "Bánh Kem & Sinh Nhật",
  "Cà Phê & Đồ Uống",
];

export const INITIAL_SHIFTS: WorkShift[] = [
  {
    id: "shift-1001",
    shiftName: "Ca sáng (07:00 - 15:00) - 16/08/2026",
    staffId: "user-002",
    staffName: "Trần Thị Thu Ngân",
    branchId: "branch-001",
    startTime: "2026-08-16T07:00:00Z",
    endTime: "2026-08-16T15:00:00Z",
    initialCash: 500000,
    cashRevenue: 150000,
    cardRevenue: 380000,
    qrRevenue: 479000,
    totalRevenue: 1009000,
    ordersCount: 6,
    expectedCash: 650000,
    actualCash: 650000,
    difference: 0,
    status: "CLOSED",
    note: "Bàn giao ca đầy đủ, khớp két 100%",
    createdAt: "2026-08-16T07:00:00Z",
  },
  {
    id: "shift-1002",
    shiftName: "Ca chiều tối (15:00 - 22:00) - 16/08/2026",
    staffId: "user-003",
    staffName: "Lê Thu Hà",
    branchId: "branch-002",
    startTime: "2026-08-16T15:00:00Z",
    endTime: null,
    initialCash: 500000,
    cashRevenue: 0,
    cardRevenue: 0,
    qrRevenue: 745000,
    totalRevenue: 745000,
    ordersCount: 2,
    expectedCash: 500000,
    actualCash: 0,
    difference: -500000,
    status: "OPEN",
    note: null,
    createdAt: "2026-08-16T15:00:00Z",
  },
  {
    id: "shift-0999",
    shiftName: "Ca sáng (07:00 - 15:00) - 15/08/2026",
    staffId: "user-002",
    staffName: "Trần Thị Thu Ngân",
    branchId: "branch-001",
    startTime: "2026-08-15T07:00:00Z",
    endTime: "2026-08-15T15:00:00Z",
    initialCash: 500000,
    cashRevenue: 100000,
    cardRevenue: 0,
    qrRevenue: 0,
    totalRevenue: 100000,
    ordersCount: 1,
    expectedCash: 600000,
    actualCash: 600000,
    difference: 0,
    status: "CLOSED",
    note: "Chốt ca đúng giờ",
    createdAt: "2026-08-15T07:00:00Z",
  },
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: "branch-001",
    code: "CN-Q1",
    name: "Artisan Bakery - Chi Nhánh Quận 1 (Trụ Sở)",
    address: "123 Đường Đồng Khởi, Bến Nghé, Quận 1, TP.HCM",
    phone: "0901 234 567",
    managerName: "Nguyễn Quản Trị",
    status: "ACTIVE",
    createdAt: "2026-08-01T00:00:00Z",
    warehouses: [
      {
        id: "wh-001",
        branchId: "branch-001",
        code: "KHO-Q1-POS",
        name: "Kho Quầy Bán Lẻ Q1",
        warehouseType: "RETAIL",
        status: "ACTIVE",
        createdAt: "2026-08-01T00:00:00Z",
      },
      {
        id: "wh-002",
        branchId: "branch-001",
        code: "KHO-Q1-COLD",
        name: "Kho Lạnh Bảo Quản Q1",
        warehouseType: "COLD_STORAGE",
        status: "ACTIVE",
        createdAt: "2026-08-01T00:00:00Z",
      },
    ],
  },
  {
    id: "branch-002",
    code: "CN-TD",
    name: "Artisan Bakery - Chi Nhánh Thảo Điền",
    address: "45 Đường Xuân Thủy, Thảo Điền, TP. Thủ Đức, TP.HCM",
    phone: "0909 888 777",
    managerName: "Lê Thu Hà",
    status: "ACTIVE",
    createdAt: "2026-08-05T00:00:00Z",
    warehouses: [
      {
        id: "wh-003",
        branchId: "branch-002",
        code: "KHO-TD-POS",
        name: "Kho Quầy Bán Lẻ Thảo Điền",
        warehouseType: "RETAIL",
        status: "ACTIVE",
        createdAt: "2026-08-05T00:00:00Z",
      },
    ],
  },
];

export const INITIAL_SHIFT_TEMPLATES: ShiftTemplate[] = [
  {
    id: "tmpl-01",
    name: "Ca sáng (Sáng sớm & Đi làm)",
    startTime: "06:30",
    endTime: "14:30",
    defaultInitialCash: 500000,
    isActive: true,
    note: "Phục vụ điểm tâm sáng, bánh mì tươi và cà phê sáng",
    createdAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "tmpl-02",
    name: "Ca chiều tối (Tan tầm & Trà chiều)",
    startTime: "14:30",
    endTime: "22:30",
    defaultInitialCash: 500000,
    isActive: true,
    note: "Phục vụ bánh ngọt tiệc trà, sinh nhật và mang về",
    createdAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "tmpl-03",
    name: "Ca tăng cường cuối tuần (Gãy)",
    startTime: "10:00",
    endTime: "16:00",
    defaultInitialCash: 300000,
    isActive: true,
    note: "Bổ sung thu ngân giờ cao điểm thứ 7 & CN",
    createdAt: "2026-08-01T00:00:00Z",
  },
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  storeName: "Artisan Bakery",
  storeSlogan: "Tiệm Bánh Thủ Công Pháp & Cà Phê Thượng Hạng",
  hotline: "0901 234 567",
  address: "123 Đường Đồng Khởi, Quận 1, TP.HCM",
  defaultVatRate: 8,
  lowStockThreshold: 5,
  allowNegativeStock: false,
  requireShiftReconciliationNote: true,
  bankAccountNumber: "1028889999",
  bankName: "Vietcombank (VCB)",
  bankAccountHolder: "TIEM BANH ARTISAN BAKERY",
  receiptFooterNote: "Cảm ơn Quý Khách & Chúc Quý Khách Một Ngày Ngọt Ngào!",
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-001",
    code: "PT-260816-001",
    transactionType: "INCOME",
    category: "Thu doanh thu bán lẻ POS",
    amount: 2450000,
    branchId: "branch-001",
    branchName: "Artisan Bakery - Chi Nhánh Quận 1 (Trụ Sở)",
    paymentMethod: "BANK_TRANSFER",
    recipientPayer: "Khách hàng tổng hợp",
    note: "Doanh thu bán hàng ca sáng chuyển khoản VietQR",
    createdBy: "Hệ thống POS",
    createdAt: "2026-08-16T10:00:00Z",
  },
  {
    id: "tx-002",
    code: "PC-260816-001",
    transactionType: "EXPENSE",
    category: "Chi phí Nguyên vật liệu & Nhập hàng",
    amount: 850000,
    branchId: "branch-001",
    branchName: "Artisan Bakery - Chi Nhánh Quận 1 (Trụ Sở)",
    paymentMethod: "BANK_TRANSFER",
    recipientPayer: "Công ty TNHH Bơ Sữa Pháp Anchor",
    note: "Nhập 20kg bơ lạt Pháp và 50kg bột mì T55",
    createdBy: "Nguyễn Quản Trị",
    createdAt: "2026-08-16T12:00:00Z",
  },
  {
    id: "tx-003",
    code: "PC-260816-002",
    transactionType: "EXPENSE",
    category: "Chi phí Điện, Nước & Tiện ích",
    amount: 320000,
    branchId: "branch-001",
    branchName: "Artisan Bakery - Chi Nhánh Quận 1 (Trụ Sở)",
    paymentMethod: "BANK_TRANSFER",
    recipientPayer: "Điện lực EVN TP.HCM",
    note: "Tiền điện lò nướng công nghiệp tuần 2",
    createdBy: "Nguyễn Quản Trị",
    createdAt: "2026-08-16T14:00:00Z",
  },
  {
    id: "tx-004",
    code: "PC-260816-003",
    transactionType: "EXPENSE",
    category: "Chi phí Bao bì & Hộp bánh",
    amount: 250000,
    branchId: "branch-001",
    branchName: "Artisan Bakery - Chi Nhánh Quận 1 (Trụ Sở)",
    paymentMethod: "CASH",
    recipientPayer: "Xưởng in bao bì Kraft Tân Bình",
    note: "Nhập 500 túi giấy đựng croissant & hộp bánh sinh nhật",
    createdBy: "Trần Thị Thu Ngân",
    createdAt: "2026-08-16T16:00:00Z",
  },
  {
    id: "tx-005",
    code: "PT-260816-002",
    transactionType: "INCOME",
    category: "Thu bán bánh sinh nhật & sự kiện",
    amount: 1850000,
    branchId: "branch-002",
    branchName: "Artisan Bakery - Chi Nhánh Thảo Điền",
    paymentMethod: "BANK_TRANSFER",
    recipientPayer: "Công ty Thiết Kế V-Creative",
    note: "Đơn bánh tiệc teabreak chi nhánh Thảo Điền",
    createdBy: "Lê Thu Hà",
    createdAt: "2026-08-16T11:00:00Z",
  },
  {
    id: "tx-006",
    code: "PC-260816-004",
    transactionType: "EXPENSE",
    category: "Chi phí Nguyên vật liệu & Nhập hàng",
    amount: 620000,
    branchId: "branch-002",
    branchName: "Artisan Bakery - Chi Nhánh Thảo Điền",
    paymentMethod: "CASH",
    recipientPayer: "Đại lý Men & Trứng tươi Q2",
    note: "Nhập trứng gà tươi và men nở lạt",
    createdBy: "Lê Thu Hà",
    createdAt: "2026-08-16T13:00:00Z",
  },
];
