'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Card,
  App,
  Typography,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { getProducts, deleteProduct } from '@/lib/api';
import { Product, CATEGORIES } from '@/lib/mock-data';
import { getCurrentUser, hasPermission } from '@/lib/auth';

const { Title, Text } = Typography;

export default function ProductsPage() {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Check PBAC permission
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (!hasPermission(user, 'products:write') && user.role !== 'SUPER_ADMIN') {
      message.error('Bạn không có quyền truy cập trang Quản lý Sản phẩm!');
      router.push('/pos');
    }
  }, [router, message]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      message.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleBranchChange = () => {
      loadData();
    };
    window.addEventListener('artisan_branch_changed', handleBranchChange);
    return () => window.removeEventListener('artisan_branch_changed', handleBranchChange);
  }, []);

  // Filter list
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Tất cả' || p.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'in_stock' && p.stock > 5) ||
      (selectedStatus === 'low_stock' && p.stock > 0 && p.stock <= 5) ||
      (selectedStatus === 'out_of_stock' && p.stock === 0);
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleDelete = (record: Product) => {
    modal.confirm({
      title: 'Xác nhận xóa sản phẩm?',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: (
        <div>
          <p className="text-sm">
            Bạn có chắc chắn muốn xóa sản phẩm <strong>&ldquo;{record.name}&rdquo;</strong>?
          </p>
          <p className="text-xs text-gray-500">
            Hành động này sẽ xóa sản phẩm khỏi hệ thống và không thể hoàn tác.
          </p>
        </div>
      ),
      okText: 'Xóa sản phẩm',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      centered: true,
      onOk: async () => {
        try {
          await deleteProduct(record.id);
          message.success(`Đã xóa thành công sản phẩm "${record.name}"`);
          loadData();
        } catch (err: any) {
          message.error(err.message || 'Không thể xóa sản phẩm');
        }
      },
    });
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (imgUrl: string, record) => (
        <img
          src={imgUrl || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=100&q=80'}
          alt={record.name}
          className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB]"
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <div>
          <span className="font-semibold text-[#111827] block hover:text-[#006C49] cursor-pointer" onClick={() => router.push(`/products/${record.id}/edit`)}>
            {text}
          </span>
          <span className="text-xs text-gray-400 font-mono">Mã: {record.id}</span>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => <Tag color="cyan">{cat}</Tag>,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      sorter: (a, b) => a.price - b.price,
      render: (val: number) => (
        <span className="font-mono font-bold text-[#006C49]">
          {val.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      align: 'center',
      sorter: (a, b) => a.stock - b.stock,
      render: (stock: number) => (
        <span className={`font-mono font-semibold ${stock === 0 ? 'text-red-600' : stock <= 5 ? 'text-amber-600' : 'text-[#111827]'}`}>
          {stock}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        if (record.stock === 0) {
          return <Tag color="error">Hết hàng</Tag>;
        }
        if (record.stock <= 5) {
          return <Tag color="warning">Sắp hết ({record.stock})</Tag>;
        }
        return <Tag color="success">Còn hàng</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined className="text-blue-600" />}
              onClick={() => router.push(`/products/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={3} className="!mb-1 text-[#111827]">
            Quản lý Sản phẩm & Kho Bánh
          </Title>
          <Text className="text-secondary text-sm">
            Danh sách các loại bánh, thức uống, quản lý tồn kho và giá bán
          </Text>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => router.push('/products/new')}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg shadow-xs"
        >
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border border-[#E5E7EB] shadow-xs rounded-xl" styles={{ body: { padding: '16px 20px' } }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <div className="md:col-span-2">
            <Input
              prefix={<SearchOutlined className="text-gray-400 mr-1" />}
              placeholder="Tìm kiếm sản phẩm theo tên, danh mục hoặc mã SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="rounded-lg"
            />
          </div>

          <div>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="w-full"
              options={CATEGORIES.map((cat) => ({ label: cat, value: cat }))}
            />
          </div>

          <div>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="w-full"
              options={[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Còn hàng (>5)', value: 'in_stock' },
                { label: 'Sắp hết kho (1-5)', value: 'low_stock' },
                { label: 'Hết hàng (0)', value: 'out_of_stock' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Product Table */}
      <Card className="border border-[#E5E7EB] shadow-xs rounded-xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (total, range) => `${range[0]}-${range[1]} trong tổng số ${total} sản phẩm`,
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
}
