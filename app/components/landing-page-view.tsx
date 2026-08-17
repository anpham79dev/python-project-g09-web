'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Steps,
  Collapse,
  App,
} from 'antd';
import {
  ShopOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  QrcodeOutlined,
  GlobalOutlined,
  StarFilled,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  RocketOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  BranchesOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { LandingPageConfig, DEFAULT_LANDING_CONFIG } from '@/lib/landing-config';
import { getCurrentUser, AuthUser } from '@/lib/auth';

const ICON_MAP: Record<string, React.ReactNode> = {
  ShopOutlined: <ShopOutlined />,
  ShoppingCartOutlined: <ShoppingCartOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  DollarOutlined: <DollarOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  GlobalOutlined: <GlobalOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  BranchesOutlined: <BranchesOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  RocketOutlined: <RocketOutlined />,
};

export interface LandingPageViewProps {
  config?: LandingPageConfig;
  initialUser?: AuthUser | null;
  isPreview?: boolean;
}

export default function LandingPageView({
  config: passedConfig,
  initialUser = null,
  isPreview = false,
}: LandingPageViewProps) {
  const router = useRouter();
  const { message } = App.useApp();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(initialUser);
  const [mounted, setMounted] = useState(false);

  const config = passedConfig || DEFAULT_LANDING_CONFIG;

  useEffect(() => {
    setMounted(true);
    const localUser = getCurrentUser();
    if (localUser) {
      setCurrentUser(localUser);
    } else if (initialUser) {
      setCurrentUser(initialUser);
    }
    if (passedConfig && typeof window !== 'undefined') {
      try {
        localStorage.setItem('artisan_landing_page_config', JSON.stringify(passedConfig));
      } catch {
        // ignore
      }
    }
  }, [passedConfig, initialUser]);

  // Pricing State
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');

  // Tenant Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('growth');
  const [provisioningStep, setProvisioningStep] = useState<number>(0);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [createdTenantData, setCreatedTenantData] = useState<{
    storeName: string;
    subdomain: string;
    adminEmail: string;
    plan: string;
  } | null>(null);

  // Hero Live Subdomain Input
  const [heroSubdomain, setHeroSubdomain] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState<'pos' | 'reports' | 'inventory'>('pos');

  const [form] = Form.useForm();

  // Open modal with specific plan
  const handleOpenRegisterModal = (planId: string = 'growth', defaultSubdomain: string = '') => {
    if (isPreview) {
      message.info(`[Xem Trước] Mở modal đăng ký với gói: ${planId}`);
      return;
    }
    setSelectedPlan(planId);
    setIsRegisterModalOpen(true);
    setProvisioningStep(0);
    setIsProvisioning(false);
    setCreatedTenantData(null);
    form.resetFields();
    const sub = defaultSubdomain ? defaultSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '') : (config.hero.sampleSubdomain || 'mybakery');
    const store = defaultSubdomain ? defaultSubdomain.charAt(0).toUpperCase() + defaultSubdomain.slice(1) + ' Bakery' : (config.brand.name || 'Tiệm Bánh Mẫu');
    form.setFieldsValue({
      plan: planId,
      subdomain: sub,
      storeName: store,
      adminEmail: 'admin@tiembanh.vn',
      adminPhone: '0901888999',
      adminPassword: 'password123',
    });
  };

  // Handle Form Submit -> Simulated Provisioning Pipeline
  const handleRegisterSubmit = async (values: any) => {
    setIsProvisioning(true);
    setProvisioningStep(1);

    await new Promise((resolve) => setTimeout(resolve, 800));
    setProvisioningStep(2);

    await new Promise((resolve) => setTimeout(resolve, 800));
    setProvisioningStep(3);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const tenantInfo = {
      storeName: values.storeName,
      subdomain: values.subdomain.toLowerCase().trim(),
      adminEmail: values.adminEmail,
      plan: values.plan || selectedPlan,
    };

    setCreatedTenantData(tenantInfo);
    setIsProvisioning(false);
    message.success(`Đã khởi tạo thành công hệ thống cho "${tenantInfo.storeName}"!`);
  };

  const navItems = config.nav || DEFAULT_LANDING_CONFIG.nav;
  const featuresList = config.features || DEFAULT_LANDING_CONFIG.features;
  const solutionsList = config.solutions || DEFAULT_LANDING_CONFIG.solutions;
  const pricingPlansList = config.pricingPlans || DEFAULT_LANDING_CONFIG.pricingPlans;
  const testimonialsList = config.testimonials || DEFAULT_LANDING_CONFIG.testimonials;
  const faqsList = config.faqs || DEFAULT_LANDING_CONFIG.faqs;

  return (
    <div className={`min-h-screen bg-[#FDFBF7] text-[#111827] flex flex-col selection:bg-[#10B981] selection:text-white ${isPreview ? 'preview-mode text-[90%]' : ''}`}>
      {/* ==========================================
          1. TOP NAVIGATION BAR
      ========================================== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#006C49] flex items-center justify-center text-white text-base shadow-xs group-hover:bg-[#005237] transition-colors shrink-0">
              <ShopOutlined />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-[#006C49] tracking-tight leading-none">
                {config.brand.name || 'Artisan Bakery'}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Cloud SaaS
              </span>
            </div>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#4B5563]">
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={isPreview ? '#' : item.href}
                onClick={isPreview ? (e) => e.preventDefault() : undefined}
                className="hover:text-[#006C49] transition-colors no-underline"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser && !isPreview ? (
              <Button
                type="primary"
                size="large"
                onClick={() => router.push(currentUser.role === 'STAFF' ? '/pos' : '/dashboard')}
                className="bg-[#006C49] hover:bg-[#005237] text-white font-semibold rounded-xl px-5 h-11 flex items-center gap-2 shadow-xs"
                icon={<RocketOutlined />}
              >
                Vào Hệ Thống ERP ({currentUser.fullName ? currentUser.fullName.split(' ').pop() : 'Quản trị'})
              </Button>
            ) : (
              <>
                <Button
                  size="large"
                  onClick={() => !isPreview && router.push('/login')}
                  className="border-[#D1D5DB] text-[#111827] hover:border-[#10B981] hover:text-[#006C49] font-semibold rounded-xl px-4 sm:px-5 h-11 transition-all"
                >
                  Đăng nhập ERP
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => handleOpenRegisterModal('growth')}
                  className="bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl px-4 sm:px-5 h-11 shadow-xs flex items-center gap-1.5"
                  icon={<ArrowRightOutlined />}
                >
                  Dùng thử miễn phí
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ==========================================
          2. HERO SECTION
      ========================================== */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-white via-[#F4F9F6] to-[#FDFBF7]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block shrink-0" />
            <span>{config.hero.badge || 'Multi-Tenant Architecture 2.0 • Sẵn sàng khởi tạo Subdomain riêng'}</span>
          </div>

          {/* Main Hero Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] tracking-tight leading-[1.15]">
              {config.hero.title || 'Nền Tảng Quản Trị & Bán Hàng Chuyên Biệt Cho Chuỗi Tiệm Bánh'}
            </h1>
            <p className="text-base sm:text-lg text-[#585F6C] max-w-2xl mx-auto font-normal leading-relaxed">
              {config.hero.subtitle || 'Khởi tạo Subdomain độc lập chỉ trong 30 giây. Quản lý đồng bộ POS cảm ứng, VietQR động, Đa kho nguyên liệu, Chốt ca đối soát két và Báo cáo Lãi Lỗ P&L chuẩn xác.'}
            </p>
          </div>

          {/* Subdomain Instant Checker Widget */}
          <div className="max-w-xl mx-auto bg-white p-3 rounded-2xl shadow-md border border-[#E5E7EB] flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center flex-1 w-full px-3 py-2 bg-[#F9FAFB] rounded-xl border border-gray-200 focus-within:border-[#10B981] focus-within:bg-white transition-all">
              <GlobalOutlined className="text-gray-400 mr-2 text-base" />
              <input
                type="text"
                value={heroSubdomain}
                onChange={(e) => setHeroSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder={config.hero.sampleSubdomain || 'la-petite-paris'}
                className="w-full bg-transparent text-sm font-semibold outline-none text-[#111827] placeholder:text-gray-400"
              />
              <span className="text-xs font-bold text-gray-400 shrink-0 ml-1 select-none">
                {config.brand.subdomainSuffix || '.artisan.vn'}
              </span>
            </div>
            <Button
              type="primary"
              size="large"
              onClick={() => handleOpenRegisterModal('growth', heroSubdomain || config.hero.sampleSubdomain || 'mybakery')}
              className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl h-11 px-6 shadow-xs shrink-0 flex items-center justify-center gap-2"
              icon={<RocketOutlined />}
            >
              Khởi tạo ngay
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#585F6C]">
            {(config.hero.checklist || ['14 ngày dùng thử miễn phí', 'Không cần thẻ tín dụng', 'Thiết lập sau 60 giây']).map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <CheckCircleOutlined className="text-[#10B981] text-sm shrink-0" />
                <span>{item}</span>
              </span>
            ))}
          </div>

          {/* Interactive UI Mockup Showcase */}
          <div className="pt-8 max-w-5xl mx-auto scroll-mt-24" id="solutions">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setActivePreviewTab('pos')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                  activePreviewTab === 'pos'
                    ? 'bg-[#006C49] text-white border-[#006C49] shadow-xs'
                    : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                <ShoppingCartOutlined className="text-sm" />
                <span>Màn Hình Bán Hàng POS &amp; VietQR</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('reports')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                  activePreviewTab === 'reports'
                    ? 'bg-[#006C49] text-white border-[#006C49] shadow-xs'
                    : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                <DashboardOutlined className="text-sm" />
                <span>Dashboard Doanh Thu &amp; Sổ Quỹ P&amp;L</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('inventory')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                  activePreviewTab === 'inventory'
                    ? 'bg-[#006C49] text-white border-[#006C49] shadow-xs'
                    : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                <ApartmentOutlined className="text-sm" />
                <span>Quản Trị Đa Chi Nhánh &amp; Đa Kho</span>
              </button>
            </div>

            {/* Mockup Window Frame */}
            <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden">
              <div className="bg-[#F3F4F6] px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="bg-white px-4 py-1 rounded-lg border border-gray-200 text-xs font-mono text-gray-600 flex items-center gap-2 max-w-sm w-full justify-center">
                  <LockOutlined className="text-emerald-600 text-[10px]" />
                  <span>https://tiembanhparis{config.brand.subdomainSuffix || '.artisan.vn'}{activePreviewTab === 'pos' ? '/pos' : activePreviewTab === 'reports' ? '/dashboard' : '/branches'}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Bản Demo Trực Tiếp</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-[#F8F9FA] text-left">
                {activePreviewTab === 'pos' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-[#111827]">Danh Mục Bánh Tươi Nóng (Kho Bán Lẻ Q1)</span>
                        <Tag color="success">11 Món Đang Bán</Tag>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { name: 'Croissant Bơ Pháp', price: '35,000 ₫', stock: 'Còn 20 cái', code: 'CR-01' },
                          { name: 'Pain au Chocolat', price: '42,000 ₫', stock: 'Còn 15 cái', code: 'PC-02' },
                          { name: 'Baguette Truyền Thống', price: '25,000 ₫', stock: 'Còn 30 cái', code: 'BG-03' },
                          { name: 'Bánh Mì Sourdough', price: '65,000 ₫', stock: 'Còn 8 cái', code: 'SD-04' },
                          { name: 'Tiramisu Mascarpone', price: '55,000 ₫', stock: 'Còn 12 phần', code: 'TR-05' },
                          { name: 'Brioche Hoa Cúc', price: '45,000 ₫', stock: 'Còn 18 cái', code: 'BR-06' },
                        ].map((p, i) => (
                          <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-500 transition-all cursor-pointer space-y-1">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006C49] flex items-center justify-center text-xs font-bold font-mono">
                              {p.code}
                            </div>
                            <p className="font-bold text-xs text-[#111827] truncate m-0">{p.name}</p>
                            <p className="font-semibold text-xs text-emerald-700 m-0">{p.price}</p>
                            <span className="text-[10px] text-gray-400 block">{p.stock}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="font-bold text-xs text-gray-700">Đơn hàng #HD-260817-08</span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">Bàn 02</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-medium">
                          <span>2x Croissant Bơ Pháp</span>
                          <span className="font-mono">70,000 ₫</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>1x Tiramisu Ý</span>
                          <span className="font-mono">55,000 ₫</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-100 space-y-1 text-xs">
                        <div className="flex justify-between text-gray-500">
                          <span>Tạm tính</span>
                          <span>125,000 ₫</span>
                        </div>
                        <div className="flex justify-between font-bold text-base text-emerald-700">
                          <span>Tổng cộng</span>
                          <span>125,000 ₫</span>
                        </div>
                      </div>
                      <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center space-y-1">
                        <QrcodeOutlined className="text-2xl text-emerald-700" />
                        <p className="text-[11px] font-bold text-emerald-800 m-0">VietQR Tự Động Tạo Mã</p>
                        <p className="text-[10px] text-emerald-600 m-0">Khách quét là hệ thống tự khớp tiền</p>
                      </div>
                      <Button
                        type="primary"
                        block
                        onClick={() => !isPreview && router.push('/pos')}
                        className="bg-[#10B981] font-bold rounded-lg flex items-center justify-center gap-2"
                        icon={<ArrowRightOutlined />}
                      >
                        Thử trải nghiệm POS thực tế
                      </Button>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'reports' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                        <span className="text-xs text-gray-500">Doanh thu hôm nay</span>
                        <p className="text-lg font-extrabold text-[#111827] m-0">4,409,000 ₫</p>
                        <span className="text-[10px] text-emerald-600 font-semibold">Tăng 18.4% so với hôm qua</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                        <span className="text-xs text-gray-500">Số đơn hoàn tất</span>
                        <p className="text-lg font-extrabold text-[#111827] m-0">31 đơn</p>
                        <span className="text-[10px] text-blue-600 font-semibold">VietQR chiếm 88%</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                        <span className="text-xs text-gray-500">Lợi nhuận gộp P&amp;L</span>
                        <p className="text-lg font-extrabold text-emerald-700 m-0">2,980,000 ₫</p>
                        <span className="text-[10px] text-emerald-600 font-semibold">Tỷ suất gộp 67.5%</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                        <span className="text-xs text-gray-500">Chênh lệch két tiền</span>
                        <p className="text-lg font-extrabold text-emerald-600 m-0">0 ₫</p>
                        <span className="text-[10px] text-emerald-700 font-semibold">Khớp 100% biên bản ca</span>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'inventory' && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-[#111827]">Phân Bổ Tồn Kho Theo Chi Nhánh &amp; Kho Hàng</span>
                        <Tag color="purple">3 Chi Nhánh • 9 Kho Hàng</Tag>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                          <p className="font-bold text-emerald-900 m-0 flex items-center gap-1.5">
                            <ShopOutlined className="text-emerald-700" /> Chi Nhánh Quận 1 (Trụ Sở)
                          </p>
                          <p className="text-gray-500 m-0 mt-1">Kho bán lẻ: 120 bánh | Kho đông lạnh: 350 bánh</p>
                        </div>
                        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                          <p className="font-bold text-blue-900 m-0 flex items-center gap-1.5">
                            <ShopOutlined className="text-blue-700" /> Chi Nhánh Thảo Điền
                          </p>
                          <p className="text-gray-500 m-0 mt-1">Kho bán lẻ: 85 bánh | Kho đông lạnh: 200 bánh</p>
                        </div>
                        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                          <p className="font-bold text-amber-900 m-0 flex items-center gap-1.5">
                            <ShopOutlined className="text-amber-700" /> Chi Nhánh Phú Nhuận
                          </p>
                          <p className="text-gray-500 m-0 mt-1">Kho bán lẻ: 95 bánh | Kho đông lạnh: 180 bánh</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. KEY FEATURES SECTION
      ========================================== */}
      <section id="features" className="py-20 bg-white border-t border-[#E5E7EB] scroll-mt-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006C49] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Giải Pháp Trọn Gói
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
              Mọi Công Cụ Bạn Cần Để Vận Hành Chuỗi Tiệm Bánh
            </h2>
            <p className="text-sm sm:text-base text-[#585F6C]">
              Không còn nỗi lo thất thoát tiền mặt, nhầm lẫn tồn kho hay rối loạn sổ sách kế toán khi mở rộng chi nhánh mới.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-[#E5E7EB] bg-[#FDFBF7] hover:bg-white hover:border-[#10B981] hover:shadow-lg transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shadow-xs text-xl text-emerald-700">
                    {ICON_MAP[f.icon] || <ShopOutlined />}
                  </div>
                  <Tag className="text-[11px] font-semibold text-gray-600 border-none bg-gray-100">
                    {f.id?.toUpperCase() || 'TÍNH NĂNG'}
                  </Tag>
                </div>
                <h3 className="text-lg font-bold text-[#111827]">{f.title}</h3>
                <p className="text-xs text-[#585F6C] leading-relaxed">{f.subtitle || f.description}</p>
                {f.bullets && f.bullets.length > 0 && (
                  <div className="pt-2 space-y-1.5 border-t border-gray-100">
                    {f.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <CheckCircleOutlined className="text-emerald-500 text-xs shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          4. SOLUTIONS SECTION
      ========================================== */}
      {solutionsList && solutionsList.length > 0 && (
        <section className="py-16 bg-[#FDFBF7] border-t border-[#E5E7EB]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006C49] bg-emerald-100 px-3 py-1 rounded-full">
                Giá Trị Cốt Lõi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                Đột Phá Năng Suất Với Quy Trình Chuẩn Hóa
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {solutionsList.map((sol, sIdx) => (
                <div key={sIdx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg">
                    {ICON_MAP[sol.icon] || <CheckCircleOutlined />}
                  </div>
                  <h4 className="font-bold text-sm text-[#111827] m-0">{sol.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed m-0">{sol.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          5. PRICING SECTION
      ========================================== */}
      <section id="pricing" className="py-20 bg-[#F4F9F6] border-t border-[#E5E7EB] scroll-mt-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006C49] bg-emerald-100 px-3 py-1 rounded-full">
              Bảng Giá Thuê Bao Linh Hoạt
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
              Chọn Gói Dịch Vụ Phù Hợp Với Quy Mô Tiệm Bánh
            </h2>
            <p className="text-sm sm:text-base text-[#585F6C]">
              Thanh toán linh hoạt theo tháng hoặc theo năm. Dùng thử trọn gói tính năng 14 ngày không rủi ro.
            </p>

            {/* Billing Switcher Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs sm:text-sm font-semibold ${billingCycle === 'MONTHLY' ? 'text-[#006C49]' : 'text-gray-500'}`}>
                Thanh toán theo tháng
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
                className="w-14 h-7 bg-[#006C49] rounded-full p-1 transition-all cursor-pointer relative"
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-all shadow-xs ${
                    billingCycle === 'YEARLY' ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs sm:text-sm font-semibold ${billingCycle === 'YEARLY' ? 'text-[#006C49]' : 'text-gray-500'}`}>
                  Thanh toán theo năm
                </span>
                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Tiết kiệm 20%
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
            {pricingPlansList.map((plan) => {
              const currentPrice = billingCycle === 'YEARLY' ? (plan.yearlyPrice || Math.round(plan.monthlyPrice * 0.8)) : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-3xl p-8 border transition-all flex flex-col justify-between ${
                    plan.isPopular
                      ? 'border-[#10B981] shadow-xl ring-2 ring-[#10B981]/20 scale-[1.02] z-10'
                      : 'border-[#E5E7EB] shadow-xs hover:border-gray-300'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#006C49] to-[#10B981] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      PHỔ BIẾN NHẤT
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg text-[#111827]">{plan.name}</span>
                        {!plan.isPopular && (
                          <Tag color="blue" className="text-xs font-semibold">
                            TIÊU CHUẨN
                          </Tag>
                        )}
                      </div>
                      <p className="text-xs text-[#585F6C] leading-relaxed min-h-[36px]">{plan.desc}</p>
                    </div>

                    <div className="border-t border-b border-gray-100 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#111827]">
                          {Number(currentPrice || 0).toLocaleString('vi-VN')}
                        </span>
                        <span className="text-xs font-bold text-gray-500">₫ / {plan.period || 'tháng'}</span>
                      </div>
                      {billingCycle === 'YEARLY' && (
                        <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                          Thanh toán hàng năm: {(Number(currentPrice || 0) * 12).toLocaleString('vi-VN')} ₫/năm
                        </span>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 text-xs">
                      <span className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">
                        Tính Năng Bao Gồm:
                      </span>
                      {plan.features?.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <CheckCircleOutlined className="text-[#10B981] text-sm shrink-0 mt-0.5" />
                          <span className="text-gray-700 leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button
                      type={plan.isPopular ? 'primary' : 'default'}
                      size="large"
                      block
                      onClick={() => handleOpenRegisterModal(plan.id)}
                      className={`h-12 rounded-xl font-bold text-sm transition-all ${
                        plan.isPopular
                          ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-xs'
                          : 'border-gray-300 text-gray-800 hover:border-[#10B981] hover:text-[#006C49]'
                      }`}
                    >
                      {plan.buttonText || 'Bắt Đầu Dùng Thử'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          6. SOCIAL PROOF / TESTIMONIALS
      ========================================== */}
      {testimonialsList && testimonialsList.length > 0 && (
        <section id="testimonials" className="py-20 bg-white border-t border-[#E5E7EB] scroll-mt-20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006C49] bg-emerald-50 px-3 py-1 rounded-full">
                Khách Hàng Tin Dùng
              </span>
              <h2 className="text-3xl font-extrabold text-[#111827]">
                Được Lựa Chọn Bởi Hơn 50+ Chuỗi Tiệm Bánh Tại Việt Nam
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonialsList.map((t, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[#FDFBF7] border border-[#E5E7EB] space-y-4">
                  <div className="flex text-amber-400 text-sm gap-1">
                    {[...Array(t.rating || 5)].map((_, s) => (
                      <StarFilled key={s} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="font-bold text-xs text-[#111827] m-0">{t.author}</p>
                    <p className="text-[11px] text-gray-500 m-0">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          7. FAQ SECTION
      ========================================== */}
      {faqsList && faqsList.length > 0 && (
        <section id="faq" className="py-20 bg-[#F4F9F6] border-t border-[#E5E7EB] scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006C49] bg-emerald-100 px-3 py-1 rounded-full">
                Giải Đáp Thắc Mắc
              </span>
              <h2 className="text-3xl font-extrabold text-[#111827]">
                Câu Hỏi Thường Gặp (FAQ)
              </h2>
            </div>

            <Collapse
              accordion
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs"
              items={faqsList.map((faq, fIdx) => ({
                key: String(fIdx + 1),
                label: <span className="font-bold text-sm text-[#111827]">{faq.q}</span>,
                children: (
                  <p className="text-xs text-gray-600 leading-relaxed m-0">
                    {faq.a}
                  </p>
                ),
              }))}
            />
          </div>
        </section>
      )}

      {/* ==========================================
          8. CALL TO ACTION BANNER & FOOTER
      ========================================== */}
      <section className="py-16 bg-gradient-to-r from-[#006C49] to-[#10B981] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Sẵn Sàng Số Hóa &amp; Nâng Tầm Chuỗi Tiệm Bánh Của Bạn?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto">
            Trải nghiệm nền tảng quản trị chuỗi tiệm bánh thế hệ mới. Khởi tạo subdomain độc lập chỉ trong 30 giây.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="large"
              onClick={() => handleOpenRegisterModal('growth')}
              className="bg-white text-[#006C49] hover:bg-emerald-50 border-none font-bold rounded-xl px-8 h-12 text-sm shadow-xs"
            >
              {config.hero.ctaPrimaryText || 'Bắt Đầu Dùng Thử Miễn Phí 14 Ngày'}
            </Button>
            <Button
              size="large"
              onClick={() => !isPreview && router.push('/login')}
              className="bg-transparent text-white border-white hover:bg-white/10 font-semibold rounded-xl px-8 h-12 text-sm"
            >
              Đăng Nhập Vào Hệ Thống ERP
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] text-gray-400 py-12 text-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-800 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center text-white text-base">
              <ShopOutlined />
            </div>
            <div>
              <span className="font-bold text-base text-white block">{config.brand.name || 'Artisan Bakery'} Cloud SaaS</span>
              <span className="text-[11px] text-gray-500">{config.footer.about || 'Hệ thống quản lý chuỗi F&B chuyên nghiệp'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-gray-400">
            {navItems.map((item, nIdx) => (
              <a key={nIdx} href={isPreview ? '#' : item.href} className="hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
            <Link href="/login" className="hover:text-white text-emerald-400 font-semibold transition-colors">
              Đăng Nhập ERP
            </Link>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p className="m-0">{config.footer.copyright || '© 2026 Artisan Bakery Management System. All rights reserved.'}</p>
          <p className="m-0">Hotline: {config.footer.hotline || '1900 6868'} • Email: {config.footer.email || 'hotro@artisanbakery.vn'}</p>
        </div>
      </footer>

      {/* Registration Modal */}
      <Modal
        open={isRegisterModalOpen}
        onCancel={() => {
          if (!isProvisioning) setIsRegisterModalOpen(false);
        }}
        footer={null}
        width={720}
        destroyOnHidden
        className="rounded-3xl overflow-hidden p-0"
      >
        <div className="p-2">
          {!createdTenantData ? (
            <div className="space-y-6">
              <div className="text-center space-y-1.5 pb-2 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl mx-auto shadow-xs">
                  <RocketOutlined />
                </div>
                <h3 className="text-xl font-extrabold text-[#111827] m-0">
                  Đăng Ký &amp; Khởi Tạo Subdomain SaaS
                </h3>
                <p className="text-xs text-[#585F6C] m-0">
                  Nhận 14 ngày dùng thử miễn phí toàn bộ tính năng. Sẵn sàng bán hàng trong 30 giây.
                </p>
              </div>

              {isProvisioning ? (
                <div className="py-12 px-6 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-700 text-2xl">
                    <SettingOutlined className="animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-base text-[#111827] m-0">
                      Đang Khởi Tạo Môi Trường Độc Lập Cho Bạn...
                    </h4>
                    <p className="text-xs text-gray-500 m-0">Vui lòng đợi giây lát, hệ thống đang chuẩn bị cơ sở dữ liệu và bảo mật.</p>
                  </div>
                  <Steps
                    current={provisioningStep - 1}
                    size="small"
                    items={[
                      { title: 'Tạo Database Tenant' },
                      { title: 'Cấp Subdomain & SSL' },
                      { title: 'Thiết Lập Kho & POS' },
                    ]}
                  />
                </div>
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleRegisterSubmit}
                  initialValues={{
                    plan: selectedPlan,
                    subdomain: 'mybakery',
                    storeName: 'Tiệm Bánh Ngọt Ngào',
                  }}
                  requiredMark="optional"
                >
                  <div className="space-y-4">
                    <Form.Item
                      name="storeName"
                      label={<span className="font-bold text-xs uppercase text-gray-700">Tên Thương Hiệu Tiệm Bánh</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập tên tiệm bánh!' }]}
                    >
                      <Input
                        prefix={<ShopOutlined className="text-gray-400 mr-1" />}
                        placeholder="Ví dụ: Artisan Bakery Thảo Điền"
                        size="large"
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      name="subdomain"
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-xs uppercase text-gray-700">Subdomain Riêng Biệt</span>
                          <span className="text-[11px] text-emerald-600 font-semibold">Miễn phí chứng chỉ SSL</span>
                        </div>
                      }
                      rules={[
                        { required: true, message: 'Vui lòng chọn subdomain!' },
                        { pattern: /^[a-z0-9-]+$/, message: 'Subdomain chỉ gồm chữ thường không dấu, số và dấu gạch ngang!' },
                      ]}
                    >
                      <Input
                        addonBefore="https://"
                        addonAfter={config.brand.subdomainSuffix || '.artisan.vn'}
                        placeholder="ten-tiem-banh"
                        size="large"
                        className="rounded-xl font-mono text-sm"
                      />
                    </Form.Item>

                    <Form.Item
                      name="plan"
                      label={<span className="font-bold text-xs uppercase text-gray-700">Gói Thuê Bao Đăng Ký</span>}
                    >
                      <Select
                        size="large"
                        className="rounded-xl"
                        options={pricingPlansList.map((p) => ({
                          label: `${p.name} - ${Number(p.monthlyPrice || 0).toLocaleString('vi-VN')} ₫/tháng`,
                          value: p.id,
                        }))}
                      />
                    </Form.Item>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        name="adminEmail"
                        label={<span className="font-bold text-xs uppercase text-gray-700">Email Quản Trị Viên</span>}
                        rules={[
                          { required: true, message: 'Vui lòng nhập email!' },
                          { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                        initialValue="admin@tiembanh.vn"
                      >
                        <Input
                          prefix={<MailOutlined className="text-gray-400 mr-1" />}
                          placeholder="chuquan@gmail.com"
                          size="large"
                          className="rounded-xl"
                        />
                      </Form.Item>

                      <Form.Item
                        name="adminPhone"
                        label={<span className="font-bold text-xs uppercase text-gray-700">Số Điện Thoại</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        initialValue="0901888999"
                      >
                        <Input
                          prefix={<PhoneOutlined className="text-gray-400 mr-1" />}
                          placeholder="0912345678"
                          size="large"
                          className="rounded-xl"
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="adminPassword"
                      label={<span className="font-bold text-xs uppercase text-gray-700">Mật Khẩu Quản Trị</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                      initialValue="password123"
                    >
                      <Input.Password
                        prefix={<LockOutlined className="text-gray-400 mr-1" />}
                        size="large"
                        className="rounded-xl"
                      />
                    </Form.Item>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                    <Button size="large" onClick={() => setIsRegisterModalOpen(false)} className="rounded-xl">
                      Hủy bỏ
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl px-8"
                    >
                      Xác Nhận &amp; Khởi Tạo Hệ Thống
                    </Button>
                  </div>
                </Form>
              )}
            </div>
          ) : (
            <div className="py-6 px-4 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006C49] text-3xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircleOutlined />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-extrabold text-[#111827] m-0">
                  Khởi Tạo Thành Công!
                </h3>
                <p className="text-xs text-gray-500">
                  Hệ thống SaaS của <strong>{createdTenantData.storeName}</strong> đã sẵn sàng hoạt động.
                </p>
              </div>

              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-[#E5E7EB] text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500">Địa chỉ Subdomain:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    https://{createdTenantData.subdomain}{config.brand.subdomainSuffix || '.artisan.vn'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Gói thuê bao:</span>
                  <Tag color="green" className="font-bold">
                    {createdTenantData.plan} (14 Ngày Dùng Thử)
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tài khoản quản trị:</span>
                  <span className="font-semibold text-gray-800">admin</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mật khẩu mặc định:</span>
                  <span className="font-mono font-semibold text-gray-800">password123</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => {
                    setIsRegisterModalOpen(false);
                    router.push('/login');
                  }}
                  className="bg-[#006C49] hover:bg-[#005237] text-white font-bold h-12 rounded-xl text-sm shadow-xs flex items-center justify-center gap-2"
                  icon={<ArrowRightOutlined />}
                >
                  Đăng Nhập Vào Hệ Thống ERP Ngay
                </Button>
                <Button
                  block
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="rounded-xl text-xs text-gray-600"
                >
                  Đóng cửa sổ
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
