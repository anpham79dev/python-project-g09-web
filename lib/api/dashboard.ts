import apiClient from '../axios';
import { DashboardStats } from '../mock-data';
import { isMockMode, simulateDelay, getStoredOrders, getStoredProducts, getStoredUsers } from './_shared';

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
