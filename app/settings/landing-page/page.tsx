'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Switch,
  Select,
  Typography,
  Tag,
  App,
  Spin,
  Popconfirm,
  Space,
  Divider,
  Avatar,
  Tooltip,
} from 'antd';
import {
  GlobalOutlined,
  SaveOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShopOutlined,
  RocketOutlined,
  AppstoreOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  BranchesOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import LandingPageView from '@/app/components/landing-page-view';
import {
  getAdminLandingPageConfig,
  updateAdminLandingPageConfig,
  resetAdminLandingPageConfig,
} from '@/lib/api';
import {
  LandingPageConfig,
  DEFAULT_LANDING_CONFIG,
} from '@/lib/landing-config';
import { getCurrentUser, AuthUser, hasPermission } from '@/lib/auth';

const { Title, Text } = Typography;

const ICON_OPTIONS = [
  { label: 'Shop (Cửa hàng)', value: 'ShopOutlined' },
  { label: 'ShoppingCart (Giỏ hàng)', value: 'ShoppingCartOutlined' },
  { label: 'Dashboard (Tổng quan)', value: 'DashboardOutlined' },
  { label: 'Appstore (Kho & Danh mục)', value: 'AppstoreOutlined' },
  { label: 'Dollar (Tiền & Sổ quỹ)', value: 'DollarOutlined' },
  { label: 'Clock (Ca làm việc)', value: 'ClockCircleOutlined' },
  { label: 'Safety (Bảo mật / Phân quyền)', value: 'SafetyCertificateOutlined' },
  { label: 'Global (Đa doanh nghiệp)', value: 'GlobalOutlined' },
  { label: 'Thunderbolt (Tốc độ)', value: 'ThunderboltOutlined' },
  { label: 'LineChart (Báo cáo P&L)', value: 'LineChartOutlined' },
  { label: 'Branches (Chuỗi chi nhánh)', value: 'BranchesOutlined' },
];

const SECTIONS = [
  { key: 'brand', icon: <ShopOutlined className="text-lg" />, label: 'Thương Hiệu & Chung' },
  { key: 'hero', icon: <RocketOutlined className="text-lg" />, label: 'Hero Section' },
  { key: 'features', icon: <AppstoreOutlined className="text-lg" />, label: 'Tính Năng Nổi Bật' },
  { key: 'pricing', icon: <DollarOutlined className="text-lg" />, label: 'Bảng Giá & Gói Thuê Bao' },
  { key: 'footer', icon: <SafetyCertificateOutlined className="text-lg" />, label: 'Chân Trang & Liên Hệ' },
];

const SECTION_TITLES: Record<string, string> = {
  brand: 'Thương Hiệu & Chung',
  hero: 'Hero Section',
  features: 'Tính Năng Nổi Bật',
  pricing: 'Bảng Giá & Gói Thuê Bao',
  footer: 'Chân Trang & Liên Hệ',
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  brand: 'Tên thương hiệu, khẩu hiệu, logo và hậu tố tên miền mặc định.',
  hero: 'Tiêu đề chính, đoạn mô tả ngắn, nút kêu gọi và danh sách cam kết đầu trang.',
  features: 'Danh mục các tính năng nổi bật giúp khách hàng hiểu giá trị nền tảng.',
  pricing: 'Các gói dịch vụ theo tháng/năm, tính năng đi kèm và nút đăng ký.',
  footer: 'Mô tả tóm tắt doanh nghiệp, thông tin liên hệ, hotline, email và bản quyền.',
};

export default function LandingPageCMSPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [activeSection, setActiveSection] = useState<string>('brand');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');
  const [liveConfig, setLiveConfig] = useState<LandingPageConfig>(DEFAULT_LANDING_CONFIG);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (!user) {
      router.replace('/login?reason=unauthenticated');
      return;
    }
    if (!hasPermission(user, 'landing_page:edit') && user.role !== 'SUPER_ADMIN') {
      const fallback = hasPermission(user, 'dashboard:view') ? '/dashboard' : '/pos';
      router.replace(`${fallback}?reason=forbidden`);
      return;
    }

    // Load CMS Config
    getAdminLandingPageConfig()
      .then((data) => {
        const initial = data || DEFAULT_LANDING_CONFIG;
        setLiveConfig(initial);
        setLoading(false);
      })
      .catch(() => {
        message.error('Không thể tải cấu hình Landing Page từ máy chủ!');
        setLiveConfig(DEFAULT_LANDING_CONFIG);
        setLoading(false);
      });
  }, [router, message]);

  // Handle Form changes to update Live Preview real-time
  const handleValuesChange = (_: any, allValues: any) => {
    setLiveConfig((prev) => ({
      ...prev,
      brand: allValues.brand ? { ...prev.brand, ...allValues.brand } : prev.brand,
      hero: allValues.hero ? { ...prev.hero, ...allValues.hero } : prev.hero,
      footer: allValues.footer ? { ...prev.footer, ...allValues.footer } : prev.footer,
      features: allValues.features ? allValues.features : prev.features,
      pricingPlans: allValues.pricingPlans ? allValues.pricingPlans : prev.pricingPlans,
    }));
  };

  // Save & Publish
  const handleSaveAndPublish = async () => {
    try {
      setSaving(true);
      const formValues = form.getFieldsValue(true);
      const payload: LandingPageConfig = {
        ...DEFAULT_LANDING_CONFIG,
        ...liveConfig,
        brand: {
          ...DEFAULT_LANDING_CONFIG.brand,
          ...liveConfig.brand,
          ...(formValues.brand || {}),
        },
        hero: {
          ...DEFAULT_LANDING_CONFIG.hero,
          ...liveConfig.hero,
          ...(formValues.hero || {}),
        },
        footer: {
          ...DEFAULT_LANDING_CONFIG.footer,
          ...liveConfig.footer,
          ...(formValues.footer || {}),
        },
        features: formValues.features || liveConfig.features || DEFAULT_LANDING_CONFIG.features,
        pricingPlans: formValues.pricingPlans || liveConfig.pricingPlans || DEFAULT_LANDING_CONFIG.pricingPlans,
        nav: liveConfig.nav || DEFAULT_LANDING_CONFIG.nav,
        solutions: liveConfig.solutions || DEFAULT_LANDING_CONFIG.solutions,
        testimonials: liveConfig.testimonials || DEFAULT_LANDING_CONFIG.testimonials,
        faqs: liveConfig.faqs || DEFAULT_LANDING_CONFIG.faqs,
      };

      const updated = await updateAdminLandingPageConfig(payload);
      setLiveConfig(updated);
      form.setFieldsValue(updated);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('artisan_landing_page_config', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      router.refresh();
      message.success('Đã lưu & xuất bản nội dung Landing Page thành công!');
    } catch (err: any) {
      console.error('Error saving CMS configuration:', err);
      message.error(err.response?.data?.detail || 'Có lỗi xảy ra khi lưu cấu hình Landing Page!');
    } finally {
      setSaving(false);
    }
  };

  // Reset to Default
  const handleResetDefault = async () => {
    setResetting(true);
    try {
      const def = await resetAdminLandingPageConfig();
      setLiveConfig(def);
      form.setFieldsValue(def);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('artisan_landing_page_config', JSON.stringify(def));
        } catch {
          // ignore
        }
      }
      router.refresh();
      message.success('Đã khôi phục toàn bộ nội dung Landing Page về mặc định ban đầu!');
    } catch {
      message.error('Lỗi khi khôi phục dữ liệu mặc định!');
    } finally {
      setResetting(false);
    }
  };

  const sectionKeys = ['brand', 'hero', 'features', 'pricing', 'footer'];
  const currentIndex = sectionKeys.indexOf(activeSection);
  const nextSectionKey = currentIndex < sectionKeys.length - 1 ? sectionKeys[currentIndex + 1] : null;
  const prevSectionKey = currentIndex > 0 ? sectionKeys[currentIndex - 1] : null;

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F3F4F6]">
        <Spin description="Đang nạp dữ liệu CMS Quản trị Landing Page..." size="large" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F3F4F6] text-[#111827]">
      {/* ========================================================================= */}
      {/* 1. LEFT PANE: ULTRA-SLIM ICON RAIL (~60px)                                */}
      {/* ========================================================================= */}
      <aside className="w-[60px] h-full bg-white border-r border-[#E5E7EB] flex flex-col justify-between items-center py-3 shrink-0 shadow-xs z-20">
        {/* Top: Return to Operations Button & Section Navigation Icons */}
        <div className="flex flex-col items-center w-full gap-2">
          {/* Back to Operations Dashboard Button */}
          <Tooltip title="← Quay lại Quản trị (/dashboard)" placement="right">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:text-[#006C49] hover:bg-emerald-50 transition-all cursor-pointer border border-transparent hover:border-emerald-200"
              aria-label="Quay lại Quản trị"
            >
              <ArrowLeftOutlined className="text-base" />
            </button>
          </Tooltip>

          <div className="w-8 h-[1px] bg-[#E5E7EB] my-1" />

          {/* Section Navigation Icon Buttons */}
          <div className="flex flex-col items-center gap-2.5 w-full px-2">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.key;
              return (
                <Tooltip key={sec.key} title={sec.label} placement="right">
                  <button
                    type="button"
                    onClick={() => setActiveSection(sec.key)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-[#E6F4EA] text-[#006C49] font-bold shadow-xs border border-emerald-300'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    aria-label={sec.label}
                  >
                    {sec.icon}
                    {isActive && (
                      <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#006C49] rounded-r-full" />
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Bottom: SuperAdmin User Profile Avatar */}
        <div className="flex flex-col items-center gap-2 pt-2 border-t border-gray-200 w-full px-2">
          <Tooltip title={`SuperAdmin: ${currentUser?.fullName || 'Tổng Quản Trị Hệ Thống'}`} placement="right">
            <Avatar className="bg-purple-600 text-white font-bold text-xs cursor-pointer ring-2 ring-purple-200" size="small">
              {currentUser?.fullName?.charAt(0) || 'S'}
            </Avatar>
          </Tooltip>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: TOP ACTION BAR + FORM EDITOR & LIVE PREVIEW             */}
      {/* ========================================================================= */}
      <div className="flex-1 h-full flex flex-col bg-[#F3F4F6] min-w-0 overflow-hidden">
        {/* Top Header Action Bar */}
        <header className="h-14 px-5 bg-white border-b border-[#E5E7EB] flex items-center justify-between shrink-0 shadow-2xs z-10">
          {/* Left: Studio Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#006C49] text-white flex items-center justify-center text-sm shadow-xs shrink-0 font-bold">
              <GlobalOutlined />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#111827] leading-tight m-0">
                Quản Trị Nội Dung Landing Page (CMS)
              </span>
              <Tag color="purple" className="!text-[9px] !m-0 !px-1.5 !py-0 font-bold uppercase">
                SUPER_ADMIN
              </Tag>
              <Tag color="success" className="!text-[9px] !m-0 !px-1.5 !py-0 font-medium">
                Live Sync
              </Tag>
            </div>
          </div>

          {/* Right: Device Viewport Tools & Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Viewport Mode Switcher */}
            <div className="hidden md:flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all ${
                  viewportMode === 'desktop'
                    ? 'bg-white text-[#006C49] shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('laptop')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all ${
                  viewportMode === 'laptop'
                    ? 'bg-white text-[#006C49] shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Laptop (85%)
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('tablet')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all ${
                  viewportMode === 'tablet'
                    ? 'bg-white text-[#006C49] shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tablet
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all ${
                  viewportMode === 'mobile'
                    ? 'bg-white text-[#006C49] shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mobile
              </button>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-[#006C49] hover:text-[#059669] font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors no-underline"
            >
              <GlobalOutlined /> <span>Trang chủ ↗</span>
            </a>

            <div className="h-6 w-[1px] bg-gray-200 hidden sm:block" />

            {/* Action Buttons: Reset Default & Save/Publish */}
            <Space size={8}>
              <Popconfirm
                title="Khôi phục nội dung mặc định?"
                description="Toàn bộ nội dung landing page sẽ được khôi phục về cấu hình gốc ban đầu."
                onConfirm={handleResetDefault}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: resetting }}
                placement="bottomRight"
              >
                <Button
                  icon={<ReloadOutlined />}
                  loading={resetting}
                  className="rounded-lg border-gray-300 font-medium text-xs h-9 text-gray-700 hover:!text-red-600 cursor-pointer"
                >
                  Khôi phục mặc định
                </Button>
              </Popconfirm>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSaveAndPublish}
                className="!bg-[#006C49] hover:!bg-[#059669] text-white font-bold h-9 px-4 sm:px-5 rounded-lg shadow-xs cursor-pointer"
              >
                Lưu & Xuất Bản
              </Button>
            </Space>
          </div>
        </header>

        {/* Content Area: Form Editor + Live Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* ========================================================================= */}
          {/* 3. MIDDLE PANE: ACTIVE SECTION FORM EDITOR (~35% Width)                   */}
          {/* ========================================================================= */}
          <section className="w-full lg:w-[36%] xl:w-[34%] min-w-[360px] max-w-[480px] h-full bg-white border-r border-[#E5E7EB] flex flex-col shrink-0 min-w-0 shadow-2xs z-10">
            {/* Form Header with Prominent Section Title */}
            <div className="h-14 px-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#006C49] flex items-center justify-center text-sm shrink-0">
                  {activeSection === 'brand' && <ShopOutlined />}
                  {activeSection === 'hero' && <RocketOutlined />}
                  {activeSection === 'features' && <AppstoreOutlined />}
                  {activeSection === 'pricing' && <DollarOutlined />}
                  {activeSection === 'footer' && <SafetyCertificateOutlined />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs sm:text-sm font-bold text-[#111827] leading-tight truncate m-0">
                    {SECTION_TITLES[activeSection]}
                  </h2>
                  <p className="text-[10px] text-[#585F6C] leading-tight truncate m-0">
                    {SECTION_DESCRIPTIONS[activeSection]}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                initialValues={liveConfig}
              >
                {/* 1. THƯƠNG HIỆU & CHUNG */}
                <div className={activeSection === 'brand' ? 'block space-y-4' : 'hidden'}>
                  <Form.Item
                    name={['brand', 'name']}
                    label={<span className="font-semibold text-xs text-gray-700">Tên Nền Tảng / Thương Hiệu</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu!' }]}
                  >
                    <Input placeholder="Ví dụ: Artisan Bakery" size="large" className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    name={['brand', 'tagline']}
                    label={<span className="font-semibold text-xs text-gray-700">Khẩu Hiệu / Tagline</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập khẩu hiệu!' }]}
                  >
                    <Input placeholder="Ví dụ: Nền Tảng Quản Trị & Bán Hàng Chuyên Biệt Cho Chuỗi Tiệm Bánh" size="large" className="rounded-lg" />
                  </Form.Item>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                      name={['brand', 'logoUrl']}
                      label={<span className="font-semibold text-xs text-gray-700">Đường Dẫn Logo (URL)</span>}
                    >
                      <Input placeholder="/emerald_bakery_logo.png" size="large" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      name={['brand', 'subdomainSuffix']}
                      label={<span className="font-semibold text-xs text-gray-700">Đuôi Subdomain Mặc Định</span>}
                    >
                      <Input placeholder=".artisan.vn" size="large" className="rounded-lg font-mono" />
                    </Form.Item>
                  </div>
                </div>

                {/* 2. HERO SECTION */}
                <div className={activeSection === 'hero' ? 'block space-y-4' : 'hidden'}>
                  <Form.Item
                    name={['hero', 'badge']}
                    label={<span className="font-semibold text-xs text-gray-700">Badge Thông Báo Nổi Bật (Header Pill)</span>}
                  >
                    <Input placeholder="GIẢI PHÁP ERP CHUYÊN SÂU F&B" size="large" className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    name={['hero', 'title']}
                    label={<span className="font-semibold text-xs text-gray-700">Tiêu Đề Chính (H1 Headline)</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề chính!' }]}
                  >
                    <Input.TextArea rows={2} placeholder="Nền Tảng Quản Trị & Bán Hàng Chuyên Biệt Cho Chuỗi Tiệm Bánh" className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    name={['hero', 'subtitle']}
                    label={<span className="font-semibold text-xs text-gray-700">Đoạn Mô Tả Phụ (Hero Subtitle)</span>}
                  >
                    <Input.TextArea rows={3} placeholder="Đột phá doanh thu với hệ thống POS đa kênh..." className="rounded-lg" />
                  </Form.Item>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                      name={['hero', 'ctaPrimaryText']}
                      label={<span className="font-semibold text-xs text-gray-700">Nút Kêu Gọi Chính (CTA 1)</span>}
                    >
                      <Input placeholder="Khởi Tạo Dùng Thử 14 Ngày" size="large" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      name={['hero', 'sampleSubdomain']}
                      label={<span className="font-semibold text-xs text-gray-700">Gợi Ý Subdomain Mẫu</span>}
                    >
                      <Input placeholder="la-petite-paris" size="large" className="rounded-lg font-mono" />
                    </Form.Item>
                  </div>

                  <Divider plain className="!my-2 !text-xs !text-gray-400">Danh Sách Cam Kết Dưới Nút (Checklist)</Divider>
                  <Form.List name={['hero', 'checklist']}>
                    {(fields, { add, remove }) => (
                      <div className="space-y-2">
                        {fields.map((field, index) => (
                          <div key={field.key} className="flex items-center gap-2">
                            <Form.Item name={field.name} className="!mb-0 flex-1">
                              <Input placeholder={`Cam kết ${index + 1}`} className="rounded-lg" />
                            </Form.Item>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(field.name)}
                            />
                          </div>
                        ))}
                        <Button
                          type="dashed"
                          onClick={() => add('')}
                          block
                          icon={<PlusOutlined />}
                          className="rounded-lg"
                        >
                          Thêm Dòng Cam Kết
                        </Button>
                      </div>
                    )}
                  </Form.List>
                </div>

                {/* 3. TÍNH NĂNG NỔI BẬT */}
                <div className={activeSection === 'features' ? 'block space-y-4' : 'hidden'}>
                  <Form.List name="features">
                    {(fields, { add, remove }) => (
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <Card
                            key={field.key}
                            size="small"
                            className="border border-gray-200 rounded-xl bg-gray-50/50 shadow-xs"
                            title={<span className="font-bold text-xs text-emerald-800">Tính Năng #{index + 1}</span>}
                            extra={
                              fields.length > 1 && (
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(field.name)}
                                >
                                  Xóa
                                </Button>
                              )
                            }
                          >
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Form.Item
                                  name={[field.name, 'title']}
                                  label={<span className="text-xs font-semibold text-gray-700">Tiêu Đề Tính Năng</span>}
                                  rules={[{ required: true, message: 'Nhập tiêu đề!' }]}
                                  className="!mb-0"
                                >
                                  <Input placeholder="Quầy POS Bán Hàng..." className="rounded-lg" />
                                </Form.Item>

                                <Form.Item
                                  name={[field.name, 'icon']}
                                  label={<span className="text-xs font-semibold text-gray-700">Biểu Tượng (Icon)</span>}
                                  className="!mb-0"
                                >
                                  <Select options={ICON_OPTIONS} className="rounded-lg" />
                                </Form.Item>
                              </div>

                              <Form.Item
                                name={[field.name, 'subtitle']}
                                label={<span className="text-xs font-semibold text-gray-700">Mô Tả Ngắn</span>}
                                className="!mb-0"
                              >
                                <Input.TextArea rows={2} placeholder="Tóm tắt ngắn gọn giá trị tính năng..." className="rounded-lg" />
                              </Form.Item>
                            </div>
                          </Card>
                        ))}

                        <Button
                          type="dashed"
                          onClick={() =>
                            add({
                              id: `feat-${Date.now()}`,
                              title: 'Tính Năng Mới',
                              subtitle: 'Mô tả tính năng chuyên sâu...',
                              description: 'Chi tiết tính năng...',
                              icon: 'ShopOutlined',
                              bullets: ['Điểm nổi bật 1', 'Điểm nổi bật 2'],
                            })
                          }
                          block
                          icon={<PlusOutlined />}
                          className="rounded-lg"
                        >
                          Thêm Khối Tính Năng
                        </Button>
                      </div>
                    )}
                  </Form.List>
                </div>

                {/* 4. BẢNG GIÁ & GÓI THUÊ BAO */}
                <div className={activeSection === 'pricing' ? 'block space-y-4' : 'hidden'}>
                  <Form.List name="pricingPlans">
                    {(fields, { add, remove }) => (
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <Card
                            key={field.key}
                            size="small"
                            className="border border-gray-200 rounded-xl bg-gray-50/50 shadow-xs"
                            title={<span className="font-bold text-xs text-emerald-800">Gói Dịch Vụ #{index + 1}</span>}
                            extra={
                              <div className="flex items-center gap-2">
                                <Form.Item name={[field.name, 'isPopular']} valuePropName="checked" className="!mb-0">
                                  <Switch checkedChildren="Hot / Phổ biến" unCheckedChildren="Bình thường" />
                                </Form.Item>
                                {fields.length > 1 && (
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(field.name)}
                                  >
                                    Xóa
                                  </Button>
                                )}
                              </div>
                            }
                          >
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Form.Item
                                  name={[field.name, 'name']}
                                  label={<span className="text-xs font-semibold text-gray-700">Tên Gói Thuê Bao</span>}
                                  rules={[{ required: true, message: 'Nhập tên gói!' }]}
                                  className="!mb-0"
                                >
                                  <Input placeholder="Khởi Nghiệp (Starter)" className="rounded-lg" />
                                </Form.Item>

                                <Form.Item
                                  name={[field.name, 'monthlyPrice']}
                                  label={<span className="text-xs font-semibold text-gray-700">Giá Theo Tháng (VNĐ)</span>}
                                  rules={[{ required: true, message: 'Nhập giá tháng!' }]}
                                  className="!mb-0"
                                >
                                  <InputNumber
                                    min={0}
                                    step={10000}
                                    className="!w-full rounded-lg"
                                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  />
                                </Form.Item>

                                <Form.Item
                                  name={[field.name, 'yearlyPrice']}
                                  label={<span className="text-xs font-semibold text-gray-700">Giá Theo Năm (VNĐ/tháng)</span>}
                                  className="!mb-0"
                                >
                                  <InputNumber
                                    min={0}
                                    step={10000}
                                    className="!w-full rounded-lg"
                                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  />
                                </Form.Item>
                              </div>

                              <Form.Item
                                name={[field.name, 'desc']}
                                label={<span className="text-xs font-semibold text-gray-700">Đối Tượng Phù Hợp (Mô tả)</span>}
                                className="!mb-0"
                              >
                                <Input placeholder="Dành cho tiệm bánh đơn lẻ..." className="rounded-lg" />
                              </Form.Item>

                              <Form.Item
                                name={[field.name, 'buttonText']}
                                label={<span className="text-xs font-semibold text-gray-700">Nút Kêu Gọi (Button CTA)</span>}
                                className="!mb-0"
                              >
                                <Input placeholder="Bắt Đầu Dùng Thử" className="rounded-lg" />
                              </Form.Item>

                              <Divider plain className="!my-2 !text-xs !text-gray-400">Danh Sách Tính Năng Đi Kèm Gói</Divider>
                              <Form.List name={[field.name, 'features']}>
                                {(featFields, { add: addFeat, remove: removeFeat }) => (
                                  <div className="space-y-2">
                                    {featFields.map((fField, fIdx) => (
                                      <div key={fField.key} className="flex items-center gap-2">
                                        <Form.Item name={fField.name} className="!mb-0 flex-1">
                                          <Input placeholder={`Tính năng ${fIdx + 1}`} className="rounded-lg text-xs" />
                                        </Form.Item>
                                        <Button
                                          type="text"
                                          danger
                                          size="small"
                                          icon={<DeleteOutlined />}
                                          onClick={() => removeFeat(fField.name)}
                                        />
                                      </div>
                                    ))}
                                    <Button
                                      type="dashed"
                                      size="small"
                                      onClick={() => addFeat('')}
                                      block
                                      icon={<PlusOutlined />}
                                      className="rounded-lg text-xs"
                                    >
                                      Thêm Dòng Quyền Lợi
                                    </Button>
                                  </div>
                                )}
                              </Form.List>
                            </div>
                          </Card>
                        ))}

                        <Button
                          type="dashed"
                          onClick={() =>
                            add({
                              id: `plan-${Date.now()}`,
                              name: 'Gói Mới',
                              monthlyPrice: 599000,
                              yearlyPrice: 479000,
                              period: 'tháng',
                              desc: 'Dành cho tiệm bánh...',
                              isPopular: false,
                              features: ['Tính năng 1', 'Tính năng 2'],
                              buttonText: 'Đăng Ký Gói',
                            })
                          }
                          block
                          icon={<PlusOutlined />}
                          className="rounded-lg"
                        >
                          Thêm Gói Thuê Bao Mới
                        </Button>
                      </div>
                    )}
                  </Form.List>
                </div>

                {/* 5. THÔNG TIN LIÊN HỆ & FOOTER */}
                <div className={activeSection === 'footer' ? 'block space-y-4' : 'hidden'}>
                  <Form.Item
                    name={['footer', 'about']}
                    label={<span className="font-semibold text-xs text-gray-700">Mô Tả Giới Thiệu Ngắn Ở Chân Trang</span>}
                  >
                    <Input.TextArea rows={2} placeholder="Hệ thống quản trị và vận hành chuyên sâu..." className="rounded-lg" />
                  </Form.Item>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                      name={['footer', 'hotline']}
                      label={<span className="font-semibold text-xs text-gray-700">Số Hotline Hỗ Trợ</span>}
                    >
                      <Input placeholder="1900 6868" size="large" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      name={['footer', 'email']}
                      label={<span className="font-semibold text-xs text-gray-700">Email Hỗ Trợ</span>}
                    >
                      <Input placeholder="hotro@artisanbakery.vn" size="large" className="rounded-lg" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name={['footer', 'address']}
                    label={<span className="font-semibold text-xs text-gray-700">Địa Chỉ Văn Phòng</span>}
                  >
                    <Input placeholder="Tòa nhà Innovation Hub, Quận 1, TP. Hồ Chí Minh" size="large" className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    name={['footer', 'copyright']}
                    label={<span className="font-semibold text-xs text-gray-700">Dòng Bản Quyền (Copyright)</span>}
                  >
                    <Input placeholder="© 2026 Artisan Bakery SaaS Platform. Bản quyền thuộc về..." size="large" className="rounded-lg" />
                  </Form.Item>
                </div>
              </Form>
            </div>

            {/* Section Navigation Helper Footer */}
            <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between shrink-0">
              {prevSectionKey ? (
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setActiveSection(prevSectionKey)}
                  className="text-xs text-gray-600 hover:text-[#006C49] font-medium"
                >
                  {SECTION_TITLES[prevSectionKey]}
                </Button>
              ) : <div />}

              {nextSectionKey ? (
                <Button
                  type="primary"
                  size="small"
                  ghost
                  onClick={() => setActiveSection(nextSectionKey)}
                  className="text-xs font-semibold !border-[#006C49] !text-[#006C49] hover:!bg-emerald-50 flex items-center gap-1"
                >
                  <span>Mục tiếp theo: {SECTION_TITLES[nextSectionKey]}</span>
                  <ArrowRightOutlined />
                </Button>
              ) : <div />}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 4. RIGHT PANE: REAL-TIME LIVE PREVIEW CANVAS (~65% Width)                 */}
          {/* ========================================================================= */}
          <main className="flex-1 h-full flex flex-col bg-[#F3F4F6] min-w-0 overflow-hidden">
            {/* Preview Frame Container */}
            <div className="flex-1 overflow-hidden p-3 sm:p-4 flex items-center justify-center">
              <div
                className={`h-full bg-white rounded-xl shadow-lg border border-[#E5E7EB] flex flex-col overflow-hidden transition-all duration-300 ${
                  viewportMode === 'desktop'
                    ? 'w-full'
                    : viewportMode === 'laptop'
                    ? 'w-full max-w-[1300px]'
                    : viewportMode === 'tablet'
                    ? 'w-[768px] max-w-full'
                    : 'w-[390px] max-w-full'
                }`}
              >
                {/* Browser Header Mockup Bar */}
                <div className="h-8 bg-gray-100 border-b border-gray-200 px-3 flex items-center justify-between shrink-0 select-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="bg-white px-3 py-0.5 rounded-md border border-gray-200 text-[11px] text-gray-500 font-mono flex items-center gap-1.5 shadow-2xs max-w-md truncate">
                    <span className="text-emerald-600 text-xs">🔒</span>
                    <span className="truncate">https://{liveConfig.brand?.name ? liveConfig.brand.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'artisan'}{liveConfig.brand?.subdomainSuffix || '.artisan.vn'}</span>
                  </div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    {viewportMode.toUpperCase()}
                  </div>
                </div>

                {/* Scrollable Viewport Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FDFBF7] scroll-smooth">
                  <div className={viewportMode === 'laptop' ? 'w-[118%] origin-top-left scale-[0.85]' : 'w-full'}>
                    <LandingPageView config={liveConfig} isPreview={true} />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
