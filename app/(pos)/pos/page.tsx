'use client';

import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Tag,
  Modal,
  Empty,
  Spin,
  Badge,
  InputNumber,
  Space,
  App,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { getProducts, createOrder, getCurrentShift, closeCurrentShift, openShift, getCurrentSchedule, getBranches, getSystemSettings } from '@/lib/api';
import { Product, CATEGORIES, Order, WorkShift, ShiftScheduleResponse, Branch } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';

const { Title, Text } = Typography;

interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Component hiển thị ảnh sản phẩm kèm fallback icon bánh xám khi ảnh bị lỗi (onError)
 */
function ProductImage({ src }: { src: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F3F4F6] text-gray-400">
        <ShopOutlined className="text-2xl mb-1 text-gray-300" />
        <span className="text-[10px] text-gray-400 font-medium">Artisan Bakery</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setHasError(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
    />
  );
}

export default function POSPage() {
  const { message } = App.useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Shift State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeBranchName, setActiveBranchName] = useState<string>('Chi nhánh');
  const [currentShift, setCurrentShift] = useState<WorkShift | null>(null);
  const [currentSchedule, setCurrentSchedule] = useState<ShiftScheduleResponse | null>(null);
  const [shiftChecking, setShiftChecking] = useState(true);
  const [openShiftCash, setOpenShiftCash] = useState<number>(500000);
  const [openShiftNote, setOpenShiftNote] = useState('');
  const [openingShift, setOpeningShift] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [shiftNote, setShiftNote] = useState('');
  const [closingShift, setClosingShift] = useState(false);
  const [closedShiftToPrint, setClosedShiftToPrint] = useState<WorkShift | null>(null);

  // Cart state - Mặc định thanh toán bằng TIỀN MẶT
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QR_TRANSFER' | 'CARD'>('CASH');
  const [submitting, setSubmitting] = useState(false);

  // Success Modal
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchProductList = async () => {
    setLoading(true);
    try {
      const activeBranchId = typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : null;
      const params = activeBranchId && activeBranchId !== 'ALL' ? { branchId: activeBranchId } : undefined;
      const data = await getProducts(params);
      setProducts(data);
    } catch (err) {
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchShift = async () => {
    try {
      const [shift, sched] = await Promise.all([
        getCurrentShift().catch(() => null),
        getCurrentSchedule().catch(() => null),
      ]);
      setCurrentShift(shift || null);
      if (sched) {
        setCurrentSchedule(sched);
        if (!shift) {
          setOpenShiftCash(sched.defaultInitialCash || 500000);
        }
      }
      if (shift) {
        setActualCashInput(shift.expectedCash);
      }
    } finally {
      setShiftChecking(false);
    }
  };

  const [allowNegativeStock, setAllowNegativeStock] = useState(false);

  const fetchSettings = async () => {
    try {
      const st = await getSystemSettings();
      if (st && typeof st.allowNegativeStock === 'boolean') {
        setAllowNegativeStock(st.allowNegativeStock);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    getBranches().then((branches) => {
      const activeBranchId = typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : null;
      const targetId = activeBranchId || user?.lastActiveBranchId || user?.defaultBranchId;
      const b = branches.find((item) => item.id === targetId);
      if (b) setActiveBranchName(b.name);
    }).catch(() => {});

    fetchSettings();
    fetchProductList();
    fetchShift();

    const handleBranchChange = () => {
      fetchSettings();
      fetchProductList();
      fetchShift();
      setCart([]);
    };
    window.addEventListener('artisan_branch_changed', handleBranchChange);
    return () => window.removeEventListener('artisan_branch_changed', handleBranchChange);
  }, []);

  const handleOpenShift = async () => {
    setOpeningShift(true);
    try {
      const activeBranchId = typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : undefined;
      const branchId = activeBranchId && activeBranchId !== 'ALL' ? activeBranchId : undefined;
      const shift = await openShift({
        initialCash: openShiftCash,
        branchId,
        note: openShiftNote.trim() || undefined,
      });
      setCurrentShift(shift);
      setActualCashInput(shift.expectedCash);
      message.success('Mở ca làm việc thành công! Bắt đầu phiên bán hàng.');
      window.dispatchEvent(new CustomEvent('artisan_shift_changed'));
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.message || 'Lỗi khi mở ca');
    } finally {
      setOpeningShift(false);
    }
  };

  const handleOpenShiftModal = async () => {
    try {
      const shift = await getCurrentShift();
      if (shift) {
        setCurrentShift(shift);
        setActualCashInput(shift.expectedCash);
        setShowShiftModal(true);
      } else {
        setCurrentShift(null);
        message.warning('Chưa có ca làm việc nào đang mở!');
      }
    } catch (err: any) {
      message.error('Không thể tải thông tin ca làm việc');
    }
  };

  const handleConfirmCloseShift = async () => {
    if (!currentShift) return;
    setClosingShift(true);
    try {
      const closed = await closeCurrentShift({
        actualCash: actualCashInput,
        note: shiftNote || undefined,
      });
      message.success('Kết ca làm việc thành công!');
      setShowShiftModal(false);
      setClosedShiftToPrint(closed);
      setTimeout(() => {
        window.print();
      }, 300);
      setCurrentShift(null);
      clearCart();
      window.dispatchEvent(new CustomEvent('artisan_shift_changed'));
      fetchShift();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.message || 'Lỗi khi kết ca');
    } finally {
      setClosingShift(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Tất cả' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  // Cart Actions
  const addToCart = (product: Product) => {
    if (!allowNegativeStock && product.stock <= 0) {
      message.warning(`Sản phẩm "${product.name}" hiện đã hết hàng!`);
      return;
    }

    const inCart = cart.find((item) => item.product.id === product.id);
    if (!allowNegativeStock && inCart && inCart.quantity >= product.stock) {
      message.warning(`Số lượng đã đạt giới hạn tồn kho (${product.stock})`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (!allowNegativeStock && existing.quantity >= product.stock) {
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!allowNegativeStock && product && newQuantity > product.stock) {
      message.warning(`Tồn kho chỉ còn ${product.stock} sản phẩm`);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const nextCart = prevCart.filter((item) => item.product.id !== productId);
      if (nextCart.length === 0) {
        setDiscount(0);
      }
      return nextCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNote('');
    setDiscount(0);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - discount);

  // Auto reset or cap discount when cart changes
  useEffect(() => {
    if (cart.length === 0) {
      if (discount !== 0) setDiscount(0);
    } else if (discount > subtotal) {
      setDiscount(subtotal);
    }
  }, [cart.length, subtotal, discount]);

  // Submit Order
  const handleCheckout = async () => {
    if (cart.length === 0) {
      message.warning('Giỏ hàng đang trống! Vui lòng chọn món.');
      return;
    }

    const currentUser = getCurrentUser();
    const activeBranchId = typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : undefined;
    setSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim() || 'Khách vãng lai',
        customerPhone: customerPhone.trim() || undefined,
        branchId: activeBranchId || undefined,
        staffId: currentUser?.id || 'user-002',
        staffName: currentUser?.fullName || 'Thu Ngân',
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
          image: item.product.image,
        })),
        subtotal,
        discount,
        totalAmount: finalTotal,
        paymentMethod,
        status: 'COMPLETED' as const,
        note: orderNote.trim() || undefined,
      };

      const newOrder = await createOrder(orderPayload);
      setCompletedOrder(newOrder);
      setShowSuccessModal(true);
      clearCart();
      // Re-fetch products to reflect decreased stock
      fetchProductList();
      fetchShift();
      window.dispatchEvent(new CustomEvent('artisan_shift_changed'));
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.message || 'Lỗi khi tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (shiftChecking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#F8F9FA]">
        <Spin size="large" description="Đang kiểm tra ca làm việc..." />
      </div>
    );
  }

  if (!currentShift) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F8F9FA] overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-md p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-1">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#006C49] flex items-center justify-center mx-auto text-2xl mb-3 border border-emerald-200">
              <ClockCircleOutlined />
            </div>
            <Title level={4} className="!text-[#111827] !mb-1">Mở Ca Làm Việc Thu Ngân</Title>
            <Text type="secondary" className="text-xs">
              Vui lòng khai báo số tiền mặt đầu két để bắt đầu phiên bán hàng POS.
            </Text>
          </div>

          <div className="bg-[#F8F9FA] rounded-xl p-3.5 border border-[#E5E7EB] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#585F6C]">Thu ngân:</span>
              <span className="font-semibold text-[#111827]">{currentUser?.fullName || 'Thu Ngân'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#585F6C]">Chi nhánh:</span>
              <span className="font-semibold text-[#111827]">{activeBranchName || 'Chi nhánh mặc định'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#585F6C]">Khung ca hiện tại:</span>
              <Tag color="cyan" className="mr-0 font-medium">
                {currentSchedule?.displayText || 'Ca làm việc tự do'}
              </Tag>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111827] flex items-center justify-between">
                <span>Số tiền mặt đầu ca (tiền thối):</span>
                <span className="text-xs text-[#006C49] font-normal">
                  Đề xuất: {(currentSchedule?.defaultInitialCash || 500000).toLocaleString('vi-VN')} đ
                </span>
              </label>
              <Space.Compact size="large" className="w-full">
                <InputNumber
                  size="large"
                  className="w-full font-mono text-base font-bold"
                  value={openShiftCash}
                  onChange={(v) => setOpenShiftCash(v || 0)}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  min={0}
                />
                <Button disabled size="large" className="!bg-gray-100 !text-gray-600 font-bold !px-3">₫</Button>
              </Space.Compact>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111827]">Ghi chú đầu ca (tùy chọn):</label>
              <Input.TextArea
                rows={2}
                placeholder="Ví dụ: Nhận 500k tiền mệnh giá nhỏ từ ca trước..."
                value={openShiftNote}
                onChange={(e) => setOpenShiftNote(e.target.value)}
                className="rounded-lg text-xs"
              />
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            loading={openingShift}
            onClick={handleOpenShift}
            className="w-full bg-[#006C49] hover:bg-[#059669] font-bold h-11 text-sm shadow-xs"
          >
            Xác nhận mở ca &amp; Bắt đầu bán hàng
          </Button>
        </div>

        {/* Closed shift receipt for printing if just closed */}
        {closedShiftToPrint && (
          <div id="pos-shift-receipt" className="hidden">
            <div className="shift-receipt-container">
              <div className="receipt-header">
                <h2>ARTISAN BAKERY</h2>
                <p>Tiệm Bánh Thủ Công</p>
                <p>Hotline: 0901 234 567</p>
                <div className="divider">================================</div>
                <h3>PHIẾU BÀN GIAO KẾT CA</h3>
                <div className="divider">================================</div>
              </div>
              <div className="receipt-body">
                <div className="receipt-row">
                  <span>Mã phiên:</span>
                  <span>{closedShiftToPrint.id}</span>
                </div>
                <div className="receipt-row">
                  <span>Ca làm:</span>
                  <span>{closedShiftToPrint.shiftName}</span>
                </div>
                <div className="receipt-row">
                  <span>Thu ngân:</span>
                  <span>{closedShiftToPrint.staffName}</span>
                </div>
                <div className="receipt-row">
                  <span>Bắt đầu:</span>
                  <span>{new Date(closedShiftToPrint.startTime).toLocaleString('vi-VN')}</span>
                </div>
                <div className="receipt-row">
                  <span>Kết thúc:</span>
                  <span>{new Date(closedShiftToPrint.endTime || Date.now()).toLocaleString('vi-VN')}</span>
                </div>
                <div className="receipt-row">
                  <span>Tổng đơn bán:</span>
                  <span>{closedShiftToPrint.ordersCount} đơn</span>
                </div>
                <div className="divider">--------------------------------</div>
                <div className="receipt-row bold">
                  <span>TỔNG DOANH THU:</span>
                  <span>{closedShiftToPrint.totalRevenue.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="receipt-row">
                  <span>- Tiền mặt:</span>
                  <span>{closedShiftToPrint.cashRevenue.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="receipt-row">
                  <span>- Quẹt thẻ:</span>
                  <span>{closedShiftToPrint.cardRevenue.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="receipt-row">
                  <span>- Chuyển khoản:</span>
                  <span>{closedShiftToPrint.qrRevenue.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="divider">--------------------------------</div>
                <div className="receipt-row">
                  <span>Tiền đầu ca:</span>
                  <span>{closedShiftToPrint.initialCash.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="receipt-row bold">
                  <span>Tiền lý thuyết két:</span>
                  <span>{closedShiftToPrint.expectedCash.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="receipt-row bold">
                  <span>Tiền thực đếm nộp:</span>
                  <span>{closedShiftToPrint.actualCash.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="receipt-row bold">
                  <span>Chênh lệch bàn giao:</span>
                  <span>{closedShiftToPrint.difference > 0 ? '+' : ''}{closedShiftToPrint.difference.toLocaleString('vi-VN')} đ</span>
                </div>
                {closedShiftToPrint.note && (
                  <>
                    <div className="divider">--------------------------------</div>
                    <div className="receipt-row">
                      <span>Ghi chú:</span>
                      <span>{closedShiftToPrint.note}</span>
                    </div>
                  </>
                )}
                <div className="divider">================================</div>
                <div className="receipt-signatures">
                  <div>
                    <p>Thu ngân bàn giao</p>
                    <br /><br />
                    <p>{closedShiftToPrint.staffName}</p>
                  </div>
                  <div>
                    <p>Quản lý nhận ca</p>
                    <br /><br />
                    <p>(Ký nhận)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 overflow-hidden bg-[#F8F9FA]">
      {/* CỘT TRÁI: DANH MỤC & LƯỚI SẢN PHẨM (~65%) */}
      <div className="flex-1 flex flex-col h-full min-h-0 border-r border-[#E5E7EB] overflow-hidden">
        {/* Header Bộ lọc & Tìm kiếm */}
        <div className="p-3 bg-white border-b border-[#E5E7EB] space-y-2.5 shrink-0">
          {/* 5 & 6. Ô tìm kiếm chiếm hết phần còn lại + Nút Kết ca không xuống dòng */}
          <div className="flex items-center gap-3 w-full">
            <Input
              prefix={<SearchOutlined className="text-gray-400 mr-1" />}
              placeholder="Tìm kiếm theo tên bánh, danh mục hoặc mã..."
              aria-label="Tìm kiếm theo tên bánh, danh mục hoặc mã"
              size="middle"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="flex-1 rounded-lg"
            />
            <Button
              icon={<ClockCircleOutlined />}
              aria-label="Kết ca và chốt két tiền mặt"
              onClick={handleOpenShiftModal}
              className="shrink-0 whitespace-nowrap text-xs font-semibold text-[#006C49] border-[#10B981] hover:bg-emerald-50 h-9 flex items-center"
            >
              Kết ca / chốt két
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-[#006C49] text-white border-[#006C49] shadow-xs'
                    : 'bg-[#F8F9FA] text-[#585F6C] border-[#E5E7EB] hover:bg-[#F3F4F5] hover:text-[#111827]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-3.5 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Spin size="large" description="Đang tải danh mục bánh..." />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 bg-white rounded-xl border border-dashed border-[#E5E7EB] p-8">
              <Empty
                description={
                  <div className="text-center">
                    <p className="text-base font-semibold text-text-main">Không tìm thấy sản phẩm nào</p>
                    <p className="text-xs text-secondary">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác</p>
                  </div>
                }
              />
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('Tất cả'); }} className="mt-4">
                Đặt lại bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const canAddToCart = !isOutOfStock || allowNegativeStock;
                const inCartItem = cart.find((item) => item.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => canAddToCart && addToCart(product)}
                    className={`group relative bg-white border border-[#E5E7EB] rounded-xl overflow-hidden p-2.5 flex flex-col justify-between transition-all select-none ${
                      !canAddToCart
                        ? 'opacity-50 cursor-not-allowed bg-gray-50 pointer-events-none'
                        : 'cursor-pointer hover:border-[#10B981] hover:shadow-xs active:scale-[0.98]'
                    }`}
                  >
                    {inCartItem && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge count={inCartItem.quantity} style={{ backgroundColor: '#10B981' }} />
                      </div>
                    )}

                    {/* 7. Tag Hết hàng hoặc Bán âm kho ở góc thẻ */}
                    {isOutOfStock && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded shadow-2xs ${allowNegativeStock ? 'bg-amber-600' : 'bg-gray-600'}`}>
                          {allowNegativeStock ? 'Bán âm kho' : 'Hết hàng'}
                        </span>
                      </div>
                    )}

                    <div>
                      {/* 8. Ảnh sản phẩm có fallback icon bánh xám */}
                      <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-gray-100">
                        <ProductImage src={product.image} />
                      </div>

                      {/* 7. Cho phép tên xuống tối đa 2 dòng, không cắt bằng '...' */}
                      <h4
                        title={product.name}
                        className="font-semibold text-sm text-[#111827] line-clamp-2 min-h-[38px] leading-snug mb-1 group-hover:text-[#006C49]"
                      >
                        {product.name}
                      </h4>
                    </div>

                    {/* 7. Giữ giá và tồn kho */}
                    <div className="pt-2 border-t border-dashed border-[#E5E7EB] flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-[#006C49] font-mono">
                        {product.price.toLocaleString('vi-VN')} ₫
                      </span>
                      <Tag color={product.stock > 10 ? 'default' : product.stock > 0 ? 'warning' : 'error'} className="m-0 text-[10px]">
                        Kho: {product.stock}
                      </Tag>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG & THANH TOÁN (~35%, min 380px) */}
      <div className="w-full lg:w-[380px] xl:w-[410px] bg-white flex flex-col h-full min-h-0 shrink-0 shadow-lg lg:shadow-none z-20 border-l border-[#E5E7EB]">
        {/* Cart Header */}
        <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#006C49] flex items-center justify-center">
              <ShoppingCartOutlined className="text-sm" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#111827] m-0 leading-tight">
                Đơn hàng hiện tại
              </h3>
              <span className="text-[10px] text-secondary">
                {cart.reduce((s, i) => s + i.quantity, 0)} món trong giỏ
              </span>
            </div>
          </div>
          {cart.length > 0 && (
            <Button
              type="text"
              danger
              size="small"
              icon={<ClearOutlined />}
              aria-label="Làm mới giỏ hàng"
              onClick={clearCart}
              className="text-xs font-medium hover:bg-red-50"
            >
              Làm mới
            </Button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-secondary">
              <div className="w-14 h-14 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center mb-2.5">
                <ShoppingCartOutlined className="text-xl text-gray-300" />
              </div>
              <p className="font-semibold text-sm text-[#111827] m-0">Chưa có sản phẩm nào</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                Nhấp vào các món bánh bên thực đơn để thêm vào đơn hàng
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] hover:border-emerald-300 transition-all"
              >
                <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#E5E7EB] shrink-0">
                  <ProductImage src={item.product.image} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-[#111827] m-0 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] font-mono text-[#006C49] m-0">
                    {item.product.price.toLocaleString('vi-VN')} ₫
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="small"
                    aria-label={`Giảm số lượng ${item.product.name}`}
                    icon={<MinusOutlined className="text-[10px]" />}
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 p-0 flex items-center justify-center rounded-md"
                  />
                  <span className="w-6 text-center text-xs font-bold font-mono">
                    {item.quantity}
                  </span>
                  <Button
                    size="small"
                    aria-label={`Tăng số lượng ${item.product.name}`}
                    icon={<PlusOutlined className="text-[10px]" />}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-6 h-6 p-0 flex items-center justify-center rounded-md"
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    aria-label={`Xóa món ${item.product.name} khỏi giỏ hàng`}
                    icon={<DeleteOutlined className="text-xs" />}
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-6 h-6 p-0 flex items-center justify-center text-gray-400 hover:text-red-500 ml-1"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer: Inputs, Payment, Summary & Checkout */}
        <div className="p-3.5 bg-white border-t border-[#E5E7EB] space-y-2.5 shrink-0">
          {/* Customer info */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              prefix={<UserOutlined className="text-gray-400 text-xs" />}
              placeholder="Tên khách hàng"
              aria-label="Tên khách hàng"
              size="middle"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg text-xs"
            />
            <Input
              prefix={<PhoneOutlined className="text-gray-400 text-xs" />}
              placeholder="Số điện thoại"
              aria-label="Số điện thoại khách hàng"
              size="middle"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-lg text-xs"
            />
          </div>

          {/* Note Input */}
          <Input
            placeholder="Ghi chú đơn hàng (ví dụ: ít ngọt, cắt bánh...)"
            aria-label="Ghi chú đơn hàng"
            size="middle"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            className="w-full rounded-lg text-xs"
          />

          {/* 9. Payment Method Selector - Mặc định Tiền mặt */}
          <div className="w-full">
            <span className="text-[11px] font-semibold text-secondary block mb-1">
              Phương thức thanh toán
            </span>
            <div className="grid grid-cols-3 gap-1.5 w-full">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                aria-label="Thanh toán bằng Tiền mặt"
                className={`w-full py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-50 text-[#006C49] border-[#10B981] shadow-2xs'
                    : 'bg-[#F8F9FA] text-[#585F6C] border-[#E5E7EB] hover:bg-[#F3F4F5]'
                }`}
              >
                <DollarOutlined /> Tiền mặt
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QR_TRANSFER')}
                aria-label="Thanh toán bằng Chuyển khoản QR"
                className={`w-full py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  paymentMethod === 'QR_TRANSFER'
                    ? 'bg-emerald-50 text-[#006C49] border-[#10B981] shadow-2xs'
                    : 'bg-[#F8F9FA] text-[#585F6C] border-[#E5E7EB] hover:bg-[#F3F4F5]'
                }`}
              >
                <QrcodeOutlined /> Chuyển khoản
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                aria-label="Thanh toán bằng Quẹt thẻ POS"
                className={`w-full py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'bg-emerald-50 text-[#006C49] border-[#10B981] shadow-2xs'
                    : 'bg-[#F8F9FA] text-[#585F6C] border-[#E5E7EB] hover:bg-[#F3F4F5]'
                }`}
              >
                <CreditCardOutlined /> Quẹt thẻ
              </button>
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="w-full bg-[#F8F9FA] rounded-xl p-2.5 border border-[#E5E7EB] space-y-1.5 text-xs">
            <div className="flex justify-between text-secondary">
              <span>Tạm tính ({cart.reduce((s, i) => s + i.quantity, 0)} món):</span>
              <span className="font-mono font-medium text-[#111827]">{subtotal.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between items-center text-secondary">
              <span>Giảm giá:</span>
              <Space.Compact size="small" className="w-28">
                <InputNumber
                  id="pos-discount-input"
                  placeholder="0"
                  aria-label="Giảm giá đơn hàng"
                  size="small"
                  min={0}
                  max={subtotal}
                  disabled={cart.length === 0}
                  step={5000}
                  value={discount}
                  onChange={(val) => setDiscount(val || 0)}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  className="w-full"
                />
                <Button disabled size="small" className="!bg-gray-100 !text-gray-600 !px-1.5">₫</Button>
              </Space.Compact>
            </div>
            <div className="flex justify-between items-baseline pt-1.5 border-t border-[#E5E7EB]">
              <span className="font-bold text-xs text-[#111827]">Tổng thanh toán:</span>
              <span className="text-lg font-bold text-[#006C49] font-mono">
                {finalTotal.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            type="primary"
            size="large"
            block
            loading={submitting}
            disabled={cart.length === 0}
            onClick={handleCheckout}
            icon={<CheckCircleOutlined />}
            className="w-full bg-[#006C49] hover:bg-[#059669] text-white font-bold h-11 rounded-xl text-sm shadow-xs"
          >
            Thanh toán ({finalTotal.toLocaleString('vi-VN')} ₫)
          </Button>
        </div>
      </div>

      {/* MODAL IN HÓA ĐƠN / THÀNH CÔNG */}
      <Modal
        open={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        footer={null}
        centered
        width={440}
        destroyOnHidden
      >
        {completedOrder && (
          <div className="py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#006C49] flex items-center justify-center mx-auto mb-2.5">
              <CheckCircleOutlined className="text-2xl" />
            </div>
            <Title level={4} className="!mb-1 text-[#111827]">
              Thanh toán thành công!
            </Title>
            <Text className="text-secondary text-xs">
              Mã hóa đơn: <strong className="text-[#006C49] font-mono">{completedOrder.code}</strong>
            </Text>

            <div className="mt-3.5 p-3.5 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] text-left text-xs space-y-2">
              <div className="flex justify-between pb-1.5 border-b border-[#E5E7EB]">
                <span className="text-secondary">Khách hàng:</span>
                <span className="font-semibold">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#E5E7EB]">
                <span className="text-secondary">Thu ngân:</span>
                <span className="font-semibold">{completedOrder.staffName}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#E5E7EB]">
                <span className="text-secondary">Phương thức:</span>
                <Tag color="green">
                  {completedOrder.paymentMethod === 'QR_TRANSFER'
                    ? 'Chuyển khoản'
                    : completedOrder.paymentMethod === 'CASH'
                    ? 'Tiền mặt'
                    : 'Quẹt thẻ'}
                </Tag>
              </div>

              <div className="py-1.5">
                <span className="font-semibold text-secondary block mb-1">Món đã mua:</span>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {completedOrder.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>
                        {i.quantity}x {i.productName}
                      </span>
                      <span className="font-mono">{i.subtotal.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-[#E5E7EB] font-bold text-sm text-[#006C49]">
                <span>Tổng tiền:</span>
                <span className="font-mono text-base">{completedOrder.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-center">
              <Button
                icon={<PrinterOutlined />}
                onClick={() => {
                  window.print();
                }}
              >
                In hóa đơn
              </Button>
              <Button
                type="primary"
                onClick={() => setShowSuccessModal(false)}
                className="bg-[#006C49] hover:bg-[#059669]"
              >
                Bán đơn tiếp theo
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* KHỐI HÓA ĐƠN CHUYÊN DÙNG ĐỂ IN (Ẩn trên màn hình, chỉ hiển thị khi in) */}
      {completedOrder && (
        <div id="pos-printable-receipt" className="hidden font-mono text-black">
          <div className="text-center pb-2 border-b border-dashed border-black">
            <h2 className="text-base font-bold uppercase tracking-wider mb-0.5">ARTISAN BAKERY</h2>
            <p className="text-[10px] mb-0.5">Tiệm Bánh Thủ Công &amp; Cà Phê Nghệ Nhân</p>
            <p className="text-[10px] mb-0.5">Đ/c: 123 Đường Bánh Mì, Quận 1, TP. HCM</p>
            <p className="text-[10px]">Hotline: 0901 234 567</p>
          </div>

          <div className="text-center my-2">
            <h3 className="text-xs font-bold uppercase tracking-wide">HÓA ĐƠN BÁN LẺ</h3>
            <p className="text-[11px] font-bold">Số: {completedOrder.code}</p>
          </div>

          <div className="text-[10px] space-y-0.5 pb-2 border-b border-dashed border-black">
            <div className="flex justify-between">
              <span>Thời gian:</span>
              <span>{new Date(completedOrder.createdAt || Date.now()).toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Thu ngân:</span>
              <span>{completedOrder.staffName}</span>
            </div>
            <div className="flex justify-between">
              <span>Khách hàng:</span>
              <span>{completedOrder.customerName} {completedOrder.customerPhone ? `(${completedOrder.customerPhone})` : ''}</span>
            </div>
            <div className="flex justify-between">
              <span>Thanh toán:</span>
              <span>
                {completedOrder.paymentMethod === 'QR_TRANSFER'
                  ? 'Chuyển khoản'
                  : completedOrder.paymentMethod === 'CASH'
                  ? 'Tiền mặt'
                  : 'Quẹt thẻ'}
              </span>
            </div>
            {completedOrder.note && (
              <div className="flex justify-between">
                <span>Ghi chú:</span>
                <span>{completedOrder.note}</span>
              </div>
            )}
          </div>

          <div className="py-2 border-b border-dashed border-black">
            <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-black mb-1.5">
              <span className="w-1/2">TÊN MÓN</span>
              <span className="w-12 text-center">SL</span>
              <span className="w-16 text-right">ĐƠN GIÁ</span>
              <span className="w-20 text-right">T.TIỀN</span>
            </div>
            <div className="space-y-1">
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[10px] items-start">
                  <span className="w-1/2 pr-1 break-words">{item.productName}</span>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <span className="w-16 text-right">{item.price.toLocaleString('vi-VN')}</span>
                  <span className="w-20 text-right font-bold">{item.subtotal.toLocaleString('vi-VN')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 pb-2 text-[10px] space-y-1 border-b border-dashed border-black">
            <div className="flex justify-between">
              <span>Tạm tính tiền hàng:</span>
              <span>{completedOrder.subtotal.toLocaleString('vi-VN')} ₫</span>
            </div>
            {completedOrder.discount > 0 && (
              <div className="flex justify-between">
                <span>Giảm giá:</span>
                <span>-{completedOrder.discount.toLocaleString('vi-VN')} ₫</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold pt-1 border-t border-black">
              <span>TỔNG CỘNG:</span>
              <span>{completedOrder.totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>

          <div className="text-center pt-3 text-[10px] space-y-0.5">
            <p className="font-bold uppercase">CẢM ƠN QUÝ KHÁCH &amp; HẸN GẶP LẠI!</p>
            <p className="text-[9px] text-gray-700">Wifi: Artisan_Bakery | Pass: artisan2026</p>
            <p className="text-[8px] text-gray-500 mt-1">Hóa đơn điện tử khởi tạo từ hệ thống POS</p>
          </div>
        </div>
      )}

      {/* MODAL KẾT CA / CHỐT KÉT TIỀN */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <ClockCircleOutlined className="text-[#006C49]" />
            <span>Chốt ca &amp; đối soát tiền mặt két tiền</span>
          </div>
        }
        open={showShiftModal}
        onCancel={() => setShowShiftModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowShiftModal(false)}>
            Để sau
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={closingShift}
            onClick={handleConfirmCloseShift}
            className="bg-[#006C49] hover:bg-[#059669] text-white font-bold"
          >
            Xác nhận kết ca &amp; in phiếu
          </Button>,
        ]}
        width={520}
        destroyOnHidden
      >
        {currentShift && (
          <div className="space-y-3.5 py-2 text-xs">
            {/* Header info */}
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-secondary">Ca làm:</span>
                <span className="font-bold text-[#111827]">{currentShift.shiftName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Thu ngân:</span>
                <span className="font-semibold text-[#111827]">{currentShift.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Số đơn hoàn tất trong ca:</span>
                <span className="font-bold text-[#006C49]">{currentShift.ordersCount} hóa đơn</span>
              </div>
            </div>

            {/* Sales breakdown */}
            <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] space-y-2">
              <div className="font-bold text-xs text-[#111827] pb-1 border-b border-gray-100 flex items-center justify-between">
                <span>Doanh số phát sinh trong ca</span>
                <span className="text-[#006C49] font-mono">{currentShift.totalRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><DollarOutlined className="text-emerald-600" /> Tiền mặt:</span>
                <span className="font-mono font-semibold text-[#111827]">{currentShift.cashRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><CreditCardOutlined className="text-blue-600" /> Quẹt thẻ:</span>
                <span className="font-mono font-semibold text-[#111827]">{currentShift.cardRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><QrcodeOutlined className="text-cyan-600" /> Chuyển khoản:</span>
                <span className="font-mono font-semibold text-[#111827]">{currentShift.qrRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            {/* Cash Drawer Reconciliation */}
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
              <div className="font-bold text-xs text-amber-900 pb-1 border-b border-amber-200">
                Đối soát tiền mặt két bàn giao
              </div>
              <div className="flex justify-between text-secondary">
                <span>1. Tiền mặt đầu ca:</span>
                <span className="font-mono font-semibold text-[#111827]">{currentShift.initialCash.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>2. Tiền mặt bán hàng trong ca:</span>
                <span className="font-mono font-semibold text-[#111827]">+{currentShift.cashRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-[#111827] font-bold pt-1 border-t border-amber-200">
                <span>3. Tiền mặt lý thuyết trong két (1+2):</span>
                <span className="font-mono text-sm text-[#006C49]">{currentShift.expectedCash.toLocaleString('vi-VN')} ₫</span>
              </div>

              {/* Actual Cash Input */}
              <div className="pt-2 border-t border-amber-200 space-y-1">
                <label className="font-bold text-xs text-[#111827] block">
                  4. Nhập số tiền mặt thực tế đếm được trong két:
                </label>
                <Space.Compact size="large" className="w-full">
                  <InputNumber
                    size="large"
                    className="w-full font-mono text-base font-bold"
                    value={actualCashInput}
                    onChange={(val) => setActualCashInput(val || 0)}
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                  <Button disabled size="large" className="!bg-gray-100 !text-gray-600 font-bold !px-3">₫</Button>
                </Space.Compact>
              </div>

              {/* Difference Status */}
              <div className="p-2 rounded-lg bg-white border border-amber-200 flex justify-between items-center">
                <span className="font-bold text-xs text-[#111827]">Chênh lệch két (4 - 3):</span>
                {actualCashInput - currentShift.expectedCash === 0 ? (
                  <Tag color="success" className="font-bold text-xs mr-0 inline-flex items-center">
                    <CheckCircleOutlined className="mr-1" /> Khớp chuẩn (0 ₫)
                  </Tag>
                ) : actualCashInput - currentShift.expectedCash > 0 ? (
                  <Tag color="warning" className="font-bold text-xs mr-0">
                    + {(actualCashInput - currentShift.expectedCash).toLocaleString('vi-VN')} ₫ (Thừa tiền)
                  </Tag>
                ) : (
                  <Tag color="error" className="font-bold text-xs mr-0">
                    - {Math.abs(actualCashInput - currentShift.expectedCash).toLocaleString('vi-VN')} ₫ (Thiếu tiền)
                  </Tag>
                )}
              </div>

              {/* Note / Explanation */}
              <div>
                <label className="text-[11px] text-secondary font-medium block mb-1">
                  Ghi chú giải trình (nếu có):
                </label>
                <Input.TextArea
                  rows={2}
                  value={shiftNote}
                  onChange={(e) => setShiftNote(e.target.value)}
                  placeholder="Ví dụ: Bàn giao tiền chẵn cho chủ tiệm..."
                  className="text-xs rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* HIDDEN PRINTABLE SHIFT RECEIPT */}
      {closedShiftToPrint && (
        <div id="pos-shift-receipt" className="hidden">
          <div className="shift-receipt-container">
            <div className="receipt-header">
              <h2>ARTISAN BAKERY</h2>
              <p>Tiệm Bánh Thủ Công</p>
              <p>Hotline: 0901 234 567</p>
              <div className="divider">================================</div>
              <h3>PHIẾU BÀN GIAO KẾT CA</h3>
              <div className="divider">================================</div>
            </div>

            <div className="receipt-body">
              <div className="receipt-row">
                <span>Mã phiên:</span>
                <span>{closedShiftToPrint.id}</span>
              </div>
              <div className="receipt-row">
                <span>Ca làm:</span>
                <span>{closedShiftToPrint.shiftName}</span>
              </div>
              <div className="receipt-row">
                <span>Thu ngân:</span>
                <span>{closedShiftToPrint.staffName}</span>
              </div>
              <div className="receipt-row">
                <span>Bắt đầu:</span>
                <span>{new Date(closedShiftToPrint.startTime).toLocaleString('vi-VN')}</span>
              </div>
              <div className="receipt-row">
                <span>Kết thúc:</span>
                <span>{new Date(closedShiftToPrint.endTime || Date.now()).toLocaleString('vi-VN')}</span>
              </div>
              <div className="receipt-row">
                <span>Tổng đơn bán:</span>
                <span>{closedShiftToPrint.ordersCount} đơn</span>
              </div>

              <div className="divider">--------------------------------</div>
              <div className="receipt-row bold">
                <span>TỔNG DOANH THU:</span>
                <span>{closedShiftToPrint.totalRevenue.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row">
                <span>- Tiền mặt:</span>
                <span>{closedShiftToPrint.cashRevenue.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row">
                <span>- Quẹt thẻ:</span>
                <span>{closedShiftToPrint.cardRevenue.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row">
                <span>- Chuyển khoản:</span>
                <span>{closedShiftToPrint.qrRevenue.toLocaleString('vi-VN')} đ</span>
              </div>

              <div className="divider">--------------------------------</div>
              <div className="receipt-row">
                <span>Tiền đầu ca:</span>
                <span>{closedShiftToPrint.initialCash.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row bold">
                <span>Tiền lý thuyết két:</span>
                <span>{closedShiftToPrint.expectedCash.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row bold">
                <span>Tiền thực đếm nộp:</span>
                <span>{closedShiftToPrint.actualCash.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row bold">
                <span>Chênh lệch bàn giao:</span>
                <span>{closedShiftToPrint.difference > 0 ? '+' : ''}{closedShiftToPrint.difference.toLocaleString('vi-VN')} đ</span>
              </div>

              {closedShiftToPrint.note && (
                <>
                  <div className="divider">--------------------------------</div>
                  <div className="receipt-row">
                    <span>Ghi chú:</span>
                    <span>{closedShiftToPrint.note}</span>
                  </div>
                </>
              )}

              <div className="divider">================================</div>
              <div className="receipt-signatures">
                <div>
                  <p>Thu ngân bàn giao</p>
                  <br /><br />
                  <p>{closedShiftToPrint.staffName}</p>
                </div>
                <div>
                  <p>Quản lý nhận ca</p>
                  <br /><br />
                  <p>(Ký nhận)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 5mm;
            size: auto;
          }
          body * {
            visibility: hidden !important;
          }
          #pos-printable-receipt, #pos-printable-receipt *,
          #pos-shift-receipt, #pos-shift-receipt * {
            visibility: visible !important;
          }
          #pos-printable-receipt, #pos-shift-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 4mm !important;
            display: block !important;
            color: #000 !important;
            background: #fff !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 11px !important;
            line-height: 1.35 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .shift-receipt-container {
            width: 100%;
          }
          .receipt-header {
            text-align: center;
          }
          .receipt-header h2 {
            font-size: 15px;
            font-weight: bold;
            margin: 0;
          }
          .receipt-header h3 {
            font-size: 13px;
            font-weight: bold;
            margin: 4px 0;
          }
          .receipt-header p {
            font-size: 9px;
            margin: 2px 0;
          }
          .divider {
            text-align: center;
            letter-spacing: -1px;
            margin: 4px 0;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .receipt-row.bold {
            font-weight: bold;
          }
          .receipt-signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            text-align: center;
            font-size: 10px;
          }
          .ant-modal-mask, .ant-modal-wrap, .ant-modal, .ant-modal-content {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
