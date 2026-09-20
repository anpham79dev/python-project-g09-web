'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Checkbox,
  Space,
  Tooltip,
  Typography,
  Divider,
  Alert,
  App,
  Popconfirm,
  Badge,
  Drawer,
  Row,
  Col,
  Statistic,
  Spin,
} from 'antd';
import {
  SafetyCertificateOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  LockOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  ReloadOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { getRoles, getPermissions, createRole, updateRole, deleteRole, getAuditLogs } from '@/lib/api';
import { Role, Permission, AuditLog } from '@/lib/types';
import { getCurrentUser, hasPermission } from '@/lib/auth';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function RolesManagementPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal States
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [auditDrawerVisible, setAuditDrawerVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Forms & Selections
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);

  const currentUser = getCurrentUser();
  const canManageRoles = hasPermission(currentUser, 'roles:manage');

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (err: any) {
      message.error(err?.message || 'Lỗi khi tải danh sách vai trò và quyền!');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const logs = await getAuditLogs();
      setAuditLogs(logs);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (!hasPermission(user, 'roles:manage') && user.role !== 'SUPER_ADMIN') {
      message.error('Bạn không có quyền quản trị vai trò!');
      router.push('/pos?reason=forbidden');
    }
  }, [router, message]);

  useEffect(() => {
    loadData();
  }, []);

  // Group permissions by module
  const permsByModule = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    permissions.forEach((p) => {
      if (!map[p.module]) {
        map[p.module] = [];
      }
      map[p.module].push(p);
    });
    return map;
  }, [permissions]);

  // Handle Edit Permissions
  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermIds(role.permissions.map((p) => p.id));
    editForm.setFieldsValue({
      name: role.name,
      description: role.description || '',
    });
    setEditModalVisible(true);
  };

  // Submit Edit
  const handleSaveEdit = async () => {
    if (!selectedRole) return;
    try {
      const values = await editForm.validateFields();
      setActionLoading(true);

      const updated = await updateRole(selectedRole.id, {
        name: values.name,
        description: values.description,
        permission_ids: selectedPermIds,
      });

      message.success(`Đã cập nhật phân quyền cho vai trò '${updated.name}' thành công!`);
      setEditModalVisible(false);
      loadData();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || err?.message || 'Lỗi khi lưu vai trò!');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Role
  const handleOpenCreate = () => {
    createForm.resetFields();
    setSelectedPermIds([]);
    setCreateModalVisible(true);
  };

  const handleSaveCreate = async () => {
    try {
      const values = await createForm.validateFields();
      if (selectedPermIds.length === 0) {
        message.warning('Vui lòng chọn ít nhất 1 quyền cho vai trò mới!');
        return;
      }

      setActionLoading(true);
      const newRole = await createRole({
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        description: values.description,
        permission_ids: selectedPermIds,
      });

      message.success(`Đã tạo vai trò mới '${newRole.name}' (${newRole.code}) thành công!`);
      setCreateModalVisible(false);
      loadData();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || err?.message || 'Lỗi khi tạo vai trò!');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Role
  const handleDeleteRole = async (role: Role) => {
    try {
      setActionLoading(true);
      const res = await deleteRole(role.id);
      message.success(res.message || 'Đã xóa vai trò thành công!');
      loadData();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || err?.message || 'Lỗi khi xóa vai trò!');
    } finally {
      setActionLoading(false);
    }
  };

  // Checkbox helpers for Permission Matrix
  const togglePermission = (permId: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const toggleModulePermissions = (moduleName: string) => {
    const modulePermIds = permsByModule[moduleName]?.map((p) => p.id) || [];
    const allSelected = modulePermIds.every((id) => selectedPermIds.includes(id));

    if (allSelected) {
      setSelectedPermIds((prev) => prev.filter((id) => !modulePermIds.includes(id)));
    } else {
      setSelectedPermIds((prev) => Array.from(new Set([...prev, ...modulePermIds])));
    }
  };

  const selectAllPermissions = () => {
    setSelectedPermIds(permissions.map((p) => p.id));
  };

  const deselectAllPermissions = () => {
    setSelectedPermIds([]);
  };

  const columns = [
    {
      title: 'Mã & Tên Vai Trò',
      key: 'role_info',
      render: (_: any, record: Role) => (
        <div>
          <div className="flex items-center gap-2">
            <Text strong className="text-base text-gray-900">
              {record.name}
            </Text>
            {record.is_system ? (
              <Tag color="gold" className="flex items-center gap-1 font-medium">
                <LockOutlined className="text-xs" /> Hệ Thống
              </Tag>
            ) : (
              <Tag color="cyan" className="font-medium">
                Tùy Biến
              </Tag>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded font-mono font-bold">
              {record.code}
            </code>
            <Text type="secondary" className="text-xs">
              {record.description || 'Không có mô tả'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Số Lượng Quyền',
      key: 'perms_count',
      width: 170,
      render: (_: any, record: Role) => {
        const total = permissions.length || 21;
        const count = record.permissions.length;
        const percent = Math.round((count / total) * 100);
        return (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-800 text-sm">
                {count}/{total} quyền
              </span>
              <Tag color={percent === 100 ? 'green' : percent > 50 ? 'blue' : 'orange'} className="mr-0 text-xs">
                {percent}%
              </Tag>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: 'Nhân Sự',
      key: 'user_count',
      width: 120,
      render: (_: any, record: Role) => (
        <div className="flex items-center gap-1.5">
          <UserOutlined className="text-gray-400" />
          <span className="font-bold text-gray-800 text-sm">{record.user_count || 0}</span>
          <span className="text-xs text-gray-500">tài khoản</span>
        </div>
      ),
    },
    {
      title: 'Phiên Bản',
      key: 'version',
      width: 100,
      render: (_: any, record: Role) => (
        <Badge
          count={`v${record.permissions_version || 1}`}
          style={{ backgroundColor: '#006C49', color: '#fff' }}
        />
      ),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 180,
      render: (_: any, record: Role) => {
        const cannotDelete = record.is_system || (record.user_count && record.user_count > 0);
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
              className="bg-emerald-700 hover:bg-emerald-600"
            >
              Phân Quyền
            </Button>

            {cannotDelete ? (
              <Tooltip
                title={
                  record.is_system
                    ? 'Vai trò hệ thống gốc không được phép xóa'
                    : `Không thể xóa vì còn ${record.user_count} nhân viên đang sử dụng vai trò này`
                }
              >
                <Button size="small" icon={<DeleteOutlined />} disabled />
              </Tooltip>
            ) : (
              <Popconfirm
                title="Xác nhận xóa vai trò?"
                description={`Bạn có chắc chắn muốn xóa vai trò '${record.name}'? Hành động này không thể hoàn tác.`}
                onConfirm={() => handleDeleteRole(record)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 text-xl font-bold">
              <SafetyCertificateOutlined />
            </div>
            <div>
              <Title level={3} className="m-0 text-gray-900">
                Quản Lý Vai Trò & Phân Quyền (PBAC)
              </Title>
              <Text type="secondary" className="text-sm">
                Kiểm soát quyền truy cập nguyên tử (Permission-Based Access Control) theo 21 quyền hạn và 8 phân hệ
              </Text>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<HistoryOutlined />}
            onClick={() => {
              loadAuditLogs();
              setAuditDrawerVisible(true);
            }}
          >
            Nhật Ký (Audit Log)
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadData}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            className="bg-emerald-700 hover:bg-emerald-600 font-medium"
          >
            Tạo Vai Trò Mới
          </Button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Tổng Số Vai Trò Trong Hệ Thống"
              value={roles.length}
              prefix={<ApartmentOutlined className="text-emerald-600 mr-1" />}
              suffix="vai trò"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Quyền Hạn Nguyên Tử (Permissions)"
              value={permissions.length || 21}
              prefix={<SafetyCertificateOutlined className="text-blue-600 mr-1" />}
              suffix="quyền hạn"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="border border-gray-200 shadow-sm">
            <Statistic
              title="Phân Hệ Nghiệp Vụ"
              value={Object.keys(permsByModule).length || 8}
              prefix={<CheckCircleOutlined className="text-purple-600 mr-1" />}
              suffix="phân hệ"
            />
          </Card>
        </Col>
      </Row>

      {/* Main Roles Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800">Danh Sách Vai Trò Người Dùng</span>
            <Text type="secondary" className="text-xs font-normal">
              * Thay đổi phân quyền sẽ có hiệu lực tức thì cho nhân sự trực thuộc
            </Text>
          </div>
        }
        className="border border-gray-200 shadow-sm"
      >
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* ========================================================================= */}
      {/* MODAL: CHỈNH SỬA PHÂN QUYỀN VAI TRÒ */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-emerald-700 text-lg" />
            <span>Chỉnh Sửa Phân Quyền: {selectedRole?.name}</span>
            <code className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">
              {selectedRole?.code}
            </code>
          </div>
        }
        open={editModalVisible}
        forceRender
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveEdit}
        confirmLoading={actionLoading}
        width={850}
        okText="Lưu Thay Đổi & Xuất Bản"
        cancelText="Đóng"
        okButtonProps={{ className: 'bg-emerald-700 hover:bg-emerald-600' }}
      >
        <div className="space-y-4 my-2">
          {selectedRole?.is_system && (
            <Alert
              type="info"
              showIcon
              title="Vai Trò Hệ Thống Gốc"
              description="Bạn đang chỉnh sửa quyền của vai trò hệ thống gốc. Mã vai trò là bất biến nhưng bạn có thể tinh chỉnh các quyền nguyên tử để phù hợp với quy trình vận hành tiệm."
            />
          )}

          <Form form={editForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tên Vai Trò"
                  rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
                >
                  <Input placeholder="Ví dụ: Quản Lý Cửa Hàng Quận 1" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="description" label="Mô Tả Vai Trò">
                  <Input placeholder="Mô tả tóm tắt quyền hạn và trách nhiệm" />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {/* Permission Matrix Controls */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
              <Text strong className="text-sm">
                Ma Trận Phân Quyền (Permission Matrix)
              </Text>
              <span className="ml-2 text-xs text-gray-500">
                Đã chọn: <strong className="text-emerald-700">{selectedPermIds.length}/{permissions.length}</strong> quyền
              </span>
            </div>
            <Space size="small">
              <Button size="small" onClick={selectAllPermissions}>
                Chọn tất cả (21/21)
              </Button>
              <Button size="small" onClick={deselectAllPermissions}>
                Bỏ chọn tất cả
              </Button>
            </Space>
          </div>

          {/* Module-by-Module Permission Checkbox Groups */}
          <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1">
            {Object.entries(permsByModule).map(([moduleName, modulePerms]) => {
              const allModuleSelected = modulePerms.every((p) => selectedPermIds.includes(p.id));
              const someModuleSelected =
                modulePerms.some((p) => selectedPermIds.includes(p.id)) && !allModuleSelected;

              return (
                <Card
                  key={moduleName}
                  size="small"
                  className="border border-gray-200 bg-white"
                  title={
                    <div className="flex items-center justify-between">
                      <Checkbox
                        checked={allModuleSelected}
                        indeterminate={someModuleSelected}
                        onChange={() => toggleModulePermissions(moduleName)}
                      >
                        <span className="font-bold text-gray-800 text-sm">{moduleName}</span>
                        <span className="text-xs text-gray-400 ml-1.5 font-normal">
                          ({modulePerms.filter((p) => selectedPermIds.includes(p.id)).length}/{modulePerms.length})
                        </span>
                      </Checkbox>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                    {modulePerms.map((perm) => {
                      const isChecked = selectedPermIds.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => togglePermission(perm.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-50/50'
                              : 'border-gray-200 bg-gray-50/30 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox checked={isChecked} className="mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-gray-900">{perm.name}</span>
                                <code className="text-[10px] font-mono text-gray-500 bg-white px-1 py-0.2 rounded border">
                                  {perm.code}
                                </code>
                              </div>
                              {perm.description && (
                                <p className="text-[11px] text-gray-500 m-0 mt-0.5 leading-tight">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: TẠO VAI TRÒ MỚI */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-emerald-700" />
            <span>Tạo Vai Trò Người Dùng Mới</span>
          </div>
        }
        open={createModalVisible}
        forceRender
        onCancel={() => setCreateModalVisible(false)}
        onOk={handleSaveCreate}
        confirmLoading={actionLoading}
        width={850}
        okText="Tạo Vai Trò"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-emerald-700 hover:bg-emerald-600' }}
      >
        <div className="space-y-4 my-2">
          <Form form={createForm} layout="vertical">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="code"
                  label="Mã Vai Trò (Code)"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã vai trò' },
                    {
                      pattern: /^[A-Z0-9_]+$/,
                      message: 'Mã chỉ bao gồm chữ HOA, số và gạch dưới (Ví dụ: STORE_MANAGER)',
                    },
                  ]}
                  extra="Viết hoa, không dấu, không khoảng trắng"
                >
                  <Input
                    placeholder="STORE_MANAGER"
                    onChange={(e) => {
                      createForm.setFieldValue('code', e.target.value.toUpperCase().replace(/\s+/g, '_'));
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="name"
                  label="Tên Hiển Thị"
                  rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị vai trò' }]}
                >
                  <Input placeholder="Ví dụ: Quản Lý Cửa Hàng" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="description" label="Mô Tả">
                  <Input placeholder="Mô tả quyền hạn vai trò này" />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
            <Text className="text-xs text-emerald-900 font-semibold">Gợi ý phân quyền nhanh:</Text>
            <Button
              size="small"
              onClick={() => {
                const codes = ['pos:access', 'pos:checkout', 'products:read', 'orders:read', 'shifts:read'];
                setSelectedPermIds(permissions.filter((p) => codes.includes(p.code)).map((p) => p.id));
              }}
            >
              Mẫu Thu Ngân POS (5 quyền)
            </Button>
            <Button
              size="small"
              onClick={() => {
                const codes = [
                  'pos:access',
                  'pos:checkout',
                  'products:read',
                  'products:write',
                  'inventory:read',
                  'inventory:write',
                  'orders:read',
                  'orders:export',
                  'shifts:read',
                  'shifts:manage',
                  'accounting:read',
                ];
                setSelectedPermIds(permissions.filter((p) => codes.includes(p.code)).map((p) => p.id));
              }}
            >
              Mẫu Cửa Hàng Trưởng (11 quyền)
            </Button>
            <Button
              size="small"
              onClick={() => {
                setSelectedPermIds(permissions.filter((p) => p.code !== 'landing_page:edit').map((p) => p.id));
              }}
            >
              Mẫu Quản Trị Viên (20 quyền)
            </Button>
          </div>

          {/* Permission Matrix for Creation */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
              <Text strong className="text-sm">
                Chọn Danh Sách Quyền Cho Vai Trò Mới
              </Text>
              <span className="ml-2 text-xs text-gray-500">
                Đã chọn: <strong className="text-emerald-700">{selectedPermIds.length}/{permissions.length}</strong> quyền
              </span>
            </div>
            <Space size="small">
              <Button size="small" onClick={selectAllPermissions}>
                Chọn tất cả
              </Button>
              <Button size="small" onClick={deselectAllPermissions}>
                Bỏ chọn
              </Button>
            </Space>
          </div>

          <div className="max-h-[45vh] overflow-y-auto space-y-4 pr-1">
            {Object.entries(permsByModule).map(([moduleName, modulePerms]) => {
              const allModuleSelected = modulePerms.every((p) => selectedPermIds.includes(p.id));
              const someModuleSelected =
                modulePerms.some((p) => selectedPermIds.includes(p.id)) && !allModuleSelected;

              return (
                <Card
                  key={moduleName}
                  size="small"
                  className="border border-gray-200 bg-white"
                  title={
                    <div className="flex items-center justify-between">
                      <Checkbox
                        checked={allModuleSelected}
                        indeterminate={someModuleSelected}
                        onChange={() => toggleModulePermissions(moduleName)}
                      >
                        <span className="font-bold text-gray-800 text-sm">{moduleName}</span>
                        <span className="text-xs text-gray-400 ml-1.5 font-normal">
                          ({modulePerms.filter((p) => selectedPermIds.includes(p.id)).length}/{modulePerms.length})
                        </span>
                      </Checkbox>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                    {modulePerms.map((perm) => {
                      const isChecked = selectedPermIds.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => togglePermission(perm.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-50/50'
                              : 'border-gray-200 bg-gray-50/30 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox checked={isChecked} className="mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-gray-900">{perm.name}</span>
                                <code className="text-[10px] font-mono text-gray-500 bg-white px-1 py-0.2 rounded border">
                                  {perm.code}
                                </code>
                              </div>
                              {perm.description && (
                                <p className="text-[11px] text-gray-500 m-0 mt-0.5 leading-tight">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* DRAWER: NHẬT KÝ THAO TÁC PHÂN QUYỀN (AUDIT LOGS) */}
      {/* ========================================================================= */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-emerald-700" />
            <span>Nhật Ký Thao Tác Phân Quyền (RBAC Audit Trail)</span>
          </div>
        }
        placement="right"
        size="large"
        onClose={() => setAuditDrawerVisible(false)}
        open={auditDrawerVisible}
        extra={
          <Button size="small" icon={<ReloadOutlined />} onClick={loadAuditLogs}>
            Làm mới
          </Button>
        }
      >
        <div className="space-y-4">
          <Paragraph type="secondary" className="text-xs m-0">
            Ghi nhận mọi thay đổi liên quan đến khởi tạo vai trò, sửa đổi quyền nguyên tử, xóa vai trò và gán vai trò người dùng nhằm phục vụ bảo mật & kiểm toán hệ thống.
          </Paragraph>

          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Chưa có bản ghi nhật ký kiểm toán nào.</div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => {
                const actionBadgeColor =
                  log.action === 'ROLE_CREATE'
                    ? 'green'
                    : log.action === 'ROLE_UPDATE_PERMISSIONS'
                    ? 'blue'
                    : log.action === 'ROLE_DELETE'
                    ? 'red'
                    : 'purple';

                return (
                  <div key={log.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Tag color={actionBadgeColor} className="font-mono text-xs font-semibold">
                        {log.action}
                      </Tag>
                      <Text type="secondary" className="text-xs">
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </Text>
                    </div>

                    <p className="font-semibold text-xs text-gray-900 m-0">
                      {log.changes_summary}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                      <span>Người thực hiện: <strong>{log.user_name}</strong></span>
                      <span>Mục tiêu: <code className="bg-gray-100 px-1 py-0.5 rounded">{log.target_name}</code></span>
                    </div>

                    {log.details_json && (
                      <details className="text-[10px] text-gray-500 cursor-pointer pt-1">
                        <summary className="hover:text-emerald-700">Xem chi tiết kỹ thuật (JSON)</summary>
                        <pre className="mt-1 p-2 bg-gray-900 text-emerald-400 rounded overflow-x-auto text-[10px]">
                          {JSON.stringify(JSON.parse(log.details_json), null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
