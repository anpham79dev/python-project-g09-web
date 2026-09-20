'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Tag,
  Button,
  Spin,
  App,
  Typography,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Radio,
  Progress,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  FileTextOutlined,
  PlusOutlined,
  MinusOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PieChartOutlined,
  BankOutlined,
  WalletOutlined,
  ShopOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import {
  getTransactions,
  createTransaction,
  getCashFlowSummary,
  getPnLReport,
  getBranches,
} from '@/lib/api';
import {
  Transaction,
  CashFlowSummary,
  PnLReport,
  Branch,
} from '@/lib/types';
import { getCurrentUser, hasPermission } from '@/lib/auth';

const { Title, Text } = Typography;

export default function AccountingPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('artisan_active_branch_id') || 'ALL';
    }
    return 'ALL';
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<CashFlowSummary | null>(null);
  const [pnl, setPnl] = useState<PnLReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal State
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherType, setVoucherType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [voucherForm] = Form.useForm();
  const [submittingVoucher, setSubmittingVoucher] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (!hasPermission(user, 'accounting:read') && user.role !== 'SUPER_ADMIN') {
      message.error('Bạn không có quyền truy cập trang Sổ quỹ & Kế toán!');
      router.push('/pos');
    }
  }, [router, message]);

  const loadData = async () => {
    setLoading(true);
    try {
      const branchParam = selectedBranchId === 'ALL' ? undefined : selectedBranchId;
      const [bList, txList, sumData, pnlData] = await Promise.all([
        getBranches(),
        getTransactions({
          branchId: branchParam,
          type: typeFilter === 'ALL' ? undefined : typeFilter,
        }),
        getCashFlowSummary({ branchId: branchParam }),
        getPnLReport({ branchId: branchParam }),
      ]);
      setBranches(bList);
      setTransactions(txList);
      setSummary(sumData);
      setPnl(pnlData);
    } catch {
      message.error('Lỗi khi tải dữ liệu kế toán và sổ quỹ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleBranchChange = (e: any) => {
      const newBranchId = e.detail || (typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : 'ALL') || 'ALL';
      setSelectedBranchId(newBranchId);
    };
    window.addEventListener('artisan_branch_changed', handleBranchChange);
    return () => window.removeEventListener('artisan_branch_changed', handleBranchChange);
  }, [selectedBranchId, typeFilter]);

  const handleSelectBranch = (val: string) => {
    setSelectedBranchId(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('artisan_active_branch_id', val);
      window.dispatchEvent(new CustomEvent('artisan_branch_changed', { detail: val }));
    }
  };

  const handleOpenCreateVoucher = (type: 'INCOME' | 'EXPENSE') => {
    setVoucherType(type);
    voucherForm.resetFields();
    voucherForm.setFieldsValue({
      transactionType: type,
      branchId: selectedBranchId !== 'ALL' ? selectedBranchId : (branches[0]?.id || ''),
      paymentMethod: 'CASH',
      category: type === 'INCOME' ? 'Thu khác / Hoàn tiền' : 'Chi phí Nguyên vật liệu & Nhập hàng',
    });
    setIsVoucherModalOpen(true);
  };

  const handleSaveVoucher = async () => {
    try {
      const values = await voucherForm.validateFields();
      setSubmittingVoucher(true);
      await createTransaction({
        ...values,
        transactionType: voucherType,
      });
      message.success(`Lập ${voucherType === 'INCOME' ? 'Phiếu Thu' : 'Phiếu Chi'} thành công!`);
      setIsVoucherModalOpen(false);
      loadData();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err.message || 'Lỗi khi lưu phiếu thu/chi');
    } finally {
      setSubmittingVoucher(false);
    }
  };

  const txColumns: ColumnsType<Transaction> = [
    {
      title: 'Mã Phiếu',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <span className="font-mono font-bold text-xs text-[#006C49]">{code}</span>
      ),
    },
    {
      title: 'Loại Phiếu',
      dataIndex: 'transactionType',
      key: 'transactionType',
      align: 'center',
      render: (tType: string) => (
        <Tag
          color={tType === 'INCOME' ? 'success' : 'error'}
          className="font-semibold text-xs"
        >
          {tType === 'INCOME' ? '+ THU VÀO' : '- CHI RA'}
        </Tag>
      ),
    },
    {
      title: 'Danh Mục Khoản Thu / Chi',
      key: 'category',
      render: (_, record) => (
        <div>
          <span className="font-semibold text-xs text-[#111827] block">{record.category}</span>
          <span className="text-[11px] text-secondary">{record.note || 'Không có ghi chú'}</span>
        </div>
      ),
    },
    {
      title: 'Chi Nhánh',
      dataIndex: 'branchName',
      key: 'branchName',
      render: (bName: string) => (
        <span className="text-xs text-secondary flex items-center gap-1">
          <ShopOutlined /> {bName || 'Toàn chuỗi'}
        </span>
      ),
    },
    {
      title: 'Số Tiền (VNĐ)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount: number, record) => (
        <span
          className={`font-mono font-bold text-xs ${
            record.transactionType === 'INCOME' ? 'text-[#10B981]' : 'text-red-600'
          }`}
        >
          {record.transactionType === 'INCOME' ? '+' : '-'}
          {amount.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Phương Thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (pm: string) => {
        const isCash = pm === 'CASH';
        return (
          <Tag
            color={isCash ? 'orange' : 'blue'}
            className="text-[11px] font-medium inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-md"
          >
            {isCash ? <DollarOutlined className="text-xs" /> : <BankOutlined className="text-xs" />}
            <span>{isCash ? 'Tiền mặt' : 'Chuyển khoản QR'}</span>
          </Tag>
        );
      },
    },
    {
      title: 'Người Nộp / Người Nhận',
      dataIndex: 'recipientPayer',
      key: 'recipientPayer',
      render: (rp: string) => <span className="text-xs font-medium text-[#111827]">{rp}</span>,
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (dt: string) => (
        <span className="text-[11px] text-secondary font-mono">
          {new Date(dt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <Title level={3} className="!mb-0 text-[#111827] !font-bold">
            Sổ Quỹ Thu Chi &amp; Kế Toán Quản Trị
          </Title>
          <Text className="text-secondary text-xs mt-1 block">
            Theo dõi dòng tiền thu chi, lập phiếu chi nguyên vật liệu, tiền mặt bằng và báo cáo lãi lỗ P&amp;L
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Branch Filter */}
          <Select
            value={selectedBranchId}
            onChange={handleSelectBranch}
            className="w-64 text-xs"
            options={[
              { label: 'Tất cả chi nhánh (Toàn chuỗi)', value: 'ALL' },
              ...branches.map((b) => ({
                label: b.name,
                value: b.id,
              })),
            ]}
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            className="rounded-lg text-xs font-medium h-9 flex items-center"
          >
            Làm mới
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenCreateVoucher('INCOME')}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg text-xs shadow-xs h-9 flex items-center"
          >
            + Lập Phiếu Thu
          </Button>

          <Button
            type="primary"
            danger
            icon={<MinusOutlined />}
            onClick={() => handleOpenCreateVoucher('EXPENSE')}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs shadow-xs h-9 flex items-center"
          >
            - Lập Phiếu Chi
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-xs font-bold uppercase tracking-wider">
              Tổng Thu Vào Trong Kỳ
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006C49] flex items-center justify-center">
              <ArrowUpOutlined className="text-base" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-[#10B981]">
              {(summary?.totalIncome || 0).toLocaleString('vi-VN')} ₫
            </div>
            <div className="mt-1 text-xs text-secondary">
              Doanh thu bán POS &amp; thu khác
            </div>
          </div>
        </Card>

        <Card className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-xs font-bold uppercase tracking-wider">
              Tổng Chi Ra Trong Kỳ
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowDownOutlined className="text-base" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-red-600">
              {(summary?.totalExpense || 0).toLocaleString('vi-VN')} ₫
            </div>
            <div className="mt-1 text-xs text-secondary">
              Nguyên vật liệu, mặt bằng, điện nước
            </div>
          </div>
        </Card>

        <Card className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-xs font-bold uppercase tracking-wider">
              Dòng Tiền Ròng (Net Cash)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <WalletOutlined className="text-base" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-[#111827]">
              {(summary?.netCashFlow || 0).toLocaleString('vi-VN')} ₫
            </div>
            <div className="mt-1 text-xs text-secondary">
              Chênh lệch Thu - Chi thực tế
            </div>
          </div>
        </Card>

        <Card className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-xs font-bold uppercase tracking-wider">
              Lợi Nhuận Ròng Ước Tính
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <PieChartOutlined className="text-base" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-purple-700">
              {(pnl?.netProfit || 0).toLocaleString('vi-VN')} ₫
            </div>
            <div className="mt-1 text-xs text-purple-800 font-semibold">
              Tỷ suất lợi nhuận ròng: {pnl?.netMarginPercent || 0}%
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <Tabs
          defaultActiveKey="journal"
          items={[
            {
              key: 'journal',
              label: (
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <FileTextOutlined /> 1. Sổ Nhật Ký Thu - Chi (Cash Journal)
                </span>
              ),
              children: (
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between">
                    <Radio.Group
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      size="small"
                    >
                      <Radio.Button value="ALL">Tất cả ({transactions.length})</Radio.Button>
                      <Radio.Button value="INCOME">Phiếu Thu (+)</Radio.Button>
                      <Radio.Button value="EXPENSE">Phiếu Chi (-)</Radio.Button>
                    </Radio.Group>

                    <span className="text-xs text-secondary">
                      Hiển thị danh sách các phiếu thu tiền &amp; phiếu xuất quỹ
                    </span>
                  </div>

                  <Table
                    columns={txColumns}
                    dataSource={transactions}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    className="rounded-xl border border-[#E5E7EB] overflow-hidden"
                  />
                </div>
              ),
            },
            {
              key: 'pnl',
              label: (
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <AuditOutlined /> 2. Báo Cáo Lãi Lỗ P&amp;L Rút Gọn
                </span>
              ),
              children: (
                <div className="space-y-6 mt-2">
                  {pnl && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* P&L Statement breakdown */}
                      <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#E5E7EB] space-y-3.5">
                        <span className="font-bold text-sm text-[#111827] block pb-2 border-b border-[#E5E7EB]">
                          BẢNG KẾT QUẢ KINH DOANH SƠ BỘ — {pnl.periodLabel}
                        </span>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#111827]">
                            (+) DOANH THU THUẦN (Gross Revenue):
                          </span>
                          <span className="font-mono font-bold text-sm text-[#10B981]">
                            {pnl.grossRevenue.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs pl-3 border-l-2 border-red-300">
                          <span className="text-secondary">
                            (-) Giá vốn nguyên vật liệu &amp; Nhập bánh (COGS):
                          </span>
                          <span className="font-mono font-medium text-xs text-red-600">
                            - {pnl.cogs.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-2 border-t border-dashed border-[#D1D5DB]">
                          <span className="font-bold text-[#111827]">
                            (=) LỢI NHUẬN GỘP (Gross Profit):
                          </span>
                          <div className="text-right">
                            <span className="font-mono font-bold text-xs text-[#006C49]">
                              {pnl.grossProfit.toLocaleString('vi-VN')} ₫
                            </span>
                            <span className="text-[10px] text-secondary block">
                              Biên gộp: {pnl.grossMarginPercent}%
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs pl-3 border-l-2 border-orange-300">
                          <span className="text-secondary">
                            (-) Chi phí vận hành, mặt bằng &amp; lương (OPEX):
                          </span>
                          <span className="font-mono font-medium text-xs text-orange-600">
                            - {pnl.operatingExpenses.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-3 border-t-2 border-[#111827]">
                          <span className="font-bold text-sm text-purple-900 uppercase">
                            (=) LỢI NHUẬN RÒNG (Net Profit):
                          </span>
                          <div className="text-right">
                            <span className="font-mono font-bold text-base text-purple-700">
                              {pnl.netProfit.toLocaleString('vi-VN')} ₫
                            </span>
                            <span className="text-[11px] font-semibold text-purple-600 block">
                              Tỷ suất sinh lời: {pnl.netMarginPercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expenses Structure breakdown */}
                      <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#E5E7EB] space-y-4">
                        <span className="font-bold text-sm text-[#111827] block pb-2 border-b border-[#E5E7EB]">
                          CƠ CẤU PHÂN BỔ CHI PHÍ HOẠT ĐỘNG
                        </span>

                        <div className="space-y-3 text-xs">
                          {Object.entries(pnl.expensesBreakdown).map(([cat, amt]) => {
                            const totalExp = Object.values(pnl.expensesBreakdown).reduce((a, b) => a + b, 0) || 1;
                            const pct = Math.round((amt / totalExp) * 100);
                            return (
                              <div key={cat} className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="font-medium text-[#111827]">{cat}</span>
                                  <span className="font-mono text-secondary font-semibold">
                                    {amt.toLocaleString('vi-VN')} ₫ ({pct}%)
                                  </span>
                                </div>
                                <Progress
                                  percent={pct}
                                  showInfo={false}
                                  strokeColor="#10B981"
                                  size="small"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Modal Lập Phiếu Thu / Phiếu Chi */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            {voucherType === 'INCOME' ? (
              <PlusOutlined className="text-[#10B981]" />
            ) : (
              <MinusOutlined className="text-red-600" />
            )}
            <span>{voucherType === 'INCOME' ? 'Lập Phiếu Thu Tiền' : 'Lập Phiếu Chi Tiền'}</span>
          </div>
        }
        open={isVoucherModalOpen}
        onCancel={() => setIsVoucherModalOpen(false)}
        onOk={handleSaveVoucher}
        confirmLoading={submittingVoucher}
        okText={voucherType === 'INCOME' ? 'Tạo Phiếu Thu' : 'Tạo Phiếu Chi'}
        cancelText="Hủy"
        width={480}
      >
        <Form form={voucherForm} layout="vertical" className="pt-3">
          <Form.Item
            name="category"
            label={<span className="text-xs font-semibold text-[#111827]">DANH MỤC KHOẢN MỤC</span>}
            rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập danh mục' }]}
          >
            <Select className="text-xs">
              {voucherType === 'INCOME' ? (
                <>
                  <Select.Option value="Thu doanh thu bán lẻ POS">Thu doanh thu bán lẻ POS</Select.Option>
                  <Select.Option value="Thu tiền đặt cọc bánh sự kiện / tiệc">Thu tiền đặt cọc bánh sự kiện / tiệc</Select.Option>
                  <Select.Option value="Thu thanh lý phế liệu bao bì">Thu thanh lý phế liệu bao bì</Select.Option>
                  <Select.Option value="Thu khác / Hoàn tiền">Thu khác / Hoàn tiền</Select.Option>
                </>
              ) : (
                <>
                  <Select.Option value="Chi phí Nguyên vật liệu & Nhập hàng">Chi phí Nguyên vật liệu &amp; Nhập hàng (Bột, Bơ, Sữa)</Select.Option>
                  <Select.Option value="Chi phí Bao bì & Hộp bánh">Chi phí Bao bì &amp; Hộp bánh</Select.Option>
                  <Select.Option value="Chi phí Thuê Mặt bằng cơ sở">Chi phí Thuê Mặt bằng cơ sở</Select.Option>
                  <Select.Option value="Chi phí Điện, Nước & Tiện ích">Chi phí Điện, Nước &amp; Tiện ích lò nướng</Select.Option>
                  <Select.Option value="Chi phí Lương & Phụ cấp nhân sự">Chi phí Lương &amp; Phụ cấp nhân sự</Select.Option>
                  <Select.Option value="Chi phí Sửa chữa bảo trì thiết bị">Chi phí Sửa chữa bảo trì thiết bị</Select.Option>
                  <Select.Option value="Chi phí Khác">Chi phí Khác</Select.Option>
                </>
              )}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="amount"
              label={<span className="text-xs font-semibold text-[#111827]">SỐ TIỀN (VNĐ)</span>}
              rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
            >
              <Space.Compact className="w-full">
                <InputNumber
                  min={1000}
                  step={10000}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  className="w-full font-mono text-xs font-bold"
                />
                <Button disabled className="!bg-gray-100 !text-gray-600 font-medium !px-3 text-xs">₫</Button>
              </Space.Compact>
            </Form.Item>

            <Form.Item
              name="paymentMethod"
              label={<span className="text-xs font-semibold text-[#111827]">HÌNH THỨC</span>}
            >
              <Select className="text-xs">
                <Select.Option value="CASH">
                  <span className="inline-flex items-center gap-1.5">
                    <DollarOutlined className="text-amber-600 text-xs" />
                    <span>Tiền mặt</span>
                  </span>
                </Select.Option>
                <Select.Option value="BANK_TRANSFER">
                  <span className="inline-flex items-center gap-1.5">
                    <BankOutlined className="text-blue-600 text-xs" />
                    <span>Chuyển khoản QR</span>
                  </span>
                </Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="branchId"
              label={<span className="text-xs font-semibold text-[#111827]">CHI NHÁNH PHÁT SINH</span>}
            >
              <Select className="text-xs">
                {branches.map((b) => (
                  <Select.Option key={b.id} value={b.id}>
                    {b.code} — {b.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="recipientPayer"
              label={
                <span className="text-xs font-semibold text-[#111827]">
                  {voucherType === 'INCOME' ? 'NGƯỜI NỘP TIỀN' : 'NGƯỜI NHẬN TIỀN'}
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng nhập đối tượng' }]}
            >
              <Input placeholder="Ví dụ: Cty Bơ Sữa Pháp, NV Thu Ngân..." className="text-xs" />
            </Form.Item>
          </div>

          <Form.Item
            name="note"
            label={<span className="text-xs font-semibold text-[#111827]">GHI CHÚ / DIỄN GIẢI</span>}
          >
            <Input.TextArea rows={2} placeholder="Nội dung chi tiết của khoản thu/chi..." className="text-xs" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
