"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { createProduct } from "@/lib/api";
import { CATEGORIES } from "@/lib/mock-data";
import DetailHeader from "@/app/components/detail-header";
import { usePageGuard } from "@/app/hooks/use-page-guard";

const { TextArea } = Input;

export default function NewProductPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
  );

  usePageGuard({
    permission: "products:write",
    deniedMessage: "Bạn không có quyền thêm sản phẩm mới!",
  });

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const stock = Number(values.stock) || 0;
      let status: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
      if (stock === 0) status = "out_of_stock";
      else if (stock <= 5) status = "low_stock";

      await createProduct({
        name: values.name.trim(),
        category: values.category,
        price: Number(values.price),
        stock,
        description: values.description?.trim() || "",
        image: values.image?.trim() || previewImage,
        status,
      });

      message.success("Thêm sản phẩm mới thành công!");
      router.push("/products");
    } catch (err: any) {
      message.error(
        err.response?.data?.detail ||
          err.message ||
          "Không thể tạo sản phẩm mới",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const sampleImages = [
    {
      label: "Croissant Bơ",
      url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
    },
    {
      label: "Sourdough Artisan",
      url: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&q=80",
    },
    {
      label: "Pain au Chocolat",
      url: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&q=80",
    },
    {
      label: "Baguette Pháp",
      url: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=80",
    },
    {
      label: "Bánh Kem Matcha",
      url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    },
    {
      label: "Cà Phê Muối",
      url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <DetailHeader
        title="Thêm Sản Phẩm Mới"
        subtitle="Nhập các thông tin chi tiết của bánh hoặc thức uống vào kho hàng"
        onBack={() => router.push("/products")}
      />

      {/* Form Card */}
      <Card
        className="border border-[#E5E7EB] shadow-xs rounded-xl"
        styles={{ body: { padding: "28px 32px" } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: "Bánh Mì Ngọt & Pastry",
            price: 35000,
            stock: 20,
            image: previewImage,
          }}
          requiredMark="optional"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cột trái: Form nhập liệu (2/3) */}
            <div className="md:col-span-2 space-y-4">
              <Form.Item
                label={
                  <span className="font-semibold text-xs uppercase text-secondary">
                    Tên sản phẩm
                  </span>
                }
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                ]}
              >
                <Input
                  placeholder="Ví dụ: Bánh Mì Hoa Cúc Pháp"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  label={
                    <span className="font-semibold text-xs uppercase text-secondary">
                      Danh mục bánh
                    </span>
                  }
                  name="category"
                  rules={[
                    { required: true, message: "Vui lòng chọn danh mục!" },
                  ]}
                >
                  <Select
                    size="large"
                    options={CATEGORIES.filter((c) => c !== "Tất cả").map(
                      (c) => ({ label: c, value: c }),
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-semibold text-xs uppercase text-secondary">
                      Đơn giá bán (VNĐ)
                    </span>
                  }
                  name="price"
                  rules={[
                    { required: true, message: "Vui lòng nhập đơn giá!" },
                  ]}
                >
                  <Space.Compact size="large" className="w-full">
                    <InputNumber
                      size="large"
                      min={1000}
                      step={1000}
                      formatter={(val) =>
                        `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      className="w-full rounded-l-lg"
                    />
                    <Button
                      disabled
                      size="large"
                      className="!bg-gray-100 !text-gray-600 font-medium !px-3"
                    >
                      ₫
                    </Button>
                  </Space.Compact>
                </Form.Item>
              </div>

              <Form.Item
                label={
                  <span className="font-semibold text-xs uppercase text-secondary">
                    Số lượng tồn kho nhập ban đầu
                  </span>
                }
                name="stock"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số lượng tồn kho!",
                  },
                ]}
              >
                <Space.Compact size="large" className="w-full sm:w-1/2">
                  <InputNumber
                    size="large"
                    min={0}
                    step={1}
                    className="w-full rounded-l-lg"
                  />
                  <Button
                    disabled
                    size="large"
                    className="!bg-gray-100 !text-gray-600 font-medium !px-3"
                  >
                    cái
                  </Button>
                </Space.Compact>
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-semibold text-xs uppercase text-secondary">
                    URL Hình ảnh đại diện
                  </span>
                }
                name="image"
                rules={[{ required: true, message: "Vui lòng nhập URL ảnh!" }]}
              >
                <Input
                  placeholder="https://images.unsplash.com/..."
                  size="large"
                  onChange={(e) => setPreviewImage(e.target.value)}
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-semibold text-xs uppercase text-secondary">
                    Mô tả & Thành phần nguyên liệu
                  </span>
                }
                name="description"
              >
                <TextArea
                  rows={4}
                  placeholder="Mô tả hương vị bánh, thành phần bột bơ cao cấp hoặc hạn sử dụng..."
                  className="rounded-lg"
                />
              </Form.Item>

              {/* Gợi ý ảnh nhanh */}
              <div>
                <span className="text-xs text-secondary font-medium block mb-2">
                  Chọn nhanh ảnh mẫu demo:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        form.setFieldValue("image", img.url);
                        setPreviewImage(img.url);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] hover:border-[#10B981] hover:text-[#006C49] transition-all cursor-pointer"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cột phải: Xem trước thẻ sản phẩm (1/3) */}
            <div className="flex flex-col items-center">
              <span className="font-semibold text-xs uppercase text-secondary block mb-3 w-full text-center">
                Xem trước giao diện thẻ
              </span>
              <div className="w-full max-w-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-3.5 shadow-xs">
                <div className="w-full h-44 rounded-lg overflow-hidden mb-3 bg-gray-200">
                  <img
                    src={
                      previewImage ||
                      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80"
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80";
                    }}
                  />
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                  {form.getFieldValue("category") || "Bánh Mì Ngọt & Pastry"}
                </span>
                <h4 className="font-bold text-sm text-[#111827] mt-0.5 truncate">
                  {form.getFieldValue("name") || "Tên bánh mẫu"}
                </h4>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-[#E5E7EB]">
                  <span className="text-sm font-bold text-[#006C49] font-mono">
                    {(form.getFieldValue("price") || 35000).toLocaleString(
                      "vi-VN",
                    )}{" "}
                    ₫
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                    Tồn: {form.getFieldValue("stock") || 20}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Divider className="!my-6" />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              size="large"
              onClick={() => router.push("/products")}
              className="rounded-lg"
            >
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
              Lưu sản phẩm
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
