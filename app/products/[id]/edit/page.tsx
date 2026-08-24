'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  App,
  Divider,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { getProductById, updateProduct } from '@/lib/api';
import { CATEGORIES } from '@/lib/mock-data';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import PageLoading from '@/app/components/page-loading';
import DetailHeader from '@/app/components/detail-header';

const { TextArea } = Input;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { message } = App.useApp();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  // Check PBAC permission
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (!hasPermission(user, 'products:write') && user.role !== 'SUPER_ADMIN') {
      message.error('Bạn không có quyền chỉnh sửa sản phẩm!');
      router.push('/pos');
    }
  }, [router, message]);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        form.setFieldsValue(data);
        setPreviewImage(data.image);
      } catch {
        message.error('Không tìm thấy sản phẩm cần sửa!');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, form, router]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const stock = Number(values.stock) || 0;
      let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (stock === 0) status = 'out_of_stock';
      else if (stock <= 5) status = 'low_stock';

      await updateProduct(id, {
        name: values.name.trim(),
        category: values.category,
        price: Number(values.price),
        stock,
        description: values.description?.trim() || '',
        image: values.image?.trim() || previewImage,
        status,
      });

      message.success('Cập nhật sản phẩm thành công!');
      router.push('/products');
    } catch (err: any) {
      message.error(err.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoading description="Đang tải thông tin sản phẩm..." className="flex-1 flex flex-col items-center justify-center min-h-[60vh]" />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <DetailHeader
        title="Chỉnh Sửa Sản Phẩm"
        subtitle={
          <>
            Mã sản phẩm: <span className="font-mono font-bold text-[#006C49]">{id}</span>
          </>
        }
        onBack={() => router.push('/products')}
      />

      {/* Form Card */}
      <Card className="border border-[#E5E7EB] shadow-xs rounded-xl" styles={{ body: { padding: '28px 32px' } }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cột trái: Form nhập liệu (2/3) */}
            <div className="md:col-span-2 space-y-4">
              <Form.Item
                label={<span className="font-semibold text-xs uppercase text-secondary">Tên sản phẩm</span>}
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
              >
                <Input
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  label={<span className="font-semibold text-xs uppercase text-secondary">Danh mục bánh</span>}
                  name="category"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                >
                  <Select
                    size="large"
                    options={CATEGORIES.filter((c) => c !== 'Tất cả').map((c) => ({ label: c, value: c }))}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold text-xs uppercase text-secondary">Đơn giá bán (VNĐ)</span>}
                  name="price"
                  rules={[{ required: true, message: 'Vui lòng nhập đơn giá!' }]}
                >
                  <Space.Compact size="large" className="w-full">
                    <InputNumber
                      size="large"
                      min={1000}
                      step={1000}
                      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      className="w-full rounded-l-lg"
                    />
                    <Button disabled size="large" className="!bg-gray-100 !text-gray-600 font-medium !px-3">₫</Button>
                  </Space.Compact>
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  label={<span className="font-semibold text-xs uppercase text-secondary">Số lượng tồn kho</span>}
                  name="stock"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho!' }]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    step={1}
                    className="w-full rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold text-xs uppercase text-secondary">URL Hình ảnh</span>}
                  name="image"
                  rules={[{ required: true, message: 'Vui lòng nhập URL ảnh!' }]}
                >
                  <Input
                    size="large"
                    onChange={(e) => setPreviewImage(e.target.value)}
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>

              <Form.Item
                label={<span className="font-semibold text-xs uppercase text-secondary">Mô tả & Thành phần nguyên liệu</span>}
                name="description"
              >
                <TextArea
                  rows={4}
                  className="rounded-lg"
                />
              </Form.Item>
            </div>

            {/* Cột phải: Xem trước thẻ sản phẩm (1/3) */}
            <div className="flex flex-col items-center">
              <span className="font-semibold text-xs uppercase text-secondary block mb-3 w-full text-center">
                Hình ảnh sản phẩm
              </span>
              <div className="w-full max-w-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-3.5 shadow-xs">
                <div className="w-full h-44 rounded-lg overflow-hidden mb-3 bg-gray-200">
                  <img
                    src={previewImage || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                  {form.getFieldValue('category')}
                </span>
                <h4 className="font-bold text-sm text-[#111827] mt-0.5 truncate">
                  {form.getFieldValue('name')}
                </h4>
              </div>
            </div>
          </div>

          <Divider className="!my-6" />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button size="large" onClick={() => router.push('/products')} className="rounded-lg">
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
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
