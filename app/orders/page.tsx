'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Select,
  Tag,
  Card,
  App,
  Typography,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeOutlined,
  QrcodeOutlined,
  DollarOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { getOrders } from '@/lib/api';
import SearchInput from '@/app/components/search-input';
import { Order } from '@/lib/mock-data';
import { usePageGuard } from '@/app/hooks/use-page-guard';

const { Title, Text } = Typography;

export default function OrdersPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<string>('ALL');

  usePageGuard();

  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
      const curBranchId = typeof window !== 'undefined' ? localStorage.getItem('artisan_active_branch_id') : null;
      setActiveBranchId(curBranchId);
    } catch {
      message.error('Lỗi khi tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleBranchChange = (e: any) => {
      setActiveBranchId(e.detail || localStorage.getItem('artisan_active_branch_id'));
    };
    window.addEventListener('artisan_branch_changed', handleBranchChange);
    return () => window.removeEventListener('artisan_branch_changed', handleBranchChange);
  }, []);

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    const matchesBranch = !activeBranchId || activeBranchId === 'ALL' || !o.branchId || o.branchId === activeBranchId;
    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
    const matchesPayment = selectedPayment === 'ALL' || o.paymentMethod === selectedPayment;
    const matchesSearch =
      o.code.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      o.staffName.toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchesBranch && matchesStatus && matchesPayment && matchesSearch;
  });

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      render: (code: string, record) => (
        <span
          className="font-mono font-bold text-[#006C49] hover:underline cursor-pointer"
          onClick={() => router.push(`/orders/${record.id}`)}
        >
          {code}
        </span>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      render: (dateStr: string) => {
        const d = new Date(dateStr);
        return (
          <div>
            <span className="text-xs text-[#111827] block font-medium">
              {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[11px] text-secondary">
              {d.toLocaleDateString('vi-VN')}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string, record) => (
        <div>
          <span className="font-medium text-xs text-[#111827] block">{name || 'Khách lẻ'}</span>
          {record.customerPhone && (
            <span className="text-[11px] text-gray-400 font-mono">{record.customerPhone}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Thu ngân',
      dataIndex: 'staffName',
      key: 'staffName',
      render: (staff: string) => <span className="text-xs text-secondary">{staff}</span>,
    },
    {
      title: 'Số lượng món',
      key: 'itemCount',
      align: 'center',
      render: (_, record) => (
        <span className="text-xs font-semibold">
          {record.items.reduce((sum, i) => sum + i.quantity, 0)} món
        </span>
      ),
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (val: number) => (
        <span className="font-mono font-bold text-[#006C49]">
          {val.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Hình thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      align: 'center',
      render: (method: string) => {
        if (method === 'QR_TRANSFER') {
          return (
            <Tag color="cyan" className="text-[11px] flex items-center justify-center gap-1 w-fit mx-auto">
              <QrcodeOutlined /> QR Pay
            </Tag>
          );
        }
        if (method === 'CASH') {
          return (
            <Tag color="green" className="text-[11px] flex items-center justify-center gap-1 w-fit mx-auto">
              <DollarOutlined /> Tiền mặt
            </Tag>
          );
        }
        return (
          <Tag color="blue" className="text-[11px] flex items-center justify-center gap-1 w-fit mx-auto">
            <CreditCardOutlined /> Thẻ POS
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => {
        if (status === 'COMPLETED') return <Tag color="success">Đã hoàn thành</Tag>;
        if (status === 'PENDING') return <Tag color="warning">Chờ xử lý</Tag>;
        return <Tag color="error">Đã hủy</Tag>;
      },
    },
    {
      title: 'Chi tiết',
      key: 'action',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết hóa đơn">
          <Button
            type="text"
            icon={<EyeOutlined className="text-[#10B981]" />}
            onClick={() => router.push(`/orders/${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Header & POS Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={3} className="!mb-1 text-[#111827]">
            Lịch Sử Đơn Hàng & Giao Dịch
          </Title>
          <Text className="text-secondary text-sm">
            Theo dõi danh sách hóa đơn bán hàng, hình thức thanh toán và trạng thái xử lý
          </Text>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<ShoppingOutlined />}
          onClick={() => router.push('/pos')}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg shadow-xs"
        >
          Tới quầy thu ngân (POS)
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="border border-[#E5E7EB] shadow-xs rounded-xl" styles={{ body: { padding: '16px 20px' } }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <div className="md:col-span-2">
            <SearchInput
              placeholder="Tìm theo mã đơn (HD-...), tên khách hàng hoặc thu ngân..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <div>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="w-full"
              options={[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Đã hoàn thành', value: 'COMPLETED' },
                { label: 'Chờ xử lý', value: 'PENDING' },
                { label: 'Đã hủy', value: 'CANCELLED' },
              ]}
            />
          </div>

          <div>
            <Select
              value={selectedPayment}
              onChange={setSelectedPayment}
              className="w-full"
              options={[
                { label: 'Tất cả hình thức thanh toán', value: 'ALL' },
                { label: 'Chuyển khoản QR', value: 'QR_TRANSFER' },
                { label: 'Tiền mặt', value: 'CASH' },
                { label: 'Quẹt thẻ', value: 'CARD' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="border border-[#E5E7EB] shadow-xs rounded-xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => router.push(`/orders/${record.id}`),
            className: 'cursor-pointer hover:bg-[#F9FAFB]',
          })}
          pagination={{
            pageSize: 8,
            showTotal: (total, range) => `${range[0]}-${range[1]} trong tổng số ${total} đơn hàng`,
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
}
