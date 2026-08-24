'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Tag,
  Button,
  App,
  Typography,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ShopOutlined,
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  getBranches,
  createBranch,
  updateBranch,
  getWarehouseStocks,
  updateWarehouseStock,
} from '@/lib/api';
import { Branch, StockItem } from '@/lib/mock-data';
import { getCurrentUser } from '@/lib/auth';

const { Title, Text } = Typography;

export default function BranchesPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('branches');

  // Filter for Stocks tab
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | undefined>(undefined);

  // Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm] = Form.useForm();
  const [submittingBranch, setSubmittingBranch] = useState(false);

  // Stock Edit Modal State
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [stockQty, setStockQty] = useState<number>(0);
  const [stockMinAlert, setStockMinAlert] = useState<number>(5);
  const [submittingStock, setSubmittingStock] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [branchList, stockList] = await Promise.all([
        getBranches(),
        getWarehouseStocks({
          branchId: selectedBranchId,
          warehouseId: selectedWarehouseId,
        }),
      ]);
      setBranches(branchList);
      setStocks(stockList);
    } catch {
      message.error('Lỗi khi tải dữ liệu chi nhánh và tồn kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleBranchChange = (e: any) => {
      const newBranchId = e.detail || localStorage.getItem('artisan_active_branch_id');
      if (newBranchId && newBranchId !== 'ALL') {
        setSelectedBranchId(newBranchId);
      } else {
        setSelectedBranchId(undefined);
      }
    };
    window.addEventListener('artisan_branch_changed', handleBranchChange);
    return () => window.removeEventListener('artisan_branch_changed', handleBranchChange);
  }, [selectedBranchId, selectedWarehouseId]);

  // Branch Modal Handlers
  const handleOpenCreateBranch = () => {
    setEditingBranch(null);
    branchForm.resetFields();
    branchForm.setFieldsValue({ status: 'ACTIVE' });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    branchForm.setFieldsValue(branch);
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async () => {
    try {
      const values = await branchForm.validateFields();
      setSubmittingBranch(true);
      if (editingBranch) {
        await updateBranch(editingBranch.id, values);
        message.success(`Cập nhật chi nhánh "${values.name}" thành công!`);
      } else {
        await createBranch(values);
        message.success(`Thêm mới chi nhánh "${values.name}" thành công!`);
      }
      setIsBranchModalOpen(false);
      loadData();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err.message || 'Lỗi khi lưu chi nhánh');
    } finally {
      setSubmittingBranch(false);
    }
  };

  // Stock Edit Handlers
  const handleOpenEditStock = (item: StockItem) => {
    setEditingStock(item);
    setStockQty(item.quantity);
    setStockMinAlert(item.minAlertStock || 5);
    setIsStockModalOpen(true);
  };

  const handleSaveStock = async () => {
    if (!editingStock) return;
    setSubmittingStock(true);
    try {
      await updateWarehouseStock({
        warehouseId: editingStock.warehouseId,
        productId: editingStock.productId,
        quantity: stockQty,
        minAlertStock: stockMinAlert,
      });
      message.success(`Đã cập nhật tồn kho món "${editingStock.productName}" thành ${stockQty}!`);
      setIsStockModalOpen(false);
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi cập nhật tồn kho');
    } finally {
      setSubmittingStock(false);
    }
  };

  // ==========================================
  // TABLE COLUMNS CONFIGURATIONS
  // ==========================================

  const branchColumns: ColumnsType<Branch> = [
    {
      title: 'Mã & Tên Chi Nhánh',
      key: 'nameInfo',
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#111827]">{record.name}</span>
            <Tag color="emerald" className="font-mono text-xs font-bold">
              {record.code}
            </Tag>
          </div>
          <span className="text-xs text-secondary flex items-center gap-1 mt-0.5">
            <EnvironmentOutlined /> {record.address}
          </span>
        </div>
      ),
    },
    {
      title: 'Hotline / SĐT',
      dataIndex: 'phone',
      key: 'phone',
      render: (val: string) => (
        <span className="text-xs font-mono text-[#111827] flex items-center gap-1">
          <PhoneOutlined className="text-secondary" /> {val}
        </span>
      ),
    },
    {
      title: 'Quản Lý Phụ Trách',
      dataIndex: 'managerName',
      key: 'managerName',
      render: (val: string) => (
        <span className="text-xs font-medium text-[#111827] flex items-center gap-1">
          <UserOutlined className="text-secondary" /> {val || 'Chưa gán'}
        </span>
      ),
    },
    {
      title: 'Các Kho Hàng',
      key: 'warehouses',
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.warehouses && record.warehouses.length > 0 ? (
            record.warehouses.map((w) => (
              <Tag key={w.id} color="blue" className="text-[11px]">
                {w.name}
              </Tag>
            ))
          ) : (
            <span className="text-xs text-secondary italic">Chưa tạo kho</span>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (st: string) => (
        <Tag color={st === 'ACTIVE' ? 'success' : 'default'} className="font-semibold text-xs">
          {st === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Chỉnh sửa chi nhánh">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditBranch(record)}
            className="text-xs"
          >
            Sửa
          </Button>
        </Tooltip>
      ),
    },
  ];

  const stockColumns: ColumnsType<StockItem> = [
    {
      title: 'Sản Phẩm',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.productImage ? (
            <img
              src={record.productImage}
              alt={record.productName}
              className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB]"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
              <InboxOutlined />
            </div>
          )}
          <div>
            <span className="font-semibold text-xs text-[#111827] block">{record.productName}</span>
            <span className="text-[11px] text-secondary">{record.productCategory}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Kho Lưu Trữ',
      key: 'warehouseInfo',
      render: (_, record) => (
        <div>
          <span className="font-medium text-xs text-[#111827] block">{record.warehouseName}</span>
          <span className="text-[11px] text-secondary">{record.branchName}</span>
        </div>
      ),
    },
    {
      title: 'Tồn Kho Thực Tế',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (qty: number) => (
        <span className="font-mono font-bold text-sm text-[#111827]">{qty} cái</span>
      ),
    },
    {
      title: 'Ngưỡng Cảnh Báo',
      dataIndex: 'minAlertStock',
      key: 'minAlertStock',
      align: 'center',
      render: (min: number) => (
        <span className="font-mono text-xs text-secondary">≤ {min || 5} cái</span>
      ),
    },
    {
      title: 'Trạng Thái Tồn',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        if (record.status === 'out_of_stock') {
          return <Tag color="error" className="font-semibold text-xs">Hết hàng (0)</Tag>;
        }
        if (record.status === 'low_stock') {
          return <Tag color="warning" className="font-semibold text-xs">Sắp hết ({record.quantity})</Tag>;
        }
        return <Tag color="success" className="font-semibold text-xs">Còn hàng ({record.quantity})</Tag>;
      },
    },
    {
      title: 'Thao Tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleOpenEditStock(record)}
          className="bg-[#10B981] hover:bg-[#059669] text-xs font-medium"
        >
          Điều chỉnh
        </Button>
      ),
    },
  ];

  const totalWarehousesCount = branches.reduce((sum, b) => sum + (b.warehouses?.length || 0), 0);

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <Title level={3} className="!mb-0 text-[#111827] !font-bold">
            Quản Lý Đa Chi Nhánh &amp; Đa Kho Hàng
          </Title>
          <Text className="text-secondary text-xs mt-1 block">
            Quản lý mạng lưới chi nhánh, kho lưu trữ tại quầy POS và đồng bộ số liệu tồn kho
          </Text>
        </div>

        <div className="flex items-center gap-2.5">
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
            onClick={handleOpenCreateBranch}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg text-xs shadow-xs h-9 flex items-center"
          >
            Thêm Chi Nhánh Mới
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-xs font-bold uppercase tracking-wider">
              Tổng số chi nhánh
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006C49] flex items-center justify-center">
              <ShopOutlined className="text-base" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-[#111827]">
              {branches.length} <span className="text-sm font-normal text-secondary">chi nhánh</span>
            </div>
            <div className="mt-1 text-xs text-emerald-700 font-medium">
              Đang hoạt động trong chuỗi cửa hàng
            </div>
          </div>
        </Card>

        <Card className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-xs font-bold uppercase tracking-wider">
              Tổng số kho hàng
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <InboxOutlined className="text-base" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-[#111827]">
              {totalWarehousesCount} <span className="text-sm font-normal text-secondary">kho</span>
            </div>
            <div className="mt-1 text-xs text-secondary">
              Bao gồm kho quầy bán lẻ &amp; kho lạnh
            </div>
          </div>
        </Card>

        <Card className="border border-[#E5E7EB] shadow-xs rounded-xl hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-xs font-bold uppercase tracking-wider">
              Mặt hàng quản lý kho
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <AppstoreOutlined className="text-base" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold font-mono text-[#111827]">
              {stocks.length} <span className="text-sm font-normal text-secondary">mục kho</span>
            </div>
            <div className="mt-1 text-xs text-secondary">
              Được theo dõi số lượng tồn kho độc lập
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'branches',
              label: (
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <ShopOutlined /> Danh Sách Chi Nhánh Chuỗi
                </span>
              ),
              children: (
                <Table
                  columns={branchColumns}
                  dataSource={branches}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 6 }}
                  className="rounded-xl border border-[#E5E7EB] overflow-hidden mt-2"
                />
              ),
            },
            {
              key: 'stocks',
              label: (
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <InboxOutlined /> Quản Lý Tồn Kho Theo Từng Kho
                </span>
              ),
              children: (
                <div className="space-y-4 mt-2">
                  {/* Filter Toolbar for stocks */}
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB]">
                    <Select
                      placeholder="Lọc theo Chi nhánh"
                      allowClear
                      value={selectedBranchId}
                      onChange={(val) => {
                        setSelectedBranchId(val);
                        setSelectedWarehouseId(undefined);
                      }}
                      className="w-64 text-xs"
                    >
                      {branches.map((b) => (
                        <Select.Option key={b.id} value={b.id}>
                          {b.name}
                        </Select.Option>
                      ))}
                    </Select>

                    <Select
                      placeholder="Lọc theo Kho cụ thể"
                      allowClear
                      value={selectedWarehouseId}
                      onChange={setSelectedWarehouseId}
                      className="w-60 text-xs"
                    >
                      {branches
                        .filter((b) => !selectedBranchId || b.id === selectedBranchId)
                        .flatMap((b) => b.warehouses || [])
                        .map((w) => (
                          <Select.Option key={w.id} value={w.id}>
                            {w.name}
                          </Select.Option>
                        ))}
                    </Select>
                  </div>

                  <Table
                    columns={stockColumns}
                    dataSource={stocks}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8, showTotal: (t) => `Tổng cộng ${t} mục hàng tồn kho` }}
                    className="rounded-xl border border-[#E5E7EB] overflow-hidden"
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Modal Thêm/Sửa Chi Nhánh */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <ShopOutlined className="text-[#006C49]" />
            <span>{editingBranch ? 'Chỉnh Sửa Chi Nhánh' : 'Thêm Chi Nhánh Mới'}</span>
          </div>
        }
        open={isBranchModalOpen}
        onCancel={() => setIsBranchModalOpen(false)}
        onOk={handleSaveBranch}
        confirmLoading={submittingBranch}
        okText={editingBranch ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={520}
      >
        <Form form={branchForm} layout="vertical" className="pt-3">
          <Form.Item
            name="code"
            label={<span className="text-xs font-semibold text-[#111827]">MÃ CHI NHÁNH</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã chi nhánh (ví dụ: CN-Q1, CN-BT)' }]}
          >
            <Input placeholder="CN-Q1" disabled={!!editingBranch} className="font-mono text-xs uppercase" />
          </Form.Item>

          <Form.Item
            name="name"
            label={<span className="text-xs font-semibold text-[#111827]">TÊN CHI NHÁNH</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh' }]}
          >
            <Input placeholder="Artisan Bakery - Chi Nhánh Quận 1" className="text-xs" />
          </Form.Item>

          <Form.Item
            name="address"
            label={<span className="text-xs font-semibold text-[#111827]">ĐỊA CHỈ HOẠT ĐỘNG</span>}
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="123 Đường Đồng Khởi, Bến Nghé, Quận 1, TP.HCM" className="text-xs" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="phone"
              label={<span className="text-xs font-semibold text-[#111827]">SỐ ĐIỆN THOẠI</span>}
              rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
            >
              <Input placeholder="0901 234 567" className="text-xs font-mono" />
            </Form.Item>

            <Form.Item
              name="managerName"
              label={<span className="text-xs font-semibold text-[#111827]">QUẢN LÝ PHỤ TRÁCH</span>}
            >
              <Input placeholder="Nguyễn Văn A" className="text-xs" />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label={<span className="text-xs font-semibold text-[#111827]">TRẠNG THÁI</span>}
          >
            <Select className="text-xs">
              <Select.Option value="ACTIVE">Hoạt động (ACTIVE)</Select.Option>
              <Select.Option value="INACTIVE">Tạm dừng (INACTIVE)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Điều Chỉnh Tồn Kho */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <EditOutlined className="text-[#006C49]" />
            <span>Điều Chỉnh Tồn Kho — {editingStock?.productName}</span>
          </div>
        }
        open={isStockModalOpen}
        onCancel={() => setIsStockModalOpen(false)}
        onOk={handleSaveStock}
        confirmLoading={submittingStock}
        okText="Lưu số lượng"
        cancelText="Hủy"
        width={460}
      >
        {editingStock && (
          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-1">
              <div className="flex justify-between">
                <span className="text-secondary">Kho hàng:</span>
                <span className="font-bold text-[#111827]">{editingStock.warehouseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Chi nhánh:</span>
                <span className="font-medium text-[#111827]">{editingStock.branchName}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-xs text-[#111827] block mb-1.5">
                Số lượng tồn kho thực tế:
              </label>
              <Space.Compact size="large" className="w-full">
                <InputNumber
                  size="large"
                  min={0}
                  max={9999}
                  value={stockQty}
                  onChange={(val) => setStockQty(val || 0)}
                  className="w-full font-mono text-base font-bold"
                />
                <Button disabled size="large" className="!bg-gray-100 !text-gray-600 font-medium !px-3">cái</Button>
              </Space.Compact>
            </div>

            <div>
              <label className="font-semibold text-xs text-secondary block mb-1.5">
                Ngưỡng cảnh báo sắp hết hàng:
              </label>
              <Space.Compact className="w-full">
                <InputNumber
                  min={1}
                  max={100}
                  value={stockMinAlert}
                  onChange={(val) => setStockMinAlert(val || 5)}
                  className="w-full text-xs font-mono"
                />
                <Button disabled className="!bg-gray-100 !text-gray-600 font-medium !px-2.5 text-xs">cái</Button>
              </Space.Compact>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
