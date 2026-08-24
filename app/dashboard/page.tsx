'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Tag,
  Button,
  App,
  Typography,
  Tabs,
  Segmented,
  DatePicker,
  Avatar,
  Progress,
  Tooltip,
  Empty,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  CalendarOutlined,
  ReloadOutlined,
  FireOutlined,
  CreditCardOutlined,
  TeamOutlined,
  PieChartOutlined,
  BarChartOutlined,
  EditOutlined,
  ShopOutlined,
  InboxOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import type { Dayjs } from 'dayjs';
import { getDashboardStats, getBranches } from '@/lib/api';
import PageLoading from '@/app/components/page-loading';
import {
  DashboardStats,
  StaffPerformanceStat,
  LowStockDetailItem,
  SlowSellingProduct,
  Branch,
} from '@/lib/mock-data';
import { getCurrentUser, hasPermission } from '@/lib/auth';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Color Palette for Charts
const PAYMENT_COLORS: Record<string, string> = {
  QR_TRANSFER: '#06B6D4',
  CASH: '#10B981',
  CARD: '#3B82F6',
};

const CATEGORY_COLORS = ['#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#64748B'];

export default function DashboardPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Time Range Filter State
  const [selectedRange, setSelectedRange] = useState<string>('today');
  const [customDates, setCustomDates] = useState<[Dayjs, Dayjs] | null>(null);
  const [activeTab, setActiveTab] = useState<string>('sales-trends');

  // Check Admin permission and load branches
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (!hasPermission(user, 'dashboard:view') && user.role !== 'SUPER_ADMIN') {
      message.error('Bạn không có quyền xem Báo cáo Dashboard!');
      router.push('/pos');
    }

    getBranches().then((list) => setBranches(list));
  }, [router, message]);

  const loadStats = async (rangeKey = selectedRange, dates = customDates, branchId = selectedBranchId) => {
    setLoading(true);
    try {
      const params: { range: string; startDate?: string; endDate?: string; branchId?: string } = {
        range: rangeKey,
        branchId: branchId !== 'ALL' ? branchId : undefined,
      };

      if (rangeKey === 'custom' && dates && dates[0] && dates[1]) {
        params.startDate = dates[0].format('YYYY-MM-DD');
        params.endDate = dates[1].format('YYYY-MM-DD');
      }

      const data = await getDashboardStats(params);
      setStats(data);
    } catch {
      message.error('Lỗi khi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats(selectedRange, customDates, selectedBranchId);

    const handleBranchChange = (e: any) => {
      const newBranchId = e.detail || localStorage.getItem('artisan_active_branch_id') || 'ALL';
      setSelectedBranchId(newBranchId);
    };
    window.addEventListener('artisan_branch_changed', handleBranchChange);
    return () => window.removeEventListener('artisan_branch_changed', handleBranchChange);
  }, [selectedRange, selectedBranchId]);

  const handleCustomRangeChange = (dates: any) => {
    setCustomDates(dates);
    if (dates && dates[0] && dates[1]) {
      loadStats('custom', dates, selectedBranchId);
    }
  };

  // ==========================================
  // TABLE COLUMNS CONFIGURATIONS
  // ==========================================

  // 1. Top 5 Best Selling Products
  const topProductColumns: ColumnsType<any> = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 60,
      align: 'center',
      render: (_, __, index) => {
        const bg =
          index === 0
            ? 'bg-amber-100 text-amber-800 border-amber-300'
            : index === 1
            ? 'bg-slate-100 text-slate-700 border-slate-300'
            : index === 2
            ? 'bg-orange-100 text-orange-800 border-orange-300'
            : 'bg-gray-50 text-secondary border-gray-200';
        return (
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${bg}`}>
            {index + 1}
          </span>
        );
      },
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.image}
            alt={record.name}
            className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB]"
          />
          <div>
            <span className="font-semibold text-xs text-[#111827] block">{record.name}</span>
            <span className="text-[11px] text-emerald-700 font-medium">{record.category}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'soldCount',
      key: 'soldCount',
      align: 'center',
      render: (count: number) => (
        <span className="font-bold text-xs text-[#111827] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          {count} cái
        </span>
      ),
    },
    {
      title: 'Doanh thu thu về',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (val: number) => (
        <span className="font-mono font-bold text-xs text-[#006C49]">
          {val.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
  ];

  // 2. Slow Selling Products Table
  const slowProductColumns: ColumnsType<SlowSellingProduct> = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.image}
            alt={record.name}
            className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB]"
          />
          <div>
            <span className="font-semibold text-xs text-[#111827] block">{record.name}</span>
            <span className="text-[11px] text-gray-500 font-medium">{record.category}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Đã bán trong kỳ',
      dataIndex: 'soldCount',
      key: 'soldCount',
      align: 'center',
      render: (count: number) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${count === 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700'}`}>
          {count} cái
        </span>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (val: number) => (
        <span className="font-mono font-semibold text-xs text-gray-700">
          {val.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Tồn kho hiện tại',
      dataIndex: 'stock',
      key: 'stock',
      align: 'center',
      render: (stock: number) => (
        <span className={`text-xs font-mono font-semibold ${stock > 20 ? 'text-amber-600 font-bold' : 'text-gray-600'}`}>
          {stock} cái {stock > 20 ? '(Tồn đọng)' : ''}
        </span>
      ),
    },
    {
      title: 'Hành động đề xuất',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Chỉnh sửa giá / Khuyến mãi">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => router.push(`/products/${record.id}/edit`)}
            className="text-xs text-[#006C49] border-[#006C49]"
          >
            Điều chỉnh
          </Button>
        </Tooltip>
      ),
    },
  ];

  // 3. Staff Performance Table
  const staffColumns: ColumnsType<StaffPerformanceStat> = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <span className="font-bold text-xs text-secondary">
          #{index + 1}
        </span>
      ),
    },
    {
      title: 'Thu ngân / Nhân viên',
      key: 'staffName',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-[#006C49] text-white font-bold">
            {record.staffName.charAt(0)}
          </Avatar>
          <div>
            <span className="font-semibold text-xs text-[#111827] block">{record.staffName}</span>
            <span className="text-[11px] text-secondary">Mã NV: {record.staffId}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Số đơn hoàn tất',
      dataIndex: 'ordersCount',
      key: 'ordersCount',
      align: 'center',
      sorter: (a, b) => a.ordersCount - b.ordersCount,
      render: (cnt: number) => (
        <span className="font-bold text-xs text-[#111827] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {cnt} hóa đơn
        </span>
      ),
    },
    {
      title: 'Tổng doanh thu tạo ra',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      sorter: (a, b) => a.revenue - b.revenue,
      defaultSortOrder: 'descend',
      render: (val: number) => (
        <span className="font-mono font-bold text-xs text-[#006C49]">
          {val.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Giá trị TB / Đơn',
      dataIndex: 'averageOrderValue',
      key: 'averageOrderValue',
      align: 'right',
      sorter: (a, b) => a.averageOrderValue - b.averageOrderValue,
      render: (val: number) => (
        <span className="font-mono text-xs text-secondary font-medium">
          {val.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
  ];

  // 4. Low Stock Detail Table
  const lowStockColumns: ColumnsType<LowStockDetailItem> = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.image}
            alt={record.name}
            className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB]"
          />
          <div>
            <span className="font-semibold text-xs text-[#111827] block">{record.name}</span>
            <span className="text-[11px] text-emerald-700 font-medium">{record.category}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Tồn kho hiện tại',
      dataIndex: 'stock',
      key: 'stock',
      align: 'center',
      sorter: (a, b) => a.stock - b.stock,
      render: (stock: number) => (
        <span className={`font-bold font-mono text-sm ${stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
          {stock} cái
        </span>
      ),
    },
    {
      title: 'Ngưỡng cảnh báo',
      dataIndex: 'threshold',
      key: 'threshold',
      align: 'center',
      render: (th: number) => <span className="text-xs text-secondary font-mono">≤ {th} cái</span>,
    },
    {
      title: 'Trạng thái kho',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => (
        <Tag color={status === 'Hết hàng' ? 'error' : 'warning'} className="font-semibold text-xs">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => router.push(`/products/${record.id}/edit`)}
          className="bg-[#10B981] hover:bg-[#059669] text-xs font-semibold"
        >
          Nhập thêm / Sửa
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Header & Date Range Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <Title level={3} className="!mb-0 text-[#111827] !font-bold">
            Báo Cáo &amp; Thống Kê Hoạt Động Tiệm Bánh
          </Title>
          <Text className="text-secondary text-xs mt-1 block">
            Phân tích số liệu tức thời theo khoảng thời gian thực tế so với kỳ trước liền kề
          </Text>
        </div>

        {/* Date Filter, Branch Filter & Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div data-testid="dashboard-branch-filter" className="inline-block">
            <Select
              id="dashboard-branch-select"
              value={selectedBranchId}
              onChange={(val) => {
                setSelectedBranchId(val);
                loadStats(selectedRange, customDates, val);
              }}
              popupMatchSelectWidth={false}
              className="w-full sm:w-80 min-w-[290px] text-xs h-9"
              optionLabelProp="label"
            options={[
              {
                value: 'ALL',
                label: (
                  <span className="flex items-center gap-2 font-semibold text-xs text-[#111827]">
                    <AppstoreOutlined className="text-[#006C49]" />
                    <span>Tất cả chi nhánh (Toàn chuỗi)</span>
                  </span>
                ),
                children: (
                  <div className="flex items-center justify-between py-1 gap-4">
                    <span className="flex items-center gap-2 font-medium text-xs text-[#111827]">
                      <AppstoreOutlined className="text-[#006C49]" />
                      <span>Tất cả chi nhánh (Toàn chuỗi)</span>
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                      Toàn hệ thống
                    </span>
                  </div>
                ),
              },
              ...branches.map((b) => ({
                value: b.id,
                label: (
                  <span className="flex items-center gap-2 font-semibold text-xs text-[#111827]">
                    <ShopOutlined className="text-[#006C49]" />
                    <span>{b.name}</span>
                  </span>
                ),
                children: (
                  <div className="flex items-center justify-between py-1 gap-4">
                    <span className="flex items-center gap-2 font-medium text-xs text-[#111827]">
                      <ShopOutlined className="text-[#006C49]" />
                      <span>{b.name}</span>
                    </span>
                    {b.isMain ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold shrink-0">
                        Trụ sở
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                        {b.code}
                      </span>
                    )}
                  </div>
                ),
              })),
            ]}
            optionRender={(option) => (option.data as any)?.children || option.label}
          />
          </div>

          <Segmented
            options={[
              { label: 'Hôm nay', value: 'today' },
              { label: '7 ngày qua', value: '7days' },
              { label: '30 ngày qua', value: '30days' },
              { label: 'Tùy chọn', value: 'custom' },
            ]}
            value={selectedRange}
            onChange={(val) => setSelectedRange(val as string)}
            className="bg-[#F8F9FA] p-0.5 border border-[#E5E7EB] rounded-lg font-medium text-xs h-9 flex items-center"
          />

          {selectedRange === 'custom' && (
            <RangePicker
              format="DD/MM/YYYY"
              value={customDates}
              onChange={handleCustomRangeChange}
              className="rounded-lg text-xs h-9"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          )}

          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadStats(selectedRange, customDates, selectedBranchId)}
            className="rounded-lg text-xs font-medium h-9 flex items-center"
          >
            Làm mới
          </Button>

          <Button
            type="primary"
            icon={<ShopOutlined />}
            onClick={() => router.push('/pos')}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg text-xs shadow-xs h-9 flex items-center"
          >
            Mở quầy POS
          </Button>
        </div>
      </div>

      {loading && !stats ? (
        <PageLoading description="Đang tổng hợp báo cáo kinh doanh..." />
      ) : stats ? (
        <>
          {/* Top 4 KPI Executive Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Revenue Card */}
            <Card className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-secondary text-xs font-bold uppercase tracking-wider">
                  Doanh thu ({stats.periodLabel})
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006C49] flex items-center justify-center">
                  <DollarOutlined className="text-base" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {stats.todayRevenue.toLocaleString('vi-VN')} ₫
                </div>
                <div className="mt-1 flex items-center text-xs">
                  {stats.revenueGrowth >= 0 ? (
                    <span className="text-[#10B981] font-semibold flex items-center gap-1">
                      <RiseOutlined /> +{stats.revenueGrowth}%
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                      <FallOutlined /> {stats.revenueGrowth}%
                    </span>
                  )}
                  <span className="text-secondary ml-1.5">{stats.previousPeriodLabel}</span>
                </div>
              </div>
            </Card>

            {/* 2. Orders Count Card */}
            <Card className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-secondary text-xs font-bold uppercase tracking-wider">
                  Tổng số đơn hàng
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingOutlined className="text-base" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {stats.todayOrdersCount}{' '}
                  <span className="text-sm font-normal text-secondary">hóa đơn</span>
                </div>
                <div className="mt-1 flex items-center text-xs">
                  {stats.ordersGrowth >= 0 ? (
                    <span className="text-[#10B981] font-semibold flex items-center gap-1">
                      <RiseOutlined /> +{stats.ordersGrowth}%
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                      <FallOutlined /> {stats.ordersGrowth}%
                    </span>
                  )}
                  <span className="text-secondary ml-1.5">{stats.previousPeriodLabel}</span>
                </div>
              </div>
            </Card>

            {/* 3. Average Order Value (AOV) Card */}
            <Card className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-secondary text-xs font-bold uppercase tracking-wider">
                  Giá trị TB / Đơn (AOV)
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <RiseOutlined className="text-base" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {stats.averageOrderValue.toLocaleString('vi-VN')} ₫
                </div>
                <div className="mt-1 text-xs text-secondary">
                  Sức mua trung bình mỗi lượt khách mua hàng
                </div>
              </div>
            </Card>

            {/* 4. Low Stock Inventory Card */}
            <Card
              onClick={() => setActiveTab('inventory-slow')}
              className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-amber-400 cursor-pointer transition-all bg-gradient-to-br from-white to-amber-50/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-secondary text-xs font-bold uppercase tracking-wider">
                  Cảnh báo tồn kho
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <WarningOutlined className="text-base" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-bold font-mono text-amber-600">
                  {stats.lowStockCount}{' '}
                  <span className="text-sm font-normal text-secondary">mặt hàng (≤ 5)</span>
                </div>
                <div className="mt-1 text-xs text-amber-700 font-medium hover:underline">
                  Xem danh sách &amp; nhập hàng ngay →
                </div>
              </div>
            </Card>
          </div>

          {/* Organized Report Tabs */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              className="dashboard-custom-tabs"
              items={[
                {
                  key: 'sales-trends',
                  label: (
                    <span className="flex items-center gap-1.5 font-semibold text-xs px-2">
                      <BarChartOutlined /> Xu hướng Doanh thu &amp; Top Bán chạy
                    </span>
                  ),
                  children: (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                      {/* Left: Revenue Trend Chart */}
                      <div className="lg:col-span-7 bg-[#F8F9FA] p-4 rounded-xl border border-[#E5E7EB]">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-[#006C49]" />
                            <span className="font-bold text-sm text-[#111827]">
                              Biểu Đồ Doanh Thu ({stats.periodLabel})
                            </span>
                          </div>
                          <Tag color="cyan" className="font-mono text-xs">
                            {selectedRange === 'today' ? 'Theo khung giờ 2h' : 'Theo từng ngày'}
                          </Tag>
                        </div>
                        <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.recentSalesChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#585F6C' }} axisLine={false} tickLine={false} />
                              <YAxis
                                tick={{ fontSize: 11, fill: '#585F6C' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                              />
                              <RechartsTooltip
                                formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                                contentStyle={{
                                  backgroundColor: '#fff',
                                  borderRadius: '8px',
                                  border: '1px solid #E5E7EB',
                                  fontSize: '12px',
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10B981"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorRev)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Right: Top 5 Best Selling Products */}
                      <div className="lg:col-span-5 bg-[#F8F9FA] p-4 rounded-xl border border-[#E5E7EB]">
                        <div className="flex items-center gap-2 mb-4">
                          <FireOutlined className="text-amber-500" />
                          <span className="font-bold text-sm text-[#111827]">
                            Top 5 Bánh Bán Chạy Nhất
                          </span>
                        </div>
                        <Table
                          columns={topProductColumns}
                          dataSource={stats.topSellingProducts}
                          rowKey="id"
                          pagination={false}
                          size="small"
                          className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden"
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'payments-categories',
                  label: (
                    <span className="flex items-center gap-1.5 font-semibold text-xs px-2">
                      <PieChartOutlined /> Thanh toán &amp; Danh mục
                    </span>
                  ),
                  children: (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                      {/* 1. Payment Methods Breakdown */}
                      <div className="bg-[#F8F9FA] p-5 rounded-xl border border-[#E5E7EB] space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCardOutlined className="text-[#006C49]" />
                            <span className="font-bold text-sm text-[#111827]">
                              Doanh Thu Theo Phương Thức Thanh Toán
                            </span>
                          </div>
                          <span className="text-xs text-secondary font-mono">Tỷ trọng %</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={stats.paymentMethods}
                                  dataKey="revenue"
                                  nameKey="methodLabel"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={45}
                                  outerRadius={75}
                                  paddingAngle={4}
                                >
                                  {stats.paymentMethods.map((entry) => (
                                    <Cell
                                      key={entry.method}
                                      fill={PAYMENT_COLORS[entry.method] || '#64748B'}
                                    />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="space-y-3 text-xs">
                            {stats.paymentMethods.map((pm) => (
                              <div key={pm.method} className="p-2.5 bg-white rounded-lg border border-[#E5E7EB]">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold flex items-center gap-1.5">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full inline-block"
                                      style={{ backgroundColor: PAYMENT_COLORS[pm.method] || '#64748B' }}
                                    />
                                    {pm.methodLabel}
                                  </span>
                                  <span className="font-bold text-[#006C49] font-mono">
                                    {pm.revenue.toLocaleString('vi-VN')} ₫
                                  </span>
                                </div>
                                <div className="flex justify-between text-secondary text-[11px]">
                                  <span>{pm.count} giao dịch</span>
                                  <span className="font-bold">{pm.percentage}%</span>
                                </div>
                                <Progress
                                  percent={pm.percentage}
                                  showInfo={false}
                                  strokeColor={PAYMENT_COLORS[pm.method] || '#64748B'}
                                  size="small"
                                  className="mt-1"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 2. Category Sales Breakdown */}
                      <div className="bg-[#F8F9FA] p-5 rounded-xl border border-[#E5E7EB] space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShopOutlined className="text-[#006C49]" />
                            <span className="font-bold text-sm text-[#111827]">
                              Doanh Thu Theo Danh Mục Sản Phẩm
                            </span>
                          </div>
                          <span className="text-xs text-secondary font-mono">Phân bổ doanh số</span>
                        </div>

                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={stats.categorySales}
                              layout="vertical"
                              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                              <XAxis
                                type="number"
                                tick={{ fontSize: 10, fill: '#585F6C' }}
                                tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                              />
                              <YAxis
                                type="category"
                                dataKey="category"
                                tick={{ fontSize: 10, fill: '#111827' }}
                                width={120}
                              />
                              <RechartsTooltip
                                formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                              />
                              <Bar dataKey="revenue" fill="#10B981" radius={[0, 6, 6, 0]}>
                                {stats.categorySales.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {stats.categorySales.map((cat, idx) => (
                            <div key={cat.category} className="p-2 bg-white rounded-lg border border-[#E5E7EB] text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-[11px] truncate" title={cat.category}>
                                  <span
                                    className="w-2 h-2 rounded-full inline-block mr-1"
                                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} }
                                  />
                                  {cat.category}
                                </span>
                                <span className="font-mono font-bold text-emerald-800 text-[11px]">
                                  {cat.percentage}%
                                </span>
                              </div>
                              <div className="flex justify-between text-secondary text-[10px] mt-0.5">
                                <span>{cat.soldCount} cái đã bán</span>
                                <span>{cat.revenue.toLocaleString('vi-VN')} ₫</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'staff-performance',
                  label: (
                    <span className="flex items-center gap-1.5 font-semibold text-xs px-2">
                      <TeamOutlined /> Hiệu suất Nhân viên
                    </span>
                  ),
                  children: (
                    <div className="bg-[#F8F9FA] p-5 rounded-xl border border-[#E5E7EB] space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-[#111827] block">
                            Bảng Xếp Hạng Hiệu Suất Bán Hàng Nhân viên
                          </span>
                          <span className="text-xs text-secondary">
                            Đánh giá số lượng hóa đơn xử lý, doanh số mang về và giá trị trung bình mỗi đơn trong khoảng thời gian {stats.periodLabel}
                          </span>
                        </div>
                        <Tag color="purple" className="font-semibold text-xs">
                          {stats.staffPerformances.length} nhân viên
                        </Tag>
                      </div>

                      <Table
                        columns={staffColumns}
                        dataSource={stats.staffPerformances}
                        rowKey="staffId"
                        pagination={false}
                        className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
                      />
                    </div>
                  ),
                },
                {
                  key: 'inventory-slow',
                  label: (
                    <span className="flex items-center gap-1.5 font-semibold text-xs px-2">
                      <WarningOutlined /> Cảnh báo Tồn kho &amp; Hàng chậm bán
                    </span>
                  ),
                  children: (
                    <div className="space-y-6 pt-2">
                      {/* 1. Low Stock Inventory Alert Table */}
                      <div className="bg-[#F8F9FA] p-5 rounded-xl border border-[#E5E7EB] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <WarningOutlined className="text-amber-500" />
                            <span className="font-bold text-sm text-[#111827]">
                              Danh Sách Sản Phẩm Cảnh Báo Tồn Kho (≤ 5 sản phẩm)
                            </span>
                          </div>
                          <Tag color="orange" className="font-semibold text-xs">
                            {stats.lowStockDetails.length} sản phẩm cần nhập thêm
                          </Tag>
                        </div>

                        {stats.lowStockDetails.length === 0 ? (
                          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] text-center">
                            <Empty description="Tất cả sản phẩm đều đang đủ tồn kho an toàn (> 5 cái)" />
                          </div>
                        ) : (
                          <Table
                            columns={lowStockColumns}
                            dataSource={stats.lowStockDetails}
                            rowKey="id"
                            pagination={false}
                            className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
                          />
                        )}
                      </div>

                      {/* 2. Slow Selling / Stagnant Products */}
                      <div className="bg-[#F8F9FA] p-5 rounded-xl border border-[#E5E7EB] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <InboxOutlined className="text-red-500" />
                            <span className="font-bold text-sm text-[#111827]">
                              Sản Phẩm Bán Chậm &amp; Tồn Đọng Trong Kỳ
                            </span>
                          </div>
                          <span className="text-xs text-secondary">
                            Căn cứ đánh giá để tiệm áp dụng combo khuyến mãi hoặc điều chỉnh kế hoạch làm bánh
                          </span>
                        </div>

                        <Table
                          columns={slowProductColumns}
                          dataSource={stats.slowSellingProducts}
                          rowKey="id"
                          pagination={false}
                          className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
