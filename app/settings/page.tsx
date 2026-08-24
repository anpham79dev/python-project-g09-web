'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Button,
  App,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Space,
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SettingOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import {
  getSystemSettings,
  updateSystemSettings,
  getShiftTemplates,
  createShiftTemplate,
  updateShiftTemplate,
  deleteShiftTemplate,
} from '@/lib/api';
import PageLoading from '@/app/components/page-loading';
import PageHeader from '@/app/components/page-header';
import ReloadButton from '@/app/components/reload-button';
import { ShiftTemplate, SystemSettings } from '@/lib/mock-data';
import { getCurrentUser, hasPermission } from '@/lib/auth';

export default function SettingsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm] = Form.useForm();

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [templateForm] = Form.useForm();
  const [submittingTemplate, setSubmittingTemplate] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (!hasPermission(user, 'settings:manage') && user.role !== 'SUPER_ADMIN') {
      message.error('Bạn không có quyền truy cập trang Cài đặt hệ thống!');
      router.push('/pos');
    }
  }, [router, message]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stData, tmplData] = await Promise.all([
        getSystemSettings(),
        getShiftTemplates(),
      ]);
      setSettings(stData);
      setTemplates(tmplData);
      settingsForm.setFieldsValue(stData);
    } catch {
      message.error('Lỗi khi tải dữ liệu cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const values = await settingsForm.validateFields();
      setSavingSettings(true);
      const updated = await updateSystemSettings(values);
      setSettings(updated);
      message.success('Đã lưu cấu hình hệ thống thành công!');
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setSavingSettings(false);
    }
  };

  // Template Handlers
  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    templateForm.resetFields();
    templateForm.setFieldsValue({
      defaultInitialCash: 500000,
      isActive: true,
    });
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tmpl: ShiftTemplate) => {
    setEditingTemplate(tmpl);
    templateForm.setFieldsValue(tmpl);
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      const values = await templateForm.validateFields();
      setSubmittingTemplate(true);
      if (editingTemplate) {
        await updateShiftTemplate(editingTemplate.id, values);
        message.success(`Cập nhật ca mẫu "${values.name}" thành công!`);
      } else {
        await createShiftTemplate(values);
        message.success(`Thêm mới ca mẫu "${values.name}" thành công!`);
      }
      setIsTemplateModalOpen(false);
      loadData();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err.message || 'Lỗi khi lưu ca mẫu');
    } finally {
      setSubmittingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteShiftTemplate(id);
      message.success('Đã xóa ca mẫu thành công!');
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi xóa ca mẫu');
    }
  };

  const templateColumns: ColumnsType<ShiftTemplate> = [
    {
      title: 'Tên Ca Làm Mẫu',
      key: 'name',
      render: (_, record) => (
        <div>
          <span className="font-bold text-xs text-[#111827] block">{record.name}</span>
          <span className="text-[11px] text-secondary">{record.note || 'Không có ghi chú'}</span>
        </div>
      ),
    },
    {
      title: 'Khung Giờ',
      key: 'time',
      render: (_, record) => (
        <span className="font-mono font-semibold text-xs text-[#006C49] px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200">
          {record.startTime} → {record.endTime}
        </span>
      ),
    },
    {
      title: 'Tiền Lẻ Đầu Ca',
      dataIndex: 'defaultInitialCash',
      key: 'defaultInitialCash',
      align: 'right',
      render: (val: number) => (
        <span className="font-mono font-semibold text-xs text-[#111827]">
          {val.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (act: boolean) => (
        <Tag color={act ? 'success' : 'default'} className="font-semibold text-xs">
          {act ? 'Đang áp dụng' : 'Tạm ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditTemplate(record)}
            className="text-xs"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa ca làm mẫu"
            description="Bạn có chắc chắn muốn xóa ca làm này khỏi danh sách cấu hình?"
            onConfirm={() => handleDeleteTemplate(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} className="text-xs" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full space-y-6">
      <PageHeader
        title="Cài Đặt Hệ Thống & Cấu Hình Ca Làm Việc Động"
        subtitle="Tùy biến khung giờ ca làm việc, thông tin in phiếu thanh toán và các quy tắc kiểm soát kho"
        actions={<ReloadButton onClick={loadData} />}
      />

      {loading && !settings ? (
        <PageLoading description="Đang tải thông số cấu hình..." />
      ) : settings ? (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <Tabs
            defaultActiveKey="shifts"
            items={[
              {
                key: 'shifts',
                label: (
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    <ClockCircleOutlined /> 1. Cấu Hình Ca Làm Việc Động (Shift Templates)
                  </span>
                ),
                children: (
                  <div className="space-y-4 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary">
                        Các ca làm việc được thiết lập tại đây sẽ tự động hiển thị trong menu chọn ca của thu ngân tại màn hình POS
                      </span>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreateTemplate}
                        className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs rounded-lg"
                      >
                        Thêm Ca Làm Mẫu
                      </Button>
                    </div>

                    <Table
                      columns={templateColumns}
                      dataSource={templates}
                      rowKey="id"
                      pagination={false}
                      className="rounded-xl border border-[#E5E7EB] overflow-hidden"
                    />
                  </div>
                ),
              },
              {
                key: 'store',
                forceRender: true,
                label: (
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    <ShopOutlined /> 2. Thông Tin Tiệm &amp; Mẫu In Phiếu
                  </span>
                ),
                children: (
                  <Form form={settingsForm} layout="vertical" className="max-w-3xl pt-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        name="storeName"
                        label={<span className="text-xs font-semibold text-[#111827]">TÊN TIỆM BÁNH (HIỂN THỊ HÓA ĐƠN)</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tên tiệm' }]}
                      >
                        <Input placeholder="Artisan Bakery" className="text-xs" />
                      </Form.Item>

                      <Form.Item
                        name="storeSlogan"
                        label={<span className="text-xs font-semibold text-[#111827]">SLOGAN / PHỤ ĐỀ</span>}
                      >
                        <Input placeholder="Tiệm Bánh Thủ Công Pháp" className="text-xs" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        name="hotline"
                        label={<span className="text-xs font-semibold text-[#111827]">HOTLINE ĐẶT HÀNG</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập Hotline' }]}
                      >
                        <Input placeholder="0901 234 567" className="text-xs font-mono" />
                      </Form.Item>

                      <Form.Item
                        name="address"
                        label={<span className="text-xs font-semibold text-[#111827]">ĐỊA CHỈ TRỤ SỞ CHÍNH</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                      >
                        <Input placeholder="123 Đường Đồng Khởi, Quận 1, TP.HCM" className="text-xs" />
                      </Form.Item>
                    </div>

                    {/* QR Payment Settings */}
                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-xs text-[#006C49]">
                        <QrcodeOutlined className="text-base" />
                        <span>THÔNG TIN TÀI KHOẢN NHẬN THANH TOÁN QR (VIETQR)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Form.Item
                          name="bankName"
                          label={<span className="text-xs font-semibold text-[#111827]">NGÂN HÀNG</span>}
                        >
                          <Input placeholder="Vietcombank (VCB)" className="text-xs" />
                        </Form.Item>

                        <Form.Item
                          name="bankAccountNumber"
                          label={<span className="text-xs font-semibold text-[#111827]">SỐ TÀI KHOẢN</span>}
                        >
                          <Input placeholder="1028889999" className="text-xs font-mono font-bold" />
                        </Form.Item>

                        <Form.Item
                          name="bankAccountHolder"
                          label={<span className="text-xs font-semibold text-[#111827]">TÊN CHỦ TÀI KHOẢN</span>}
                        >
                          <Input placeholder="TIEM BANH ARTISAN BAKERY" className="text-xs uppercase font-semibold" />
                        </Form.Item>
                      </div>
                    </div>

                    <Form.Item
                      name="receiptFooterNote"
                      label={<span className="text-xs font-semibold text-[#111827]">LỜI CẢM ƠN CHÂN TRANG IN HÓA ĐƠN</span>}
                    >
                      <Input.TextArea rows={2} placeholder="Cảm ơn Quý Khách & Hẹn Gặp Lại!" className="text-xs" />
                    </Form.Item>

                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={savingSettings}
                      onClick={handleSaveSettings}
                      className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs h-10 px-6 rounded-xl"
                    >
                      Lưu Thay Đổi Thông Tin
                    </Button>
                  </Form>
                ),
              },
              {
                key: 'rules',
                label: (
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    <SettingOutlined /> 3. Quy Tắc POS &amp; Tồn Kho
                  </span>
                ),
                children: (
                  <Form form={settingsForm} layout="vertical" className="max-w-2xl pt-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        name="lowStockThreshold"
                        label={<span className="text-xs font-semibold text-[#111827]">NGƯỠNG CẢNH BÁO TỒN KHO THẤP</span>}
                        help="Khi tồn kho bằng hoặc nhỏ hơn số này, hệ thống sẽ đánh dấu màu cam (Sắp hết)"
                      >
                        <Space.Compact className="w-full">
                          <InputNumber min={1} max={100} className="w-full text-xs font-mono" />
                          <Button disabled className="!bg-gray-100 !text-gray-600 font-medium !px-2.5 text-xs">cái</Button>
                        </Space.Compact>
                      </Form.Item>

                      <Form.Item
                        name="defaultVatRate"
                        label={<span className="text-xs font-semibold text-[#111827]">TỶ LỆ THUẾ VAT MẶC ĐỊNH</span>}
                      >
                        <Select className="text-xs">
                          <Select.Option value={0}>0% (Không chịu thuế)</Select.Option>
                          <Select.Option value={8}>8% (Thuế F&amp;B ưu đãi)</Select.Option>
                          <Select.Option value={10}>10% (Thuế GTGT chuẩn)</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-xs text-[#111827] block">
                            Cho phép bán âm kho khi hết hàng
                          </span>
                          <span className="text-[11px] text-secondary">
                            Nếu tắt, thu ngân không thể thêm vào giỏ khi sản phẩm có tồn kho = 0
                          </span>
                        </div>
                        <Form.Item name="allowNegativeStock" valuePropName="checked" noStyle>
                          <Switch />
                        </Form.Item>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                        <div>
                          <span className="font-semibold text-xs text-[#111827] block">
                            Bắt buộc nhập giải trình khi két lệch tiền
                          </span>
                          <span className="text-[11px] text-secondary">
                            Yêu cầu thu ngân nhập ghi chú lý do khi số tiền thực tế đếm được khác tiền lý thuyết
                          </span>
                        </div>
                        <Form.Item name="requireShiftReconciliationNote" valuePropName="checked" noStyle>
                          <Switch />
                        </Form.Item>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={savingSettings}
                      onClick={handleSaveSettings}
                      className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs h-10 px-6 rounded-xl"
                    >
                      Lưu Quy Tắc Vận Hành
                    </Button>
                  </Form>
                ),
              },
            ]}
          />
        </div>
      ) : null}

      {/* Modal Thêm / Sửa Ca Mẫu */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <ClockCircleOutlined className="text-[#006C49]" />
            <span>{editingTemplate ? 'Chỉnh Sửa Ca Làm Mẫu' : 'Thêm Mới Ca Làm Mẫu'}</span>
          </div>
        }
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
        onOk={handleSaveTemplate}
        confirmLoading={submittingTemplate}
        okText={editingTemplate ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={480}
      >
        <Form form={templateForm} layout="vertical" className="pt-3">
          <Form.Item
            name="name"
            label={<span className="text-xs font-semibold text-[#111827]">TÊN CA LÀM VIỆC</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên ca (ví dụ: Ca sáng sớm, Ca đêm)' }]}
          >
            <Input placeholder="Ca sáng (Sáng sớm & Đi làm)" className="text-xs" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="startTime"
              label={<span className="text-xs font-semibold text-[#111827]">GIỜ BẮT ĐẦU</span>}
              rules={[{ required: true, message: 'Nhập giờ (HH:mm)' }]}
            >
              <Input placeholder="06:30" className="text-xs font-mono" />
            </Form.Item>

            <Form.Item
              name="endTime"
              label={<span className="text-xs font-semibold text-[#111827]">GIỜ KẾT THÚC</span>}
              rules={[{ required: true, message: 'Nhập giờ (HH:mm)' }]}
            >
              <Input placeholder="14:30" className="text-xs font-mono" />
            </Form.Item>
          </div>

          <Form.Item
            name="defaultInitialCash"
            label={<span className="text-xs font-semibold text-[#111827]">TIỀN LẺ ĐẦU CA GỢI Ý</span>}
            rules={[{ required: true, message: 'Nhập số tiền đầu ca' }]}
          >
            <Space.Compact className="w-full">
              <InputNumber
                className="w-full font-mono text-xs font-bold"
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
              <Button disabled className="!bg-gray-100 !text-gray-600 font-medium !px-3 text-xs">₫</Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="note"
            label={<span className="text-xs font-semibold text-[#111827]">GHI CHÚ NGHIỆP VỤ</span>}
          >
            <Input placeholder="Ví dụ: Phục vụ bánh mì tươi buổi sáng..." className="text-xs" />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" className="mb-0">
            <div className="flex items-center gap-2">
              <Switch defaultChecked />
              <span className="text-xs font-medium text-[#111827]">Kích hoạt ca làm này cho quầy POS</span>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
