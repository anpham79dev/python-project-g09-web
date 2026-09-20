'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '@/lib/api';
import { setAuthSession } from '@/lib/auth';

const { Title } = Typography;

export default function LoginPage() {
  const router = useRouter();
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs mb-2">
            <span className="text-[#006C49] font-bold text-lg font-serif">A</span>
          </div>
          <Title level={3} className="!mb-0.5 text-[#006C49] !font-bold">
            Artisan Bakery
          </Title>
          <p className="text-xs text-gray-500 m-0 mt-0.5">
            Hệ thống Quản lý Đơn hàng & Điểm Bán hàng (POS)
          </p>
        </div>

        {/* Login Card */}
        <Card
          className="shadow-xs border border-[#E5E7EB] rounded-2xl"
          styles={{ body: { padding: '28px 24px' } }}
        >
          <div className="mb-5">
            <Title level={4} className="!mb-0 text-[#111827] !font-bold">
              Đăng nhập
            </Title>
          </div>

          {errorMessage && (
            <Alert
              title={errorMessage}
              type="error"
              showIcon
              closable
              className="mb-4 rounded-lg text-xs"
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
              className="mb-4"
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
              className="mb-5"
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400 mr-1" />}
                placeholder="Nhập mật khẩu"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item className="mb-5">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                className="bg-[#006C49] hover:bg-[#059669] text-white font-semibold h-10 rounded-lg text-sm"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          {/* Quick Demo Accounts */}
          <div className="pt-2 border-t border-[#F3F4F6]">
            <div className="text-[11px] font-medium text-gray-400 mb-2">
              Tài khoản demo
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <button
                type="button"
                onClick={() => fillQuickAccount('superadmin')}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 hover:border-emerald-300 rounded-lg transition-colors text-left cursor-pointer group"
              >
                <span className="text-xs font-semibold text-[#111827] group-hover:text-[#006C49]">SuperAdmin</span>
                <span className="text-[11px] font-mono text-gray-400">superadmin</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('admin')}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 hover:border-emerald-300 rounded-lg transition-colors text-left cursor-pointer group"
              >
                <span className="text-xs font-semibold text-[#111827] group-hover:text-[#006C49]">Quản lý</span>
                <span className="text-[11px] font-mono text-gray-400">admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('staff')}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 hover:border-emerald-300 rounded-lg transition-colors text-left cursor-pointer group"
              >
                <span className="text-xs font-semibold text-[#111827] group-hover:text-[#006C49]">Thu ngân</span>
                <span className="text-[11px] font-mono text-gray-400">staff</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
