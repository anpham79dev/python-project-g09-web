'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Input,
  Tag,
  Card,
  App,
  Typography,
  Modal,
  Form,
  Select,
  Popconfirm,
  Divider,
  Radio,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  LockOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { getUsers, updateUser, deleteUser, getBranches, getRoles } from '@/lib/api';
import { User, Branch, Role } from '@/lib/types';
import { getCurrentUser, hasPermission } from '@/lib/auth';

const { Title, Text } = Typography;

export default function UsersPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const roleValue = Form.useWatch('role', form);

  const currentUser = getCurrentUser();
  const canManageUsers = hasPermission(currentUser, 'users:manage');

  // Check PBAC permission
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (!hasPermission(user, 'users:read') && user.role !== 'SUPER_ADMIN') {
      message.error('Bạn không có quyền truy cập trang Quản lý Nhân sự!');
      router.push('/pos');
    }
  }, [router, message]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, branchesData, rolesData] = await Promise.all([
        getUsers(),
        getBranches(),
        getRoles(),
      ]);
      setUsers(usersData);
      setBranches(branchesData);
      setRoles(rolesData);
    } catch (err: any) {
      message.error('Lỗi khi tải dữ liệu người dùng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    const matchedRole = roles.find((r) => r.id === user.roleId || r.code === user.role);
    form.resetFields();
    form.setFieldsValue({
      fullName: user.fullName || '',
      email: user.email || (user as any).user_email || '',
      phone: user.phone || (user as any).phone_number || (user as any).hotline || '',
      role: matchedRole ? matchedRole.id : user.role,
      defaultBranchId: user.defaultBranchId || null,
      status: user.status,
      password: '',
    });
    setIsEditModalVisible(true);
  };

  useEffect(() => {
    if (isEditModalVisible && selectedUser) {
      const matchedRole = roles.find((r) => r.id === selectedUser.roleId || r.code === selectedUser.role);
      form.setFieldsValue({
        fullName: selectedUser.fullName || '',
        email: selectedUser.email || (selectedUser as any).user_email || '',
        phone: selectedUser.phone || (selectedUser as any).phone_number || (selectedUser as any).hotline || '',
        role: matchedRole ? matchedRole.id : selectedUser.role,
        defaultBranchId: selectedUser.defaultBranchId || null,
        status: selectedUser.status,
        password: '',
      });
    }
  }, [isEditModalVisible, selectedUser, roles, form]);

  const handleUpdateUser = async (values: any) => {
    if (!selectedUser) return;
    setSubmitLoading(true);
    try {
      const dataToUpdate: any = { ...values };
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }

      // Check if selected role is an ID or Code
      const selectedRoleObj = roles.find((r) => r.id === values.role || r.code === values.role);
      if (selectedRoleObj) {
        dataToUpdate.role_id = selectedRoleObj.id;
        dataToUpdate.role = selectedRoleObj.code;
      }

      await updateUser(selectedUser.id, dataToUpdate);
      message.success('Cập nhật thông tin nhân viên thành công!');
      setIsEditModalVisible(false);
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || error?.message || 'Lỗi khi cập nhật nhân viên');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.status === 'ACTIVE') {
        await deleteUser(user.id);
        message.success('Đã khóa tài khoản nhân viên');
      } else {
        await updateUser(user.id, { status: 'ACTIVE' });
        message.success('Đã mở khóa tài khoản nhân viên');
      }
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || error?.message || 'Lỗi khi thay đổi trạng thái');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  const columns: ColumnsType<User> = [
    {
      title: 'Nhân viên',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#10B981]/15 text-[#006C49] font-bold flex items-center justify-center text-sm shrink-0">
            {record.fullName.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-sm text-[#111827] block">
              {record.fullName}
            </span>
            <span className="text-xs text-secondary font-mono">@{record.username}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-0.5 text-xs text-secondary">
          <div className="flex items-center gap-1.5">
            <MailOutlined className="text-gray-400" />
            <span>{record.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <PhoneOutlined className="text-gray-400" />
            <span className="font-mono">{record.phone}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò (PBAC Role)',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      render: (roleCode: string, record: User) => {
        const matchedRole = roles.find((r) => r.id === record.roleId || r.code === roleCode);
        const displayName = matchedRole?.name || record.roleName || (roleCode === 'SUPER_ADMIN' ? 'Tổng Quản Trị' : roleCode === 'ADMIN' ? 'Quản Trị Viên' : 'Thu Ngân');
        const permCount = matchedRole ? matchedRole.permissions.length : (record.permissions ? record.permissions.length : 0);

        let color = 'blue';
        if (roleCode === 'SUPER_ADMIN') color = 'gold';
        else if (roleCode === 'ADMIN') color = 'purple';
        else if (matchedRole && !matchedRole.is_system) color = 'cyan';

        return (
          <Tooltip title={`Quyền hạn: ${permCount} quyền nguyên tử (${roleCode})`}>
            <Tag color={color} className="px-2.5 py-0.5 text-xs font-semibold cursor-pointer">
              {roleCode === 'SUPER_ADMIN' ? (
                <LockOutlined className="mr-1" />
              ) : roleCode === 'ADMIN' ? (
                <SafetyCertificateOutlined className="mr-1" />
              ) : (
                <UserOutlined className="mr-1" />
              )}
              {displayName}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Chi Nhánh Phụ Trách',
      key: 'branch',
      render: (_, record) => {
        if (record.role === 'SUPER_ADMIN' || record.role === 'ADMIN') {
          return (
            <Tag color="gold" className="text-xs font-medium inline-flex items-center gap-1">
              <ShopOutlined /> Toàn Chuỗi
            </Tag>
          );
        }
        return (
          <span className="text-xs text-[#111827] font-medium inline-flex items-center gap-1">
            <ShopOutlined className="text-emerald-600 text-xs" />
            <span>{record.defaultBranchName || 'Chưa gán chi nhánh'}</span>
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => {
        if (status === 'ACTIVE') {
          return (
            <Tag color="green" className="px-2 py-0.5 text-xs font-medium">
              <CheckCircleOutlined className="mr-1" /> Đang hoạt động
            </Tag>
          );
        }
        return (
          <Tag color="red" className="px-2 py-0.5 text-xs font-medium">
            <StopOutlined className="mr-1" /> Đã khóa
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        if (record.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
          return <span className="text-xs text-gray-400 italic">Bảo vệ</span>;
        }

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-blue-600" />}
              onClick={() => handleEdit(record)}
              className="hover:bg-blue-50"
            >
              Sửa
            </Button>
            {record.username !== 'superadmin' && record.username !== 'admin' && (
              <Popconfirm
                title={record.status === 'ACTIVE' ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản này?'}
                description={
                  record.status === 'ACTIVE'
                    ? 'Nhân viên sẽ không thể đăng nhập vào hệ thống.'
                    : 'Nhân viên sẽ có thể tiếp tục đăng nhập và làm việc.'
                }
                onConfirm={() => handleToggleStatus(record)}
                okText={record.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                cancelText="Hủy"
                okButtonProps={{ danger: record.status === 'ACTIVE' }}
              >
                <Button
                  type="text"
                  size="small"
                  icon={
                    record.status === 'ACTIVE' ? (
                      <StopOutlined className="text-red-500" />
                    ) : (
                      <CheckCircleOutlined className="text-emerald-600" />
                    )
                  }
                  className={record.status === 'ACTIVE' ? 'hover:bg-red-50' : 'hover:bg-emerald-50'}
                >
                  {record.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                </Button>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-xs">
        <div>
          <Title level={3} className="!mb-1 text-[#111827]">
            Quản Lý Nhân Sự & Phân Quyền Tài Khoản
          </Title>
          <Text className="text-secondary text-xs">
            Danh sách nhân viên, vai trò truy cập và chi nhánh làm việc
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="default"
            icon={<KeyOutlined />}
            onClick={() => router.push('/settings/roles')}
          >
            Quản Lý Vai Trò
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/users/new')}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg"
          >
            Thêm nhân viên mới
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border border-[#E5E7EB] shadow-xs rounded-xl" styles={{ body: { padding: '20px' } }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <Input
            placeholder="Tìm theo tên, username, email, số điện thoại..."
            prefix={<SearchOutlined className="text-gray-400 mr-1" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md rounded-lg"
            allowClear
          />
          <div className="text-xs text-secondary">
            Tổng cộng: <strong className="text-gray-900">{filteredUsers.length}</strong> nhân viên
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          className="artisan-table"
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-semibold">
            <EditOutlined className="text-emerald-700" />
            <span>Chỉnh sửa thông tin nhân viên</span>
          </div>
        }
        open={isEditModalVisible}
        destroyOnClose
        forceRender
        footer={null}
        onCancel={() => setIsEditModalVisible(false)}
        width={560}
      >
        <Form
          form={form}
          initialValues={selectedUser ? {
            fullName: selectedUser.fullName || '',
            email: selectedUser.email || (selectedUser as any).user_email || '',
            phone: selectedUser.phone || (selectedUser as any).phone_number || (selectedUser as any).hotline || '',
            role: roles.find((r) => r.id === selectedUser.roleId || r.code === selectedUser.role)?.id || selectedUser.role,
            defaultBranchId: selectedUser.defaultBranchId || null,
            status: selectedUser.status,
            password: '',
          } : undefined}
          layout="vertical"
          onFinish={handleUpdateUser}
          className="mt-4"
          requiredMark="optional"
        >
          <Form.Item
            label={<span className="font-semibold text-xs uppercase text-secondary">Họ và tên</span>}
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input className="rounded-lg" size="large" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-semibold text-xs uppercase text-secondary">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input className="rounded-lg" size="large" />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold text-xs uppercase text-secondary">Số điện thoại</span>}
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input className="rounded-lg" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-semibold text-xs uppercase text-secondary">Gán Vai trò (PBAC Role)</span>}
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select
              size="large"
              className="rounded-lg"
              options={roles.map((r) => ({
                label: `${r.name} (${r.code}) - ${r.permissions.length} quyền`,
                value: r.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold text-xs uppercase text-secondary">Chi nhánh phân công</span>}
            name="defaultBranchId"
          >
            <Select
              size="large"
              placeholder="Chọn chi nhánh làm việc (Để trống nếu phụ trách toàn chuỗi)"
              className="rounded-lg"
              allowClear
              options={branches.map((b) => ({
                label: `${b.name} (${b.code})`,
                value: b.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold text-xs uppercase text-secondary">Đổi mật khẩu mới</span>}
            name="password"
            help="Để trống nếu không muốn thay đổi mật khẩu hiện tại"
          >
            <Input.Password placeholder="Nhập mật khẩu mới..." className="rounded-lg" size="large" />
          </Form.Item>

          <Divider className="!my-4" />

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsEditModalVisible(false)} className="rounded-lg">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg px-6"
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
