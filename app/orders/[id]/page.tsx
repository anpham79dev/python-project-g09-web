"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Button, Tag, Table, Divider, Spin, App, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { getOrderDetail } from "@/lib/api";
import { Order, OrderItem } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/auth";

const { Title, Text } = Typography;

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { message } = App.useApp();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getOrderDetail(id);
        setOrder(data);
      } catch {
        message.error("Không tìm thấy thông tin đơn hàng!");
        router.push("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, router]);

  const itemColumns: ColumnsType<OrderItem> = [
    {
      title: "Món bánh / Đồ uống",
      key: "product",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={
              record.image ||
              "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=100&q=80"
            }
            alt={record.productName}
            className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB]"
          />
          <div>
            <span className="font-semibold text-sm text-[#111827] block">
              {record.productName}
            </span>
            <span className="text-xs text-secondary font-mono">
              Mã SP: {record.productId}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price: number) => (
        <span className="font-mono text-sm text-secondary">
          {price.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (qty: number) => (
        <span className="font-bold text-sm text-[#111827] px-3 py-1 bg-gray-100 rounded-lg">
          {qty}
        </span>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right",
      render: (sub: number) => (
        <span className="font-mono font-bold text-sm text-[#006C49]">
          {sub.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Spin size="large" description="Đang tải chi tiết đơn hàng..." />
      </div>
    );
  }

  if (!order) return null;

  const dateObj = new Date(order.createdAt);

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/orders")}
            className="rounded-lg"
          >
            Quay lại
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Title level={3} className="!mb-0 text-[#111827]">
                Chi Tiết Đơn Hàng
              </Title>
              <Tag color="success" className="text-xs px-2 py-0.5">
                {order.status === "COMPLETED" ? "Đã hoàn thành" : order.status}
              </Tag>
            </div>
            <Text className="text-secondary text-xs font-mono">
              Mã hóa đơn:{" "}
              <strong className="text-[#006C49]">{order.code}</strong>
            </Text>
          </div>
        </div>

        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg shadow-xs"
        >
          In hóa đơn
        </Button>
      </div>

      {/* Main Order Container */}
      <Card
        className="border border-[#E5E7EB] shadow-xs rounded-xl overflow-hidden"
        styles={{ body: { padding: "28px 32px" } }}
      >
        {/* Order Meta Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] mb-6 text-xs">
          <div>
            <span className="text-secondary font-medium block mb-1">
              <ClockCircleOutlined className="mr-1" /> Thời gian tạo:
            </span>
            <span className="font-semibold text-[#111827] block">
              {dateObj.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              - {dateObj.toLocaleDateString("vi-VN")}
            </span>
          </div>

          <div>
            <span className="text-secondary font-medium block mb-1">
              <UserOutlined className="mr-1" /> Khách hàng:
            </span>
            <span className="font-semibold text-[#111827] block">
              {order.customerName || "Khách vãng lai"}
            </span>
            {order.customerPhone && (
              <span className="text-gray-500 font-mono">
                {order.customerPhone}
              </span>
            )}
          </div>

          <div>
            <span className="text-secondary font-medium block mb-1">
              <UserOutlined className="mr-1" /> Thu ngân phụ trách:
            </span>
            <span className="font-semibold text-[#111827] block">
              {order.staffName}
            </span>
          </div>

          <div>
            <span className="text-secondary font-medium block mb-1">
              Hình thức thanh toán:
            </span>
            <Tag
              color={
                order.paymentMethod === "QR_TRANSFER"
                  ? "cyan"
                  : order.paymentMethod === "CASH"
                    ? "green"
                    : "blue"
              }
            >
              {order.paymentMethod === "QR_TRANSFER"
                ? "Chuyển khoản QR"
                : order.paymentMethod === "CASH"
                  ? "Tiền mặt"
                  : "Thẻ POS"}
            </Tag>
          </div>
        </div>

        {order.note && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
            <FileTextOutlined className="text-amber-600" />
            <span>
              <strong>Ghi chú đơn hàng:</strong> {order.note}
            </span>
          </div>
        )}

        {/* Order Items Table */}
        <div className="mb-6">
          <h4 className="font-bold text-sm text-[#111827] uppercase tracking-wider mb-3">
            Danh sách món đã đặt (
            {order.items.reduce((s, i) => s + i.quantity, 0)} món)
          </h4>
          <Table
            columns={itemColumns}
            dataSource={order.items}
            rowKey="productId"
            pagination={false}
            bordered
            className="rounded-lg overflow-hidden"
          />
        </div>

        <Divider className="!my-6" />

        {/* Order Payment Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-2 text-sm">
            <div className="flex justify-between text-secondary">
              <span>Tạm tính tiền hàng:</span>
              <span className="font-mono font-semibold text-[#111827]">
                {order.subtotal.toLocaleString("vi-VN")} ₫
              </span>
            </div>

            <div className="flex justify-between text-secondary">
              <span>Chiết khấu / Giảm giá:</span>
              <span className="font-mono font-semibold text-red-600">
                - {order.discount.toLocaleString("vi-VN")} ₫
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-[#E5E7EB]">
              <span className="font-bold text-base text-[#111827]">
                TỔNG THANH TOÁN:
              </span>
              <span className="text-2xl font-bold text-[#006C49] font-mono">
                {order.totalAmount.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* KHỐI HÓA ĐƠN CHUYÊN DÙNG ĐỂ IN (Ẩn trên màn hình, chỉ hiển thị khi in) */}
      <div
        id="order-detail-printable-receipt"
        className="hidden font-mono text-black"
      >
        <div className="text-center pb-2 border-b border-dashed border-black">
          <h2 className="text-base font-bold uppercase tracking-wider mb-0.5">
            ARTISAN BAKERY
          </h2>
          <p className="text-[10px] mb-0.5">
            Tiệm Bánh Thủ Công &amp; Cà Phê Nghệ Nhân
          </p>
          <p className="text-[10px] mb-0.5">
            Đ/c: 123 Đường Bánh Mì, Quận 1, TP. HCM
          </p>
          <p className="text-[10px]">Hotline: 0901 234 567</p>
        </div>

        <div className="text-center my-2">
          <h3 className="text-xs font-bold uppercase tracking-wide">
            HÓA ĐƠN BÁN LẺ
          </h3>
          <p className="text-[11px] font-bold">Số: {order.code}</p>
        </div>

        <div className="text-[10px] space-y-0.5 pb-2 border-b border-dashed border-black">
          <div className="flex justify-between">
            <span>Thời gian:</span>
            <span>
              {dateObj.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              - {dateObj.toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Thu ngân:</span>
            <span>{order.staffName}</span>
          </div>
          <div className="flex justify-between">
            <span>Khách hàng:</span>
            <span>
              {order.customerName || "Khách vãng lai"}{" "}
              {order.customerPhone ? `(${order.customerPhone})` : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Thanh toán:</span>
            <span>
              {order.paymentMethod === "QR_TRANSFER"
                ? "Chuyển khoản QR"
                : order.paymentMethod === "CASH"
                  ? "Tiền mặt"
                  : "Quẹt thẻ POS"}
            </span>
          </div>
          {order.note && (
            <div className="flex justify-between">
              <span>Ghi chú:</span>
              <span>{order.note}</span>
            </div>
          )}
        </div>

        <div className="py-2 border-b border-dashed border-black">
          <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-black mb-1.5">
            <span className="w-1/2">TÊN MÓN</span>
            <span className="w-12 text-center">SL</span>
            <span className="w-16 text-right">ĐƠN GIÁ</span>
            <span className="w-20 text-right">T.TIỀN</span>
          </div>
          <div className="space-y-1">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-[10px] items-start"
              >
                <span className="w-1/2 pr-1 break-words">
                  {item.productName}
                </span>
                <span className="w-12 text-center">{item.quantity}</span>
                <span className="w-16 text-right">
                  {item.price.toLocaleString("vi-VN")}
                </span>
                <span className="w-20 text-right font-bold">
                  {item.subtotal.toLocaleString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 pb-2 text-[10px] space-y-1 border-b border-dashed border-black">
          <div className="flex justify-between">
            <span>Tạm tính tiền hàng:</span>
            <span>{order.subtotal.toLocaleString("vi-VN")} ₫</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span>Giảm giá khuyến mãi:</span>
              <span>-{order.discount.toLocaleString("vi-VN")} ₫</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-bold pt-1 border-t border-black">
            <span>TỔNG CỘNG:</span>
            <span>{order.totalAmount.toLocaleString("vi-VN")} ₫</span>
          </div>
        </div>

        <div className="text-center pt-3 text-[10px] space-y-0.5">
          <p className="font-bold uppercase">
            CẢM ƠN QUÝ KHÁCH &amp; HẸN GẶP LẠI!
          </p>
          <p className="text-[9px] text-gray-700">
            Wifi: Artisan_Bakery | Pass: artisan2026
          </p>
          <p className="text-[8px] text-gray-500 mt-1">
            Hóa đơn điện tử lưu trữ trên hệ thống
          </p>
        </div>
      </div>

      {/* Global Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            margin: 5mm;
            size: auto;
          }
          body * {
            visibility: hidden !important;
          }
          #order-detail-printable-receipt, #order-detail-printable-receipt * {
            visibility: visible !important;
          }
          #order-detail-printable-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 4mm !important;
            display: block !important;
            color: #000 !important;
            background: #fff !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 11px !important;
            line-height: 1.35 !important;
            box-shadow: none !important;
            border: none !important;
          }
          header, footer, nav, button {
            display: none !important;
          }
        }
      `,
        }}
      />
    </div>
  );
}
