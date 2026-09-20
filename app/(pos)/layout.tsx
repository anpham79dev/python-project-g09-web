'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spin, Button, Typography } from 'antd';
import {
  ShopOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  DashboardOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { getCurrentUser, clearAuthSession, AuthUser, canAccessRoute, hasPermission } from '@/lib/auth';
import { getCurrentShift, getBranches } from '@/lib/api';
import { WorkShift, Branch } from '@/lib/types';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentShift, setCurrentShift] = useState<WorkShift | null>(null);
  const [branchName, setBranchName] = useState<string>('Chi nhánh chính');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    // Guard phân quyền PBAC cho /pos
    if (!user) {
      router.replace('/login?reason=unauthenticated');
      return;
    }
    if (!canAccessRoute('/pos', user)) {
      router.replace('/dashboard?reason=forbidden');
      return;
    }

    setMounted(true);

    const refreshShift = () => {
      getCurrentShift()
        .then((shift) => {
          setCurrentShift(shift || null);
        })
        .catch(() => setCurrentShift(null));
    };

    refreshShift();

    // Lấy thông tin chi nhánh đang hoạt động
    getBranches()
      .then((branches) => {
        const storedBranchId = typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : null;
        const targetId = storedBranchId || user.lastActiveBranchId || user.defaultBranchId;
        const found = branches.find((b) => b.id === targetId);
        if (found) {
          setBranchName(found.name);
        } else if (user.defaultBranchName) {
          setBranchName(user.defaultBranchName);
        } else if (branches.length > 0) {
          setBranchName(branches[0].name);
        }
      })
      .catch(() => {
        if (user.defaultBranchName) {
          setBranchName(user.defaultBranchName);
        }
      });

    const handleBranchChange = (e: any) => {
      const branchId = e.detail;
      getBranches().then((branches) => {
        const found = branches.find((b) => b.id === branchId);
        if (found) setBranchName(found.name);
      }).catch(() => {});
    };

    const handleShiftChange = () => {
      refreshShift();
    };

    window.addEventListener('artisan_branch_changed', handleBranchChange);
    window.addEventListener('artisan_shift_changed', handleShiftChange);

    return () => {
      window.removeEventListener('artisan_branch_changed', handleBranchChange);
      window.removeEventListener('artisan_shift_changed', handleShiftChange);
    };
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = '/login';
  };

  if (!mounted || !currentUser) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <Spin size="large" description="Đang tải giao diện thu ngân..." />
      </div>
    );
  }

  const canAccessErp = currentUser.role === 'SUPER_ADMIN' || hasPermission(currentUser, 'dashboard:view');

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F8F9FA] overflow-hidden select-none">
      {/* 3. Thanh trên cùng của POS (tự viết, gọn, một hàng) */}
      <header className="h-12 bg-white border-b border-[#E5E7EB] px-4 flex items-center justify-between shrink-0 z-30">
        {/* Trái: Logo nhỏ + Tên chi nhánh đang bán */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#006C49] text-white flex items-center justify-center font-bold text-xs font-serif shadow-xs">
              A
            </div>
            <span className="font-bold text-sm text-[#006C49] hidden sm:inline">
              Artisan Bakery
            </span>
          </div>

          <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
            <ShopOutlined className="text-[#006C49] text-xs" />
            <span className="font-medium max-w-[200px] truncate">{branchName}</span>
          </div>
        </div>

        {/* Giữa / Phải: Ca làm việc hiện tại (MỘT thông tin duy nhất) & Hành động */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {currentShift ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ClockCircleOutlined className="text-[#006C49]" />
              <span className="font-semibold">{currentShift.shiftName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <ClockCircleOutlined className="text-amber-600" />
              <span className="font-semibold">Chưa mở ca</span>
            </div>
          )}

          {/* Nút "Về trang quản trị" dẫn tới /dashboard (chỉ hiện với vai trò được phép vào ERP) */}
          {canAccessErp && (
            <Link href="/dashboard">
              <Button
                type="text"
                size="small"
                icon={<DashboardOutlined />}
                className="text-xs font-medium text-gray-700 hover:text-[#006C49] hover:bg-gray-100 h-8 flex items-center"
              >
                <span className="hidden md:inline">Về trang quản trị</span>
              </Button>
            </Link>
          )}

          <div className="h-4 w-[1px] bg-gray-200" />

          {/* Tên người đăng nhập & Nút đăng xuất */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
              <UserOutlined className="text-gray-400" />
              <span className="max-w-[120px] truncate">{currentUser.fullName}</span>
            </div>

            <Button
              type="text"
              danger
              size="small"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              title="Đăng xuất"
              className="text-xs h-8 flex items-center hover:bg-red-50"
            >
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Nội dung trang POS */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
