'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ConfigProvider,
  App,
  Dropdown,
  MenuProps,
  Spin,
  Layout,
  Menu,
  Button,
  Tooltip,
  Avatar,
  Tag,
  Typography,
} from 'antd';
import {
  ShopOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  DownOutlined,
  DollarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BranchesOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { getCurrentUser, clearAuthSession, AuthUser, hasPermission, canAccessRoute, hasAdminAccess, isSuperAdmin } from '@/lib/auth';
import { getBranches, updateUserActiveBranch } from '@/lib/api';
import { Branch } from '@/lib/mock-data';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const ROUTE_TO_SUBMENU: Record<string, string> = {
  '/pos': 'sub_sales',
  '/orders': 'sub_orders',
  '/shifts': 'sub_orders',
  '/products': 'sub_inventory',
  '/branches': 'sub_inventory',
  '/dashboard': 'sub_admin',
  '/accounting': 'sub_admin',
  '/users': 'sub_admin',
  '/settings': 'sub_system',
  '/settings/roles': 'sub_system',
};

const ALL_SUBMENU_KEYS = ['sub_sales', 'sub_orders', 'sub_inventory', 'sub_admin', 'sub_system'];

const antdTheme = {
  token: {
    colorPrimary: '#006C49',
    colorPrimaryHover: '#059669',
    colorPrimaryActive: '#047857',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ba1a1a',
    colorInfo: '#3b82f6',
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8f9fa',
    colorBorder: '#e5e7eb',
    colorText: '#111827',
    colorTextSecondary: '#585f6c',
    borderRadius: 8,
    fontFamily: 'var(--font-vietnam), "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 38,
      fontWeight: 500,
    },
    Table: {
      headerBg: '#f8f9fa',
      headerColor: '#585f6c',
      borderColor: '#e5e7eb',
      rowHoverBg: '#f9fafb',
    },
    Card: {
      borderRadiusLG: 12,
    },
    Tag: {
      borderRadiusSM: 9999,
    },
    Menu: {
      itemSelectedBg: '#E6F4EA',
      itemSelectedColor: '#006C49',
      itemHoverColor: '#006C49',
      itemHoverBg: '#F4FBF7',
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemHeight: 40,
      subMenuItemBg: '#ffffff',
      iconSize: 16,
    },
  },
};

/**
 * Component lắng nghe search params để hiển thị thông báo Toast khi bị chặn truy cập
 */
function AuthReasonNotifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { message } = App.useApp();
  const notifiedReasonRef = useRef<string | null>(null);

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (!reason || notifiedReasonRef.current === reason) return;

    notifiedReasonRef.current = reason;

    if (reason === 'unauthenticated') {
      message.warning('Vui lòng đăng nhập để tiếp tục');
    } else if (reason === 'forbidden') {
      message.warning('Bạn không có quyền truy cập trang này');
    }

    // Xóa param `reason` khỏi URL mà không trigger reload trang
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('reason');
    const newQuery = newParams.toString() ? `?${newParams.toString()}` : '';
    router.replace(`${pathname}${newQuery}`);
  }, [searchParams, pathname, router, message]);

  return null;
}

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { message } = App.useApp();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [mounted, setMounted] = useState(false);

  // Sidebar Collapsible State - Lưu trạng thái vào localStorage
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // SubMenu Collapsible Groups State - Lưu trạng thái các nhóm đang mở
  const [openKeys, setOpenKeys] = useState<string[]>(ALL_SUBMENU_KEYS);

  const isPublicPage = pathname === '/login';

  // Xác định SubMenu cha của route hiện tại
  const currentSubmenu = Object.entries(ROUTE_TO_SUBMENU).find(([route]) =>
    pathname === route || pathname?.startsWith(`${route}/`)
  )?.[1];

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setMounted(true);

    // Khởi tạo trạng thái thu gọn sidebar từ localStorage
    if (typeof window !== 'undefined') {
      const savedCollapsed = localStorage.getItem('artisan_sidebar_collapsed');
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === 'true');
      }

      const savedOpenKeys = localStorage.getItem('artisan_sidebar_open_keys');
      if (savedOpenKeys) {
        try {
          const parsed = JSON.parse(savedOpenKeys);
          if (Array.isArray(parsed)) {
            if (currentSubmenu && !parsed.includes(currentSubmenu)) {
              setOpenKeys([...parsed, currentSubmenu]);
            } else {
              setOpenKeys(parsed);
            }
            // Handled
          }
        } catch (e) {
          setOpenKeys(ALL_SUBMENU_KEYS);
        }
      } else {
        setOpenKeys(ALL_SUBMENU_KEYS);
      }
    }

    // Fetch branches for branch switcher when logged in
    if (user) {
      getBranches()
        .then((list) => {
          setBranches(list);
          if (list.length > 0) {
            if (user?.role === 'STAFF' && user?.defaultBranchId) {
              const userBranch = list.find((b) => b.id === user.defaultBranchId) || list[0];
              setSelectedBranch(userBranch);
              if (typeof window !== 'undefined') {
                localStorage.setItem('artisan_active_branch_id', userBranch.id);
              }
            } else {
              const storedBranchId = typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : null;
              if (storedBranchId === 'ALL') {
                setSelectedBranch({ id: 'ALL', name: 'Tất cả chi nhánh (Toàn chuỗi)' } as any);
              } else {
                const targetBranchId = storedBranchId || user?.lastActiveBranchId || user?.defaultBranchId;
                const matched = list.find((b) => b.id === targetBranchId) || list[0];
                setSelectedBranch(matched);
                if (typeof window !== 'undefined' && matched) {
                  localStorage.setItem('artisan_active_branch_id', matched.id);
                }
              }
            }
          }
        })
        .catch(() => {});
    }

    const handleGlobalBranchChange = (e: any) => {
      const branchId = e.detail;
      if (branchId === 'ALL') {
        setSelectedBranch({ id: 'ALL', name: 'Tất cả chi nhánh (Toàn chuỗi)' } as any);
      } else if (branchId) {
        getBranches().then((bList) => {
          const found = bList.find((b) => b.id === branchId);
          if (found) setSelectedBranch(found);
        });
      }
    };
    window.addEventListener('artisan_branch_changed', handleGlobalBranchChange);

    // Client-Side Auth & PBAC Guard
    if (!user && !isPublicPage) {
      router.replace('/login?reason=unauthenticated');
    } else if (user && pathname === '/login') {
      if (hasPermission(user, 'dashboard:view') || user.role === 'SUPER_ADMIN') {
        router.replace('/dashboard');
      } else {
        router.replace('/pos');
      }
    } else if (user && !isPublicPage && !canAccessRoute(pathname, user)) {
      const fallback = hasPermission(user, 'dashboard:view') || user.role === 'SUPER_ADMIN' ? '/dashboard' : '/pos';
      router.replace(`${fallback}?reason=forbidden`);
    }

    return () => {
      window.removeEventListener('artisan_branch_changed', handleGlobalBranchChange);
    };
  }, [pathname, router, isPublicPage, currentSubmenu]);

  // Luôn đảm bảo SubMenu chứa route hiện tại được mở sẵn khi chuyển route
  useEffect(() => {
    if (currentSubmenu && !collapsed) {
      setOpenKeys((prev) => {
        if (!prev.includes(currentSubmenu)) {
          const updated = [...prev, currentSubmenu];
          if (typeof window !== 'undefined') {
            localStorage.setItem('artisan_sidebar_open_keys', JSON.stringify(updated));
          }
          return updated;
        }
        return prev;
      });
    }
  }, [currentSubmenu, collapsed]);

  const toggleSidebar = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('artisan_sidebar_collapsed', String(nextState));
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
    if (typeof window !== 'undefined') {
      localStorage.setItem('artisan_sidebar_open_keys', JSON.stringify(keys));
    }
  };

  const handleBranchChange = (branch: Branch) => {
    setSelectedBranch(branch);
    if (typeof window !== 'undefined') {
      localStorage.setItem('artisan_active_branch_id', branch.id);
      window.dispatchEvent(new CustomEvent('artisan_branch_changed', { detail: branch.id }));
    }
    // Ghi nhớ chi nhánh vào DB người dùng
    updateUserActiveBranch(branch.id).catch(() => {});
    message.info(`Đã chọn chi nhánh: ${branch.name}`);
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    router.replace('/login');
  };

  // Xác định quyền render nội dung trang
  const isAuthorized = isPublicPage || (currentUser && canAccessRoute(pathname, currentUser));

  // Xác định Active Menu Key
  const getActiveKey = () => {
    if (!pathname) return '/dashboard';
    if (pathname.startsWith('/settings/roles')) return '/settings/roles';
    if (pathname === '/pos') return '/pos';
    if (pathname.startsWith('/products')) return '/products';
    if (pathname.startsWith('/branches')) return '/branches';
    if (pathname.startsWith('/orders')) return '/orders';
    if (pathname.startsWith('/shifts')) return '/shifts';
    if (pathname.startsWith('/dashboard')) return '/dashboard';
    if (pathname.startsWith('/accounting')) return '/accounting';
    if (pathname.startsWith('/users')) return '/users';
    if (pathname.startsWith('/settings')) return '/settings';
    return pathname;
  };

  const activeKey = getActiveKey();

  // Menu Dropdown Profile
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="py-1">
          <p className="font-semibold text-[#111827] m-0">{currentUser?.fullName || 'Người dùng'}</p>
          <p className="text-xs text-[#585F6C] m-0">
            @{currentUser?.username} • {
              currentUser?.role === 'SUPER_ADMIN'
                ? 'Tổng Quản Trị Hệ Thống'
                : currentUser?.roleName || (currentUser?.role === 'ADMIN' ? 'Quản trị viên' : 'Thu ngân')
            }
          </p>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-red-600 font-medium">Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  // Menu Dropdown Chi Nhánh
  const branchMenuItems: MenuProps['items'] = [
    {
      key: 'ALL',
      label: (
        <div className="py-1 min-w-[220px]">
          <p className="font-semibold text-xs text-[#006C49] m-0">Tất cả chi nhánh (Toàn chuỗi)</p>
          <p className="text-[10px] text-[#585F6C] m-0">Xem tổng hợp số liệu toàn bộ hệ thống</p>
        </div>
      ),
      onClick: () => handleBranchChange({ id: 'ALL', name: 'Tất cả chi nhánh (Toàn chuỗi)' } as any),
    },
    {
      type: 'divider',
    },
    ...branches.map((b) => ({
      key: b.id,
      label: (
        <div className="flex items-center justify-between gap-4 py-1 min-w-[220px]">
          <div>
            <p className="font-semibold text-xs text-[#111827] m-0">{b.name}</p>
            <p className="text-[10px] text-[#585F6C] m-0">{b.address}</p>
          </div>
          {b.isMain && (
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
              Trụ sở
            </span>
          )}
        </div>
      ),
      onClick: () => handleBranchChange(b),
    })),
  ];

  // Cấu trúc Sidebar Collapsible SubMenu Items phân nhóm & phân quyền động (PBAC)
  const salesChildren = [
    hasPermission(currentUser, 'pos:access') && {
      key: '/pos',
      icon: <ShoppingOutlined />,
      label: 'Quầy Bán Hàng (POS)',
    },
  ].filter(Boolean) as MenuProps['items'];

  const ordersChildren = [
    hasPermission(currentUser, 'orders:read') && {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: 'Lịch Sử Hóa Đơn',
    },
    hasPermission(currentUser, 'shifts:read') && {
      key: '/shifts',
      icon: <ClockCircleOutlined />,
      label: 'Quản Lý Ca & Két',
    },
  ].filter(Boolean) as MenuProps['items'];

  const inventoryChildren = [
    hasPermission(currentUser, 'products:write') && {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: 'Danh Mục Sản Phẩm',
    },
    hasPermission(currentUser, 'branches:read') && {
      key: '/branches',
      icon: <ShopOutlined />,
      label: 'Chi Nhánh & Đa Kho',
    },
  ].filter(Boolean) as MenuProps['items'];

  const adminChildren = [
    hasPermission(currentUser, 'dashboard:view') && {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Báo Cáo Doanh Thu',
    },
    hasPermission(currentUser, 'accounting:read') && {
      key: '/accounting',
      icon: <DollarOutlined />,
      label: 'Sổ Quỹ & Lãi Lỗ P&L',
    },
    hasPermission(currentUser, 'users:read') && {
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Quản Lý Nhân Sự',
    },
  ].filter(Boolean) as MenuProps['items'];

  const systemChildren = [
    hasPermission(currentUser, 'settings:manage') && {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Cài Đặt Cửa Hàng',
    },
    hasPermission(currentUser, 'roles:manage') && {
      key: '/settings/roles',
      icon: <SafetyCertificateOutlined />,
      label: 'Phân Quyền Vai Trò',
    },
  ].filter(Boolean) as MenuProps['items'];

  const siderMenuItems: MenuProps['items'] = [
    salesChildren && salesChildren.length > 0 && {
      key: 'sub_sales',
      icon: <ShoppingOutlined className="text-base" />,
      label: 'Bán Hàng (POS)',
      children: salesChildren,
    },
    ordersChildren && ordersChildren.length > 0 && {
      key: 'sub_orders',
      icon: <FileTextOutlined className="text-base" />,
      label: 'Đơn Hàng & Ca Làm',
      children: ordersChildren,
    },
    inventoryChildren && inventoryChildren.length > 0 && {
      key: 'sub_inventory',
      icon: <AppstoreOutlined className="text-base" />,
      label: 'Sản Phẩm & Kho Hàng',
      children: inventoryChildren,
    },
    adminChildren && adminChildren.length > 0 && {
      key: 'sub_admin',
      icon: <DashboardOutlined className="text-base" />,
      label: 'Quản Trị & Tài Chính',
      children: adminChildren,
    },
    systemChildren && systemChildren.length > 0 && {
      key: 'sub_system',
      icon: <SettingOutlined className="text-base" />,
      label: 'Cài Đặt Hệ Thống',
      children: systemChildren,
    },
  ].filter(Boolean) as MenuProps['items'];

  // Nếu là trang Public (ví dụ Login) -> Không hiển thị Sider ERP
  if (isPublicPage) {
    return (
      <>
        <Suspense fallback={null}>
          <AuthReasonNotifier />
        </Suspense>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </>
    );
  }

  return (
    <Layout className="min-h-screen bg-[#F8F9FA]">
      {/* Toast Notifier for Auth Blocking */}
      <Suspense fallback={null}>
        <AuthReasonNotifier />
      </Suspense>

      {/* 1. COLLAPSIBLE LEFT SIDEBAR WITH COLLAPSIBLE SUBMENU GROUPS */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(val) => {
          setCollapsed(val);
          if (typeof window !== 'undefined') {
            localStorage.setItem('artisan_sidebar_collapsed', String(val));
          }
        }}
        trigger={null}
        width={260}
        collapsedWidth={80}
        className="!bg-white border-r border-[#E5E7EB] z-30 flex flex-col shadow-xs"
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Top: Logo & Brand */}
          <div>
            <div className={`h-16 flex items-center border-b border-[#E5E7EB] px-4 transition-all ${collapsed ? 'justify-center' : 'justify-between'}`}>
              <Link
                href={currentUser?.role === 'STAFF' ? '/pos' : '/dashboard'}
                className="flex items-center gap-3 no-underline overflow-hidden"
              >
                <div className="w-9 h-9 rounded-xl bg-[#006C49] flex items-center justify-center text-white text-base font-bold shadow-xs shrink-0">
                  <ShopOutlined />
                </div>
                {!collapsed && (
                  <div className="overflow-hidden whitespace-nowrap">
                    <span className="font-bold text-base text-[#006C49] tracking-tight block leading-tight">
                      Artisan Bakery
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#585F6C] block">
                      Quản Lý Tiệm Bánh
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Menu Items Container with Collapsible SubMenus */}
            <div className="py-2 overflow-y-auto max-h-[calc(100vh-140px)]">
              <Menu
                mode="inline"
                selectedKeys={[activeKey]}
                openKeys={!collapsed ? openKeys : undefined}
                onOpenChange={handleOpenChange}
                items={siderMenuItems}
                onClick={({ key }) => {
                  if (key.startsWith('/')) {
                    router.push(key);
                  }
                }}
                className="border-r-0 !bg-transparent font-medium"
              />
            </div>
          </div>

          {/* Bottom: User Card & Collapse Trigger */}
          <div className="p-3 border-t border-[#E5E7EB] bg-[#FAFAFA]">
            {!collapsed ? (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="bg-[#006C49] text-white font-bold shrink-0">
                    {currentUser?.fullName?.charAt(0) || 'U'}
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#111827] truncate m-0 leading-tight">
                      {currentUser?.fullName || 'Người dùng'}
                    </p>
                    <p className="text-[10px] text-[#585F6C] truncate m-0 leading-tight mt-0.5">
                      {currentUser?.role === 'ADMIN' ? 'Quản trị viên' : 'Thu ngân'}
                    </p>
                  </div>
                </div>
                <Tooltip title="Thu gọn menu">
                  <Button
                    type="text"
                    size="small"
                    icon={<MenuFoldOutlined className="text-gray-500" />}
                    onClick={toggleSidebar}
                    className="hover:bg-gray-100"
                  />
                </Tooltip>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Tooltip title="Mở rộng menu" placement="right">
                  <Button
                    type="text"
                    icon={<MenuUnfoldOutlined className="text-gray-500 text-base" />}
                    onClick={toggleSidebar}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200"
                  />
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </Sider>

      {/* 2. RIGHT MAIN VIEWPORT */}
      <Layout className="flex-1 flex flex-col bg-[#F8F9FA] min-w-0">
        {/* Refined ERP Topbar */}
        <Header className="!h-16 !bg-white !leading-none !p-0 border-b border-[#E5E7EB] sticky top-0 z-20 shadow-2xs">
          <div className="max-w-[1600px] w-full mx-auto px-6 h-full flex items-center justify-between">
            {/* Left: Collapse Toggle Button & Branch Selector */}
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined className="text-base text-gray-700" /> : <MenuFoldOutlined className="text-base text-gray-700" />}
                onClick={toggleSidebar}
                className="hover:bg-[#F3F4F5] w-9 h-9 flex items-center justify-center rounded-lg"
              />

              {/* Branch Selector Dropdown */}
              {currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || hasPermission(currentUser, 'branches:read') ? (
                <Dropdown menu={{ items: branchMenuItems }} placement="bottomLeft" arrow trigger={['click']}>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F5] transition-all bg-white cursor-pointer text-left">
                    <ShopOutlined className="text-[#006C49] text-xs" />
                    <div>
                      <span className="text-[10px] text-[#585F6C] block leading-none">Chi nhánh làm việc</span>
                      <span className="text-xs font-semibold text-[#111827] max-w-44 truncate block">
                        {selectedBranch?.name || 'Chọn chi nhánh'}
                      </span>
                    </div>
                    <DownOutlined className="text-[10px] text-secondary ml-1" />
                  </button>
                </Dropdown>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-100 bg-emerald-50/60 text-left">
                  <ShopOutlined className="text-[#006C49] text-xs" />
                  <div>
                    <span className="text-[10px] text-[#585F6C] block leading-none">Chi nhánh phân công</span>
                    <span className="text-xs font-semibold text-[#111827] max-w-44 truncate block">
                      {currentUser?.defaultBranchName || selectedBranch?.name || 'Chi nhánh mặc định'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Shift Status & User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ClockCircleOutlined className="text-emerald-600" />
                <span>Ca: 07:00 - 15:00</span>
              </div>

              {currentUser && (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow trigger={['click']}>
                  <button className="flex items-center gap-2.5 p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F5] transition-all bg-white cursor-pointer">
                    <Avatar className="w-7 h-7 bg-[#10B981]/15 text-[#006C49] flex items-center justify-center font-bold text-xs">
                      {currentUser.fullName.charAt(0)}
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-semibold text-[#111827] m-0 leading-tight">{currentUser.fullName}</p>
                      <p className="text-[10px] text-[#585F6C] m-0 leading-tight">
                        {currentUser.role === 'ADMIN' ? 'Quản trị' : 'Thu ngân'}
                      </p>
                    </div>
                  </button>
                </Dropdown>
              )}
            </div>
          </div>
        </Header>

        {/* 3. CONTENT AREA */}
        <Content className="flex-1 flex flex-col bg-[#F8F9FA] min-w-0 overflow-y-auto">
          {isPublicPage || (mounted && isAuthorized) ? (
            children
          ) : (
            <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
              <Spin size="large" description="Đang kiểm tra quyền truy cập..." />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={antdTheme}>
      <App className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111827]">
        <ClientLayoutInner>{children}</ClientLayoutInner>
      </App>
    </ConfigProvider>
  );
}
