'use client';

import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Tag,
  Modal,
  Empty,
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
} from '@ant-design/icons';
import { getProducts, createOrder, getCurrentShift, closeCurrentShift } from '@/lib/api';
import { Product, CATEGORIES, Order, WorkShift } from '@/lib/mock-data';
import { getCurrentUser } from '@/lib/auth';
import PageLoading from '@/app/components/page-loading';

const { Title, Text } = Typography;

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const { message } = App.useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Shift State
  const [currentShift, setCurrentShift] = useState<WorkShift | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [shiftNote, setShiftNote] = useState('');
  const [closingShift, setClosingShift] = useState(false);
  const [closedShiftToPrint, setClosedShiftToPrint] = useState<WorkShift | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QR_TRANSFER' | 'CARD'>('QR_TRANSFER');
  const [submitting, setSubmitting] = useState(false);

  // Success Modal
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchProductList = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchShift = async () => {
    try {
      const shift = await getCurrentShift();
      setCurrentShift(shift);
      setActualCashInput(shift.expectedCash);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchProductList();
    fetchShift();

    const handleBranchChange = () => {
      fetchProductList();
      fetchShift();
      setCart([]);
    };
    window.addEventListener('artisan_branch_changed', handleBranchChange);
    return () => window.removeEventListener('artisan_branch_changed', handleBranchChange);
  }, []);

  const handleOpenShiftModal = async () => {
    try {
      const shift = await getCurrentShift();
      setCurrentShift(shift);
      setActualCashInput(shift.expectedCash);
      setShowShiftModal(true);
    } catch {
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
      fetchShift();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi kết ca');
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
    if (product.stock <= 0) {
      message.warning(`Sản phẩm "${product.name}" hiện đã hết hàng!`);
      return;
    }

    const inCart = cart.find((item) => item.product.id === product.id);
    if (inCart && inCart.quantity >= product.stock) {
      message.warning(`Số lượng đã đạt giới hạn tồn kho (${product.stock})`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
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
    if (product && newQuantity > product.stock) {
      message.warning(`Tồn kho chỉ còn ${product.stock} sản phẩm`);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
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
      message.success('Thanh toán đơn hàng thành công!');
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[#F8F9FA]">
      {/* CỘT TRÁI: DANH MỤC & LƯỚI SẢN PHẨM (~65%) */}
      <div className="flex-1 flex flex-col h-full border-r border-[#E5E7EB] overflow-hidden">
        {/* Header Bộ lọc & Tìm kiếm */}
        <div className="p-4 bg-white border-b border-[#E5E7EB] space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <Input
              prefix={<SearchOutlined className="text-gray-400 mr-1" />}
              placeholder="Tìm kiếm theo tên bánh, danh mục hoặc mã..."
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="w-full sm:max-w-md rounded-lg"
            />
            <div className="flex items-center gap-3">
              {currentShift && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ClockCircleOutlined className="text-[#006C49]" />
                  <span>{currentShift.shiftName.split('-')[0]}</span>
                </div>
              )}
              <Button
                icon={<ClockCircleOutlined />}
                onClick={handleOpenShiftModal}
                className="text-xs font-semibold text-[#006C49] border-[#10B981] hover:bg-emerald-50 h-9 flex items-center"
              >
                Kết ca / Chốt két
              </Button>
              <div className="text-xs text-secondary font-medium">
                Tìm thấy <strong className="text-[#10B981]">{filteredProducts.length}</strong> món
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
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
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <PageLoading description="Đang tải danh mục bánh..." className="flex flex-col items-center justify-center h-64" />
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
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const inCartItem = cart.find((item) => item.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`group relative bg-white border border-[#E5E7EB] rounded-xl overflow-hidden p-3 flex flex-col justify-between transition-all select-none ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed bg-gray-50'
                        : 'cursor-pointer hover:border-[#10B981] hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    {inCartItem && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge count={inCartItem.quantity} style={{ backgroundColor: '#10B981' }} />
                      </div>
                    )}

                    <div>
                      <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2.5 bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xs font-bold uppercase tracking-wider bg-red-600 px-2 py-0.5 rounded">
                              Hết hàng
                            </span>
                          </div>
                        )}
                      </div>

                      <span className="text-[11px] font-medium text-emerald-700 block uppercase tracking-wide mb-0.5">
                        {product.category}
                      </span>
                      <h4 className="font-semibold text-sm text-[#111827] line-clamp-1 mb-1 group-hover:text-[#006C49]">
                        {product.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-dashed border-[#E5E7EB] flex items-center justify-between mt-2">
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
      <div className="w-full lg:w-[400px] xl:w-[440px] bg-white flex flex-col h-full shrink-0 shadow-lg lg:shadow-none z-20 border-l border-[#E5E7EB]">
        {/* Cart Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <ShoppingCartOutlined className="text-base" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#111827] m-0 leading-tight">
                Đơn hàng hiện tại
              </h3>
              <span className="text-[11px] text-secondary">
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
              onClick={clearCart}
              className="text-xs font-medium hover:bg-red-50"
            >
              Làm mới
            </Button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-secondary">
              <div className="w-16 h-16 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center mb-3">
                <ShoppingCartOutlined className="text-2xl text-gray-300" />
              </div>
              <p className="font-semibold text-sm text-[#111827] m-0">Chưa có sản phẩm nào</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
                Nhấp vào các món bánh bên thực đơn để thêm vào đơn hàng
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] hover:border-emerald-300 transition-all"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-xs text-[#111827] truncate m-0">
                    {item.product.name}
                  </h5>
                  <p className="text-xs font-bold text-[#006C49] font-mono mt-0.5 m-0">
                    {item.product.price.toLocaleString('vi-VN')} ₫
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-white border border-[#E5E7EB] rounded-lg p-0.5 shrink-0">
                  <Button
                    type="text"
                    size="small"
                    icon={<MinusOutlined className="text-[10px]" />}
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center p-0"
                  />
                  <span className="font-bold text-xs w-6 text-center">{item.quantity}</span>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined className="text-[10px]" />}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center p-0"
                  />
                </div>

                {/* Remove button */}
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-gray-400 hover:text-red-500 shrink-0"
                />
              </div>
            ))
          )}
        </div>

        {/* Customer & Payment Form */}
        <div className="px-5 py-4 border-t border-[#E5E7EB] bg-white flex flex-col gap-3 shrink-0">
          {/* Customer Inputs */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <Input
              prefix={<UserOutlined className="text-gray-400 text-xs" />}
              placeholder="Tên khách hàng"
              size="middle"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg text-xs"
            />
            <Input
              prefix={<PhoneOutlined className="text-gray-400 text-xs" />}
              placeholder="Số điện thoại"
              size="middle"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-lg text-xs"
            />
          </div>

          {/* Note Input */}
          <Input
            placeholder="Ghi chú đơn hàng (ví dụ: ít đá, cắt bánh, nến...)"
            size="middle"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            className="w-full rounded-lg text-xs"
          />

          {/* Payment Method Selector */}
          <div className="w-full">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary block mb-1.5">
              Phương thức thanh toán
            </span>
            <div className="grid grid-cols-3 gap-2 w-full">
              <button
                type="button"
                onClick={() => setPaymentMethod('QR_TRANSFER')}
                className={`w-full py-2 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  paymentMethod === 'QR_TRANSFER'
                    ? 'bg-emerald-50 text-[#006C49] border-[#10B981] shadow-xs'
                    : 'bg-[#F8F9FA] text-[#585F6C] border-[#E5E7EB] hover:bg-[#F3F4F5]'
                }`}
              >
                <QrcodeOutlined /> Chuyển khoản
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`w-full py-2 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-50 text-[#006C49] border-[#10B981] shadow-xs'
                    : 'bg-[#F8F9FA] text-[#585F6C] border-[#E5E7EB] hover:bg-[#F3F4F5]'
                }`}
              >
                <DollarOutlined /> Tiền mặt
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`w-full py-2 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'bg-emerald-50 text-[#006C49] border-[#10B981] shadow-xs'
                    : 'bg-[#F8F9FA] text-[#585F6C] border-[#E5E7EB] hover:bg-[#F3F4F5]'
                }`}
              >
                <CreditCardOutlined /> Quẹt thẻ
              </button>
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="w-full bg-[#F8F9FA] rounded-xl p-3 border border-[#E5E7EB] space-y-1.5 text-xs">
            <div className="flex justify-between text-secondary">
              <span>Tạm tính ({cart.reduce((s, i) => s + i.quantity, 0)} món):</span>
              <span className="font-mono font-medium text-[#111827]">{subtotal.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between items-center text-secondary">
              <span>Giảm giá khuyến mãi:</span>
              <Space.Compact size="small" className="w-32">
                <InputNumber
                  size="small"
                  min={0}
                  max={subtotal}
                  step={5000}
                  value={discount}
                  onChange={(val) => setDiscount(val || 0)}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  className="w-full"
                />
                <Button disabled size="small" className="!bg-gray-100 !text-gray-600 !px-2">₫</Button>
              </Space.Compact>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-[#E5E7EB]">
              <span className="font-bold text-xs uppercase tracking-wider text-[#111827]">Tổng thanh toán:</span>
              <span className="text-xl font-bold text-[#006C49] font-mono">
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
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold h-12 rounded-xl text-base shadow-sm"
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
        width={460}
        destroyOnHidden
      >
        {completedOrder && (
          <div className="py-2 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center mx-auto mb-3">
              <CheckCircleOutlined className="text-3xl" />
            </div>
            <Title level={4} className="!mb-1 text-[#111827]">
              Thanh toán thành công!
            </Title>
            <Text className="text-secondary text-xs">
              Mã hóa đơn: <strong className="text-[#006C49] font-mono">{completedOrder.code}</strong>
            </Text>

            <div className="mt-4 p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] text-left text-xs space-y-2">
              <div className="flex justify-between pb-2 border-b border-[#E5E7EB]">
                <span className="text-secondary">Khách hàng:</span>
                <span className="font-semibold">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#E5E7EB]">
                <span className="text-secondary">Thu ngân:</span>
                <span className="font-semibold">{completedOrder.staffName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#E5E7EB]">
                <span className="text-secondary">Phương thức:</span>
                <Tag color="green">
                  {completedOrder.paymentMethod === 'QR_TRANSFER'
                    ? 'Chuyển khoản QR'
                    : completedOrder.paymentMethod === 'CASH'
                    ? 'Tiền mặt'
                    : 'Quẹt thẻ'}
                </Tag>
              </div>

              <div className="py-2">
                <span className="font-semibold text-secondary block mb-1">Món đã mua:</span>
                <div className="space-y-1 max-h-32 overflow-y-auto">
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

            <div className="mt-5 flex gap-2 justify-center">
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
                className="bg-[#10B981] hover:bg-[#059669]"
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
                  ? 'Chuyển khoản QR'
                  : completedOrder.paymentMethod === 'CASH'
                  ? 'Tiền mặt'
                  : 'Quẹt thẻ POS'}
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
                <span>Giảm giá khuyến mãi:</span>
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
            <span>Chốt Ca &amp; Đối Soát Tiền Mặt Két Tiền</span>
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
            className="bg-[#10B981] hover:bg-[#059669] text-white font-bold"
          >
            Xác nhận kết ca &amp; In phiếu
          </Button>,
        ]}
        width={540}
        destroyOnHidden
      >
        {currentShift && (
          <div className="space-y-4 py-2 text-xs">
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
                <span className="font-bold text-blue-700">{currentShift.ordersCount} hóa đơn</span>
              </div>
            </div>

            {/* Sales breakdown */}
            <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] space-y-2">
              <div className="font-bold text-xs text-[#111827] pb-1 border-b border-gray-100 flex items-center justify-between">
                <span>DOANH SỐ PHÁT SINH TRONG CA</span>
                <span className="text-[#006C49] font-mono">{currentShift.totalRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><DollarOutlined className="text-emerald-600" /> Tiền mặt:</span>
                <span className="font-mono font-semibold text-[#111827]">{currentShift.cashRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><CreditCardOutlined className="text-blue-600" /> Quẹt thẻ POS:</span>
                <span className="font-mono font-semibold text-[#111827]">{currentShift.cardRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><QrcodeOutlined className="text-cyan-600" /> Chuyển khoản QR:</span>
                <span className="font-mono font-semibold text-[#111827]">{currentShift.qrRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            {/* Cash Drawer Reconciliation */}
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2.5">
              <div className="font-bold text-xs text-amber-900 pb-1 border-b border-amber-200">
                ĐỐI SOÁT TIỀN MẶT KÉT BÀN GIAO
              </div>
              <div className="flex justify-between text-secondary">
                <span>1. Tiền mặt đầu ca (tiền thối):</span>
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
              <div className="p-2.5 rounded-lg bg-white border border-amber-200 flex justify-between items-center">
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
                  Ghi chú giải trình (nếu có chênh lệch hoặc bàn giao đặc biệt):
                </label>
                <Input.TextArea
                  rows={2}
                  value={shiftNote}
                  onChange={(e) => setShiftNote(e.target.value)}
                  placeholder="Ví dụ: Bàn giao tiền chẵn cho chủ tiệm, thiếu 5k do không có tiền lẻ thối..."
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
              <p>Tiệm Bánh Thủ Công Pháp</p>
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
                <span>- Chuyển khoản QR:</span>
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
