'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Radio,
  Button,
  Card,
  App,
  Typography,
  Divider,
  Select,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { createUser, getBranches, getRoles } from '@/lib/api';
import { Branch, Role } from '@/lib/mock-data';
import { getCurrentUser, hasPermission } from '@/lib/auth';

const { Title, Text } = Typography;

export default function NewUserPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const selectedRole = Form.useWatch('role', form);

  // Check PBAC permission and load data
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (!hasPermission(user, 'users:manage') && user.role !== 'SUPER_ADMIN') {
      message.error('Bạn không có quyền thêm tài khoản nhân viên mới!');
      router.push('/users');
    }

    Promise.all([getBranches(), getRoles()]).then(([branchList, roleList]) => {
      setBranches(branchList);
      setRoles(roleList);
      if (branchList.length > 0) {
        form.setFieldValue('defaultBranchId', branchList[0].id);
      }
      const staffRole = roleList.find((r) => r.code === 'STAFF') || roleList[0];
      if (staffRole) {
        form.setFieldValue('role', staffRole.id);
      }
    });
  }, [router, form, message]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const selectedRoleObj = roles.find((r) => r.id === values.role || r.code === values.role);
      const roleCode = selectedRoleObj ? selectedRoleObj.code : values.role;
      const roleId = selectedRoleObj ? selectedRoleObj.id : undefined;

      await createUser({
        fullName: values.fullName.trim(),
        username: values.username.trim().toLowerCase(),
        password: values.password,
        email: values.email.trim(),
        phone: values.phone.trim(),
        role: roleCode,
        roleId: roleId,
        status: 'ACTIVE',
        defaultBranchId: roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN' ? null : values.defaultBranchId,
      } as any);

      message.success('Tạo tài khoản nhân viên mới thành công!');
      router.push('/users');
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.message || 'Lỗi khi tạo tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  const isChainWideRole = (roleValueOrId: string) => {
    const r = roles.find((role) => role.id === roleValueOrId || role.code === roleValueOrId);
    return r?.code === 'SUPER_ADMIN' || r?.code === 'ADMIN';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/users')}
            className="rounded-lg"
          >
            Quay lại
          </Button>
          <div>
            <Title level={3} className="!mb-0 text-[#111827]">
              Tạo Tài Khoản Nhân Sự Mới (PBAC)
            </Title>
            <Text className="text-secondary text-xs">
              Cấp tài khoản đăng nhập và chỉ định vai trò phân quyền nguyên tử
            </Text>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border border-[#E5E7EB] shadow-xs rounded-xl" styles={{ body: { padding: '28px 32px' } }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <div className="space-y-4">
            <Form.Item
              label={<span className="font-semibold text-xs uppercase text-secondary">Họ và tên nhân viên</span>}
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400 mr-1" />}
                placeholder="Ví dụ: Hoàng Thị Ánh Tuyết"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="font-semibold text-xs uppercase text-secondary">Tên đăng nhập (Username)</span>}
                name="username"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username chỉ gồm chữ, số và dấu gạch dưới!' },
                ]}
              >
                <Input
                  placeholder="ví dụ: tuyetht"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-xs uppercase text-secondary">Mật khẩu tạm thời</span>}
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu tạm!' }]}
                initialValue="Abc@12345"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400 mr-1" />}
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="font-semibold text-xs uppercase text-secondary">Địa chỉ Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không đúng định dạng!' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400 mr-1" />}
                  placeholder="nhanvien@artisanbakery.vn"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-xs uppercase text-secondary">Số điện thoại liên hệ</span>}
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400 mr-1" />}
                  placeholder="0912345678"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="font-semibold text-xs uppercase text-secondary">Gán Vai Trò (PBAC Role)</span>}
              name="role"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò cho nhân viên!' }]}
            >
              <Radio.Group className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {roles.map((r) => (
                  <Radio.Button
                    key={r.id}
                    value={r.id}
                    className="h-auto p-3 rounded-xl text-left flex items-start gap-2 border border-[#E5E7EB]"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#111827]">
                          {r.name}
                        </span>
                        <code className="text-[10px] font-mono bg-gray-100 px-1 rounded text-gray-600">
                          {r.code}
                        </code>
                      </div>
                      <span className="text-xs text-secondary block mt-0.5">
                        {r.description || `${r.permissions.length} quyền nguyên tử`}
                      </span>
                    </div>
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>

            {/* Branch Assignment (only if not chain-wide role) */}
            {!isChainWideRole(selectedRole) && (
              <Form.Item
                label={
                  <span className="font-semibold text-xs uppercase text-secondary">
                    Chi nhánh làm việc được chỉ định
                  </span>
                }
                name="defaultBranchId"
                rules={[{ required: true, message: 'Vui lòng chọn chi nhánh làm việc!' }]}
                help="Nhân viên sẽ được phân công làm việc và chốt ca tại chi nhánh này"
              >
                <Select
                  size="large"
                  placeholder="Chọn chi nhánh phân công"
                  className="rounded-lg"
                  options={branches.map((b: Branch) => ({
                    label: `${b.name} (${b.code})`,
                    value: b.id,
                  }))}
                />
              </Form.Item>
            )}
          </div>

          <Divider className="!my-6" />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button size="large" onClick={() => router.push('/users')} className="rounded-lg">
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              icon={<SaveOutlined />}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg px-8"
            >
              Tạo tài khoản
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
