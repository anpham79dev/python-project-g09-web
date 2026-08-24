'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Button,
  App,
  DatePicker,
  Select,
  Modal,
  Avatar,
  Tooltip,
  Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  ShopOutlined,
  CreditCardOutlined,
  QrcodeOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getShifts, getShiftSummary, getUsers } from '@/lib/api';
import { WorkShift, ShiftSummary, User } from '@/lib/mock-data';
import { usePageGuard } from '@/app/hooks/use-page-guard';
import PageLoading from '@/app/components/page-loading';
import PageHeader from '@/app/components/page-header';
import ReloadButton from '@/app/components/reload-button';
import StatCard from '@/app/components/stat-card';

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

  usePageGuard();

  const loadData = async (branchOverride?: string) => {
    setLoading(true);
    try {
      const curBranch = branchOverride !== undefined ? branchOverride : (typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : null);

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
    } catch {
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

  // 1. Shift History Columns
  const shiftColumns: ColumnsType<WorkShift> = [
    {
      title: 'Mã & Tên Ca Làm',
      key: 'shiftInfo',
      render: (_, record) => (
        <div>
          <span className="font-semibold text-xs text-[#111827] block">{record.shiftName}</span>
          <span className="text-[11px] font-mono text-secondary">Mã: {record.id}</span>
        </div>
      ),
    },
    {
      title: 'Thu Ngân',
      key: 'staff',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Avatar className="bg-[#006C49] text-white text-xs font-bold w-7 h-7">
            {record.staffName.charAt(0)}
          </Avatar>
          <span className="text-xs font-medium text-[#111827]">{record.staffName}</span>
        </div>
      ),
    },
    {
      title: 'Thời Gian Ca',
      key: 'time',
      render: (_, record) => {
        const start = dayjs(record.startTime).format('HH:mm DD/MM');
        const end = record.endTime ? dayjs(record.endTime).format('HH:mm DD/MM') : 'Đang mở';
        return (
          <div className="text-xs">
            <span className="text-[#111827] font-medium block">{start} → {end}</span>
            <span className="text-[11px] text-secondary">
              {record.endTime ? 'Thời lượng: ~' + Math.max(1, Math.round(dayjs(record.endTime).diff(dayjs(record.startTime), 'hour', true))) + 'h' : 'Đang bán hàng'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Số Đơn',
      dataIndex: 'ordersCount',
      key: 'ordersCount',
      align: 'center',
      render: (cnt: number) => (
        <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {cnt} đơn
        </span>
      ),
    },
    {
      title: 'Tổng Doanh Thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (val: number, record) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#006C49] block">
            {val.toLocaleString('vi-VN')} ₫
          </span>
          <span className="text-[10px] text-secondary block">
            TM: {record.cashRevenue.toLocaleString('vi-VN')} | QR: {record.qrRevenue.toLocaleString('vi-VN')}
          </span>
        </div>
      ),
    },
    {
      title: 'Tiền Mặt Thực Đếm',
      key: 'actualCash',
      align: 'right',
      render: (_, record) => (
        <div>
          <span className="font-mono font-semibold text-xs text-[#111827] block">
            {record.status === 'CLOSED' ? `${record.actualCash.toLocaleString('vi-VN')} ₫` : 'Chưa chốt'}
          </span>
          <span className="text-[10px] text-secondary">
            Dự kiến: {record.expectedCash.toLocaleString('vi-VN')} ₫
          </span>
        </div>
      ),
    },
    {
      title: 'Chênh Lệch Két',
      key: 'difference',
      align: 'center',
      render: (_, record) => {
        if (record.status === 'OPEN') {
          return <Tag color="processing">Đang mở ca</Tag>;
        }
        if (record.difference === 0) {
          return (
            <Tag color="success" className="font-bold text-xs inline-flex items-center gap-1">
              <CheckCircleOutlined /> Khớp chuẩn (0 ₫)
            </Tag>
          );
        }
        if (record.difference > 0) {
          return (
            <Tag color="warning" className="font-bold text-xs">
              + {record.difference.toLocaleString('vi-VN')} ₫ (Thừa)
            </Tag>
          );
        }
        return (
          <Tag color="error" className="font-bold text-xs">
            - {Math.abs(record.difference).toLocaleString('vi-VN')} ₫ (Thiếu)
          </Tag>
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (st: string) => (
        <Tag color={st === 'CLOSED' ? 'default' : 'emerald'} className="font-semibold text-xs">
          {st === 'CLOSED' ? 'Đã kết ca' : 'Đang hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết & In phiếu">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetail(record)}
              className="text-xs"
            >
              Chi tiết
            </Button>
          </Tooltip>
          {record.status === 'CLOSED' && (
            <Tooltip title="In lại phiếu kết ca">
              <Button
                size="small"
                icon={<PrinterOutlined />}
                onClick={() => {
                  setDetailShift(record);
                  setTimeout(() => window.print(), 200);
                }}
                className="text-xs text-[#006C49] border-[#006C49]"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full space-y-6">
      <PageHeader
        title="Quản Lý Ca Làm Việc & Báo Cáo Kết Ca"
        subtitle="Kiểm soát doanh thu bán hàng từng ca, đối soát tiền mặt két tiền và minh bạch tài chính"
        actionsClassName="flex flex-wrap items-center gap-2.5"
        actions={
          <>
            <Select
              placeholder="Lọc theo nhân viên"
              allowClear
              value={selectedStaffId}
              onChange={setSelectedStaffId}
              className="w-44 text-xs h-9"
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
              className="w-36 text-xs h-9"
            >
              <Select.Option value="OPEN">Đang mở ca</Select.Option>
              <Select.Option value="CLOSED">Đã kết ca</Select.Option>
            </Select>

            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Lọc theo ngày"
              onChange={(d) => setSelectedDate(d ? d.format('YYYY-MM-DD') : undefined)}
              className="text-xs h-9 rounded-lg"
            />

            <ReloadButton onClick={() => loadData()} />

            <Button
              type="primary"
              icon={<ShopOutlined />}
              onClick={() => router.push('/pos')}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg text-xs shadow-xs h-9 flex items-center"
            >
              Mở quầy POS
            </Button>
          </>
        }
      />

      {loading ? (
        <PageLoading description="Đang tải dữ liệu ca làm việc..." />
      ) : summary ? (
        <>
          {/* 4 Executive KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Shifts */}
            <StatCard
              label="Tổng ca làm việc"
              icon={<ClockCircleOutlined className="text-base" />}
              iconClassName="bg-blue-50 text-blue-600"
              value={<>{summary.totalShiftsCount} <span className="text-sm font-normal text-secondary">ca</span></>}
              footer={
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <Tag color="success" className="text-[11px] font-semibold">{summary.closedShiftsCount} đã chốt</Tag>
                  {summary.openShiftsCount > 0 && (
                    <Tag color="processing" className="text-[11px] font-semibold">{summary.openShiftsCount} đang mở</Tag>
                  )}
                </div>
              }
            />

            <StatCard
              label="Tổng doanh thu các ca"
              icon={<DollarOutlined className="text-base" />}
              value={`${summary.totalRevenue.toLocaleString('vi-VN')} ₫`}
              footer={<div className="mt-1 text-[11px] text-secondary">Doanh số hoàn tất trong các phiên làm việc</div>}
            />

            <StatCard
              label="Tiền mặt thực thu (Két)"
              icon={<DollarOutlined className="text-base" />}
              iconClassName="bg-amber-50 text-amber-600"
              value={`${summary.totalCash.toLocaleString('vi-VN')} ₫`}
              footer={
                <div className="mt-1 text-[11px] text-secondary">
                  QR: {summary.totalQr.toLocaleString('vi-VN')} ₫ • Thẻ: {summary.totalCard.toLocaleString('vi-VN')} ₫
                </div>
              }
            />

            <StatCard
              label="Tổng chênh lệch két"
              icon={<CheckCircleOutlined className="text-base" />}
              iconClassName="bg-purple-50 text-purple-600"
              valueClassName={summary.totalDifference === 0 ? 'text-[#006C49]' : summary.totalDifference > 0 ? 'text-amber-600' : 'text-red-600'}
              value={`${summary.totalDifference > 0 ? '+' : ''}${summary.totalDifference.toLocaleString('vi-VN')} ₫`}
              footer={
                <div className="mt-1 text-[11px]">
                  {summary.totalDifference === 0 ? (
                    <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                      <CheckCircleOutlined /> Khớp tuyệt đối 100% két tiền
                    </span>
                  ) : (
                    <span className="text-secondary">Có phát sinh lệch tiền mặt khi bàn giao</span>
                  )}
                </div>
              }
            />
          </div>

          {/* Main Table Container */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#111827] block">
                  Danh Sách Lịch Sử Kết Ca &amp; Đối Soát Bàn Giao
                </span>
                <span className="text-xs text-secondary">
                  Chi tiết từng phiên làm việc của nhân viên thu ngân và quản lý
                </span>
              </div>
              <Tag color="emerald" className="font-mono text-xs font-bold">
                {shifts.length} phiên ca
              </Tag>
            </div>

            <Table
              columns={shiftColumns}
              dataSource={shifts}
              rowKey="id"
              pagination={{ pageSize: 8, showTotal: (t) => `Tổng cộng ${t} ca làm việc` }}
              className="rounded-xl border border-[#E5E7EB] overflow-hidden"
            />
          </div>
        </>
      ) : null}

      {/* Modal Chi Tiết Ca Làm Việc & In Phiếu */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <ClockCircleOutlined className="text-[#006C49]" />
            <span>Chi Tiết Phiếu Kết Ca — {detailShift?.shiftName}</span>
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
              className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold"
            >
              In Phiếu Kết Ca
            </Button>
          ),
        ]}
        width={560}
      >
        {detailShift && (
          <div className="space-y-4 py-2 text-xs">
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
                <span className="font-bold text-blue-700">{detailShift.ordersCount} hóa đơn</span>
              </div>
            </div>

            {/* Chi tiết doanh thu theo PTTT */}
            <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] space-y-2">
              <div className="font-bold text-xs text-[#111827] pb-1 border-b border-gray-100 flex items-center justify-between">
                <span>DOANH THU THEO PHƯƠNG THỨC</span>
                <span className="text-[#006C49] font-mono">{detailShift.totalRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><DollarOutlined className="text-emerald-600" /> Tiền mặt:</span>
                <span className="font-mono font-semibold text-[#111827]">{detailShift.cashRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><CreditCardOutlined className="text-blue-600" /> Quẹt thẻ POS:</span>
                <span className="font-mono font-semibold text-[#111827]">{detailShift.cardRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span className="flex items-center gap-1"><QrcodeOutlined className="text-cyan-600" /> Chuyển khoản QR:</span>
                <span className="font-mono font-semibold text-[#111827]">{detailShift.qrRevenue.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            {/* Đối soát tiền mặt */}
            <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200 space-y-2">
              <div className="font-bold text-xs text-amber-900 pb-1 border-b border-amber-200">
                ĐỐI SOÁT TIỀN MẶT TRONG KÉT
              </div>
              <div className="flex justify-between text-secondary">
                <span>1. Tiền mặt lẻ đầu ca:</span>
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
                <span className="font-mono text-base text-blue-700">
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
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <span className="font-bold text-secondary block mb-0.5">Ghi chú giải trình của thu ngân:</span>
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
              <p>Tiệm Bánh Thủ Công Pháp</p>
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
                <span>- Quẹt thẻ POS:</span>
                <span>{detailShift.cardRevenue.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-row">
                <span>- Chuyển khoản QR:</span>
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
