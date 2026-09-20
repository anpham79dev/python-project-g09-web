'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Button,
  Spin,
  App,
  Typography,
  DatePicker,
  Select,
  Modal,
  Avatar,
  Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  ReloadOutlined,
  CreditCardOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getShifts, getShiftSummary, getUsers } from '@/lib/api';
import { WorkShift, ShiftSummary, User } from '@/lib/mock-data';
import { getCurrentUser } from '@/lib/auth';

const { Title } = Typography;

export default function ShiftsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  // Print/Detail Modal State
  const [detailShift, setDetailShift] = useState<WorkShift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check Permission
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  const loadData = async (branchOverride?: string) => {
    setLoading(true);
    try {
      const curBranch = branchOverride !== undefined ? branchOverride : (typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : null);
      setActiveBranchId(curBranch);

      const [sumData, shiftList, userList] = await Promise.all([
        getShiftSummary(selectedDate ? { date: selectedDate, branchId: curBranch && curBranch !== 'ALL' ? curBranch : undefined } : (curBranch && curBranch !== 'ALL' ? { branchId: curBranch } : undefined)),
        getShifts({
          status: selectedStatus,
          staffId: selectedStaffId,
          date: selectedDate,
          branchId: curBranch && curBranch !== 'ALL' ? curBranch : undefined,
        }),
        getUsers(),
      ]);
      setSummary(sumData);
      setShifts(shiftList);
      setUsers(userList);
    } catch (err: any) {
      message.error('Lỗi khi tải danh sách ca làm việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleBranchChange = (e: any) => {
      const newBranchId = e.detail || localStorage.getItem('artisan_active_branch_id');
      loadData(newBranchId);
    };
    window.addEventListener('artisan_branch_changed', handleBranchChange);
    return () => window.removeEventListener('artisan_branch_changed', handleBranchChange);
  }, [selectedStaffId, selectedStatus, selectedDate]);

  const handleOpenDetail = (shift: WorkShift) => {
    setDetailShift(shift);
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // TABLE COLUMNS CONFIGURATIONS
  // ==========================================
  const shiftColumns: ColumnsType<WorkShift> = [
    {
      title: <span className="whitespace-nowrap text-xs font-semibold text-gray-600">Mã & tên ca làm</span>,
      key: 'shiftInfo',
      width: 220,
      render: (_, record) => (
        <div className="whitespace-nowrap">
          <span className="font-semibold text-xs text-[#111827] block leading-tight">{record.shiftName}</span>
          <span className="text-[11px] font-mono text-gray-400 block mt-0.5">{record.id}</span>
        </div>
      ),
    },
    {
      title: <span className="whitespace-nowrap text-xs font-semibold text-gray-600">Thu ngân</span>,
      key: 'staff',
      width: 170,
      render: (_, record) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Avatar className="bg-[#006C49] text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center shrink-0">
            {record.staffName.charAt(0)}
          </Avatar>
          <span className="text-xs font-medium text-[#111827]">{record.staffName}</span>
        </div>
      ),
    },
    {
      title: <span className="whitespace-nowrap text-xs font-semibold text-gray-600">Thời gian ca</span>,
      key: 'time',
      width: 170,
      render: (_, record) => {
        const start = dayjs(record.startTime).format('HH:mm DD/MM');
        const end = record.endTime ? dayjs(record.endTime).format('HH:mm DD/MM') : 'Đang mở';
        return (
          <div className="text-xs whitespace-nowrap">
            <span className="text-[#111827] font-medium block leading-tight">{start} → {end}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              {record.endTime ? '~' + Math.max(1, Math.round(dayjs(record.endTime).diff(dayjs(record.startTime), 'hour', true))) + ' giờ' : 'Đang làm việc'}
            </span>
          </div>
        );
      },
    },
    {
      title: <span className="whitespace-nowrap text-xs font-semibold text-gray-600">Số đơn</span>,
      dataIndex: 'ordersCount',
      key: 'ordersCount',
      align: 'center',
      width: 85,
      render: (cnt: number) => (
        <span className="font-semibold text-xs text-[#111827] whitespace-nowrap font-mono">
          {cnt}
        </span>
      ),
    },
    {
      title: <span className="whitespace-nowrap text-xs font-semibold text-gray-600">Tổng doanh thu</span>,
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      width: 160,
      render: (val: number, record) => (
        <div className="whitespace-nowrap">
          <span className="font-mono font-bold text-xs text-[#006C49] block leading-tight">
            {val.toLocaleString('vi-VN')} ₫
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
            TM: {record.cashRevenue.toLocaleString('vi-VN')} | QR: {record.qrRevenue.toLocaleString('vi-VN')}
          </span>
        </div>
      ),
    },
    {
      title: <span className="whitespace-nowrap text-xs font-semibold text-gray-600">Tiền mặt thực đếm</span>,
      key: 'actualCash',
      align: 'right',
      width: 150,
      render: (_, record) => (
        <div className="whitespace-nowrap">
          <span className="font-mono font-semibold text-xs text-[#111827] block leading-tight">
            {record.status === 'CLOSED' ? `${record.actualCash.toLocaleString('vi-VN')} ₫` : 'Chưa chốt'}
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
            Dự kiến: {record.expectedCash.toLocaleString('vi-VN')} ₫
          </span>
        </div>
      ),
    },
    {
      title: <span className="whitespace-nowrap text-xs font-semibold text-gray-600">Chênh lệch két</span>,
      key: 'difference',
      align: 'center',
      width: 150,
      render: (_, record) => {
        if (record.status === 'OPEN') {
          return (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 whitespace-nowrap">
              Đang mở ca
            </span>
          );
        }
        if (record.difference === 0) {
          return (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 whitespace-nowrap">
              Khớp chuẩn (0 ₫)
            </span>
          );
        }
        if (record.difference > 0) {
          return (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 whitespace-nowrap">
              + {record.difference.toLocaleString('vi-VN')} ₫ (Thừa)
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 whitespace-nowrap">
            - {Math.abs(record.difference).toLocaleString('vi-VN')} ₫ (Thiếu)
          </span>
        );
      },
    },
    {
      title: <span className="whitespace-nowrap text-xs font-semibold text-gray-600">Trạng thái</span>,
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (st: string) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
            st === 'CLOSED' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {st === 'CLOSED' ? 'Đã kết ca' : 'Đang hoạt động'}
        </span>
      ),
    },
    {
      title: <span className="whitespace-nowrap text-xs font-semibold text-gray-600">Thao tác</span>,
      key: 'action',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleOpenDetail(record)}
          className="text-xs text-[#006C49] hover:text-[#059669] p-0 font-medium h-auto whitespace-nowrap"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full space-y-5">
      {/* A. Khối đầu trang: Tiêu đề và bộ lọc cùng 1 hàng, bỏ nút Mở quầy POS và bỏ mô tả */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
        <Title
          level={4}
          data-testid="page-title"
          className="!mb-0 text-[#111827] !font-bold shrink-0 text-lg"
        >
          Ca làm việc
        </Title>

        {/* 3. Bộ lọc chung 1 hàng bên phải */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            placeholder="Lọc theo nhân viên"
            allowClear
            value={selectedStaffId}
            onChange={setSelectedStaffId}
            className="w-40 text-xs h-8"
          >
            {users.map((u) => (
              <Select.Option key={u.id} value={u.id}>
                {u.fullName}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Trạng thái ca"
            allowClear
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="w-32 text-xs h-8"
          >
            <Select.Option value="OPEN">Đang mở ca</Select.Option>
            <Select.Option value="CLOSED">Đã kết ca</Select.Option>
          </Select>

          <DatePicker
            format="DD/MM/YYYY"
            placeholder="Lọc theo ngày"
            onChange={(d) => setSelectedDate(d ? d.format('YYYY-MM-DD') : undefined)}
            className="text-xs h-8 rounded-lg w-36"
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadData()}
            className="rounded-lg text-xs font-medium h-8 flex items-center"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-80">
          <Spin size="large" description="Đang tải dữ liệu ca làm việc..." />
        </div>
      ) : summary ? (
        <>
          {/* B. 4 thẻ tổng quan: Đồng bộ chiều cao, icon cùng màu #006C49 không nền, nhãn chữ thường viết hoa chữ đầu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Shifts */}
            <Card className="border border-[#E5E7EB] shadow-2xs rounded-xl h-full flex flex-col justify-between" styles={{ body: { padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Tổng ca làm việc
                  </span>
                  <ClockCircleOutlined className="text-base text-[#006C49]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {summary.totalShiftsCount} <span className="text-xs font-normal text-gray-400">ca</span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs">
                <span className="text-emerald-700 font-medium text-[11px]">{summary.closedShiftsCount} đã chốt</span>
                {summary.openShiftsCount > 0 && (
                  <span className="text-blue-700 font-medium text-[11px]">• {summary.openShiftsCount} đang mở</span>
                )}
              </div>
            </Card>

            {/* Total Revenue */}
            <Card className="border border-[#E5E7EB] shadow-2xs rounded-xl h-full flex flex-col justify-between" styles={{ body: { padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Tổng doanh thu các ca
                  </span>
                  <DollarOutlined className="text-base text-[#006C49]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {summary.totalRevenue.toLocaleString('vi-VN')} ₫
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                Doanh số hoàn tất trong các phiên
              </div>
            </Card>

            {/* Cash Revenue */}
            <Card className="border border-[#E5E7EB] shadow-2xs rounded-xl h-full flex flex-col justify-between" styles={{ body: { padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Tiền mặt thực thu (két)
                  </span>
                  <DollarOutlined className="text-base text-[#006C49]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {summary.totalCash.toLocaleString('vi-VN')} ₫
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-gray-100 text-[11px] text-gray-400 font-mono">
                QR: {summary.totalQr.toLocaleString('vi-VN')} ₫ • Thẻ: {summary.totalCard.toLocaleString('vi-VN')} ₫
              </div>
            </Card>

            {/* Total Discrepancy */}
            <Card className="border border-[#E5E7EB] shadow-2xs rounded-xl h-full flex flex-col justify-between" styles={{ body: { padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Tổng chênh lệch két
                  </span>
                  <CheckCircleOutlined className="text-base text-[#006C49]" />
                </div>
                <div className={`text-2xl font-bold font-mono ${summary.totalDifference === 0 ? 'text-[#006C49]' : summary.totalDifference > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                  {summary.totalDifference > 0 ? '+' : ''}{summary.totalDifference.toLocaleString('vi-VN')} ₫
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-gray-100 text-[11px]">
                {summary.totalDifference === 0 ? (
                  <span className="text-emerald-700 font-medium">Khớp tuyệt đối 100% két tiền</span>
                ) : (
                  <span className="text-amber-700 font-medium">Có phát sinh lệch tiền mặt khi bàn giao</span>
                )}
              </div>
            </Card>
          </div>

          {/* C. Bảng lịch sử ca: Bỏ header thừa, mở rộng chiều rộng, phân trang căn 2 đầu */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <Table
              columns={shiftColumns}
              dataSource={shifts}
              rowKey="id"
              scroll={{ x: 950 }}
              pagination={{
                pageSize: 8,
                showTotal: (total) => (
                  <span className="text-xs text-gray-400">
                    Tổng cộng {total} ca làm việc
                  </span>
                ),
                className: '!flex !items-center !justify-between !w-full !px-2',
              }}
              className="rounded-lg overflow-hidden [&_.ant-table-cell]:!py-2.5 [&_.ant-table-cell]:!px-3"
            />
          </div>
        </>
      ) : null}

      {/* Modal Chi tiết ca làm việc & In phiếu */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <ClockCircleOutlined className="text-[#006C49]" />
            <span>Chi tiết phiếu kết ca — {detailShift?.shiftName}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
          detailShift?.status === 'CLOSED' && (
            <Button
              key="print"
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className="bg-[#006C49] hover:bg-[#059669] text-white font-semibold"
            >
              In phiếu kết ca
            </Button>
          ),
        ]}
        width={540}
      >
        {detailShift && (
          <div className="space-y-3 py-1 text-xs">
            {/* Thông tin nhân viên & giờ giấc */}
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-secondary">Thu ngân phụ trách:</span>
                <span className="font-bold text-[#111827]">{detailShift.staffName} ({detailShift.staffId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Giờ bắt đầu ca:</span>
                <span className="font-mono text-[#111827]">{dayjs(detailShift.startTime).format('HH:mm:ss DD/MM/YYYY')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Giờ kết thúc ca:</span>
                <span className="font-mono text-[#111827]">
                  {detailShift.endTime ? dayjs(detailShift.endTime).format('HH:mm:ss DD/MM/YYYY') : 'Đang hoạt động'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Số đơn hàng đã bán:</span>
                <span className="font-bold text-[#006C49]">{detailShift.ordersCount} hóa đơn</span>
              </div>
            </div>

            {/* Chi tiết doanh thu theo PTTT */}
            <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] space-y-1.5">
              <div className="font-bold text-xs text-[#111827] pb-1 border-b border-gray-100 flex items-center justify-between">
                <span>Doanh thu theo phương thức</span>
                <span className="text-[#006C49] font-mono">{detailShift.totalRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><DollarOutlined className="text-emerald-600" /> Tiền mặt:</span>
                <span className="font-mono font-semibold text-[#111827]">{detailShift.cashRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><CreditCardOutlined className="text-blue-600" /> Quẹt thẻ:</span>
                <span className="font-mono font-semibold text-[#111827]">{detailShift.cardRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><QrcodeOutlined className="text-cyan-600" /> Chuyển khoản:</span>
                <span className="font-mono font-semibold text-[#111827]">{detailShift.qrRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            {/* Đối soát tiền mặt */}
            <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200 space-y-1.5">
              <div className="font-bold text-xs text-amber-900 pb-1 border-b border-amber-200">
                Đối soát tiền mặt trong két
              </div>
              <div className="flex justify-between text-secondary">
                <span>1. Tiền lẻ đầu ca:</span>
                <span className="font-mono font-semibold text-[#111827]">{detailShift.initialCash.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>2. Doanh thu tiền mặt trong ca:</span>
                <span className="font-mono font-semibold text-[#111827]">+{detailShift.cashRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-[#111827] font-bold pt-1 border-t border-amber-200">
                <span>3. Tiền mặt lý thuyết trong két (1+2):</span>
                <span className="font-mono text-base text-[#006C49]">{detailShift.expectedCash.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-[#111827] font-bold">
                <span>4. Tiền mặt thực tế đếm được:</span>
                <span className="font-mono text-base text-[#006C49]">
                  {detailShift.status === 'CLOSED' ? `${detailShift.actualCash.toLocaleString('vi-VN')} ₫` : 'Chưa chốt'}
                </span>
              </div>
              {detailShift.status === 'CLOSED' && (
                <div className="flex justify-between font-bold pt-1 border-t border-amber-200">
                  <span>Chênh lệch bàn giao (4-3):</span>
                  <span className={`font-mono text-sm ${detailShift.difference === 0 ? 'text-emerald-700' : detailShift.difference > 0 ? 'text-amber-700' : 'text-red-600'}`}>
                    {detailShift.difference === 0 ? '0 ₫ (Khớp chuẩn)' : `${detailShift.difference > 0 ? '+' : ''}${detailShift.difference.toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
              )}
            </div>

            {/* Ghi chú */}
            {detailShift.note && (
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <span className="font-semibold text-secondary block mb-0.5">Ghi chú giải trình của thu ngân:</span>
                <span className="text-[#111827] italic">{detailShift.note}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Hidden Printable Receipt for window.print() */}
      {detailShift && (
        <div id="shift-printable-receipt" className="hidden">
          <div className="receipt-container">
            <div className="receipt-header">
              <h2>ARTISAN BAKERY</h2>
              <p>Tiệm Bánh Thủ Công</p>
              <p>Đ/c: 123 Đường Bánh Mì, Quận 1, TP.HCM</p>
              <p>Hotline: 0901 234 567</p>
              <div className="divider">================================</div>
              <h3>PHIẾU BÀN GIAO KẾT CA</h3>
              <div className="divider">================================</div>
            </div>

            <div className="receipt-body">
              <div className="receipt-row">
                <span>Mã phiên ca:</span>
                <span>{detailShift.id}</span>
              </div>
              <div className="receipt-row">
                <span>Tên ca:</span>
                <span>{detailShift.shiftName}</span>
              </div>
              <div className="receipt-row">
                <span>Thu ngân:</span>
                <span>{detailShift.staffName}</span>
              </div>
              <div className="receipt-row">
                <span>Bắt đầu:</span>
                <span>{dayjs(detailShift.startTime).format('HH:mm DD/MM/YYYY')}</span>
              </div>
              <div className="receipt-row">
                <span>Kết thúc:</span>
                <span>{detailShift.endTime ? dayjs(detailShift.endTime).format('HH:mm DD/MM/YYYY') : '---'}</span>
              </div>
              <div className="receipt-row">
                <span>Tổng số đơn hoàn tất:</span>
                <span>{detailShift.ordersCount} hóa đơn</span>
              </div>

              <div className="divider">--------------------------------</div>
              <div className="receipt-section-title">DOANH THU BÁN HÀNG:</div>
              <div className="receipt-row">
                <span>- Tiền mặt:</span>
                <span>{detailShift.cashRevenue.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row">
                <span>- Quẹt thẻ:</span>
                <span>{detailShift.cardRevenue.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row">
                <span>- Chuyển khoản:</span>
                <span>{detailShift.qrRevenue.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row bold">
                <span>TỔNG DOANH THU:</span>
                <span>{detailShift.totalRevenue.toLocaleString('vi-VN')} đ</span>
              </div>

              <div className="divider">--------------------------------</div>
              <div className="receipt-section-title">ĐỐI SOÁT TIỀN MẶT KÉT:</div>
              <div className="receipt-row">
                <span>Tiền lẻ đầu ca:</span>
                <span>{detailShift.initialCash.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row">
                <span>Tiền mặt thu trong ca:</span>
                <span>+{detailShift.cashRevenue.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row bold">
                <span>Tiền lý thuyết trong két:</span>
                <span>{detailShift.expectedCash.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row bold">
                <span>Tiền thực đếm nộp lại:</span>
                <span>{detailShift.actualCash.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row bold">
                <span>Chênh lệch két:</span>
                <span>{detailShift.difference > 0 ? '+' : ''}{detailShift.difference.toLocaleString('vi-VN')} đ</span>
              </div>

              {detailShift.note && (
                <>
                  <div className="divider">--------------------------------</div>
                  <div className="receipt-row">
                    <span>Ghi chú:</span>
                    <span>{detailShift.note}</span>
                  </div>
                </>
              )}

              <div className="divider">================================</div>
              <div className="receipt-signatures">
                <div className="sig-block">
                  <p>Thu ngân bàn giao</p>
                  <br /><br />
                  <p>{detailShift.staffName}</p>
                </div>
                <div className="sig-block">
                  <p>Quản lý nhận ca</p>
                  <br /><br />
                  <p>(Ký &amp; ghi rõ họ tên)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #shift-printable-receipt,
          #shift-printable-receipt * {
            visibility: visible;
          }
          #shift-printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            display: block !important;
            padding: 10px;
            font-family: 'Courier New', Courier, monospace;
            color: #000;
            background: #fff;
          }
          .receipt-container {
            width: 100%;
            font-size: 12px;
            line-height: 1.4;
          }
          .receipt-header {
            text-align: center;
          }
          .receipt-header h2 {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
          }
          .receipt-header h3 {
            font-size: 14px;
            font-weight: bold;
            margin: 4px 0;
          }
          .receipt-header p {
            font-size: 10px;
            margin: 2px 0;
          }
          .divider {
            text-align: center;
            letter-spacing: -1px;
            margin: 4px 0;
          }
          .receipt-section-title {
            font-weight: bold;
            font-size: 11px;
            margin: 4px 0 2px;
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
          .sig-block {
            width: 45%;
          }
        }
      `}</style>
    </div>
  );
}
