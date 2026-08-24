'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, ShoppingOutlined, ArrowRightOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { login } from '@/lib/api';
import { setAuthSession } from '@/lib/auth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFinish = async (values: { username: string; password?: string }) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await login(values);
      setAuthSession(response.user, response.token);
      const userPerms = response.user.permissions || [];
      const canViewDashboard = response.user.role === 'SUPER_ADMIN' || userPerms.includes('dashboard:view');
      window.location.href = canViewDashboard ? '/dashboard' : '/pos';
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (username: string) => {
    form.setFieldsValue({
      username,
      password: 'password123',
    });
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F9FA] via-[#E8F5E9] to-[#F1F8F5] p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#10B981] text-white shadow-lg mb-3">
            <ShoppingOutlined className="text-3xl" />
          </div>
          <Title level={2} className="!mb-1 text-[#006C49] !font-bold">
            Artisan Bakery
          </Title>
          <Text className="text-secondary text-sm">
            Hệ thống Quản lý Đơn hàng & Điểm Bán hàng (POS)
          </Text>
        </div>

        {/* Login Card */}
        <Card
          className="shadow-md border border-[#E5E7EB] rounded-2xl"
          styles={{ body: { padding: '32px 28px' } }}
        >
          <div className="mb-6">
            <Title level={4} className="!mb-1 text-[#111827]">
              Đăng nhập tài khoản
            </Title>
            <Text className="text-secondary text-xs">
              Nhập thông tin xác thực để bắt đầu phiên làm việc
            </Text>
          </div>

          {errorMessage && (
            <Alert
              title={errorMessage}
              type="error"
              showIcon
              closable
              className="mb-5 rounded-lg text-xs"
              onClose={() => setErrorMessage(null)}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{ username: 'admin', password: 'password123' }}
            requiredMark={false}
          >
            <Form.Item
              label={<span className="text-xs font-semibold uppercase text-secondary">Tên đăng nhập</span>}
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400 mr-1" />}
                placeholder="Ví dụ: superadmin, admin hoặc staff"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-semibold uppercase text-secondary">Mật khẩu</span>}
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400 mr-1" />}
                placeholder="Nhập mật khẩu"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item className="mt-6 mb-3">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                icon={<ArrowRightOutlined />}
                className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold h-11 rounded-lg"
              >
                Đăng nhập hệ thống
              </Button>
            </Form.Item>
          </Form>

          <Divider plain className="!my-4 !text-xs !text-gray-400">
            Tài khoản mẫu thử nghiệm
          </Divider>

          <div className="grid grid-cols-3 gap-2">
            <Button
              size="small"
              onClick={() => fillQuickAccount('superadmin')}
              className="rounded-lg border-purple-200 text-purple-800 bg-purple-50 hover:bg-purple-100 font-medium text-xs py-3 flex items-center justify-center gap-1"
            >
              <SafetyCertificateOutlined /> SuperAdmin
            </Button>
            <Button
              size="small"
              onClick={() => fillQuickAccount('admin')}
              className="rounded-lg border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-medium text-xs py-3 flex items-center justify-center gap-1"
            >
              <SafetyCertificateOutlined /> Admin (Quản lý)
            </Button>
            <Button
              size="small"
              onClick={() => fillQuickAccount('staff')}
              className="rounded-lg border-blue-200 text-blue-800 bg-blue-50 hover:bg-blue-100 font-medium text-xs py-3 flex items-center justify-center gap-1"
            >
              <UserOutlined /> Staff (Thu ngân)
            </Button>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-center mt-6">
          <Text className="text-xs text-gray-500">
            Phiên bản đồ án FE Next.js 15 • Mock Mode: {process.env.NEXT_PUBLIC_USE_MOCK !== 'false' ? 'BẬT (Local Mock)' : 'TẮT (FastAPI)'}
          </Text>
        </div>
      </div>
    </div>
  );
}
