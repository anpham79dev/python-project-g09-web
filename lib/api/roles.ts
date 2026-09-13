import apiClient from "../axios";
import { Role, Permission, AuditLog, INITIAL_PERMISSIONS } from "../mock-data";
import {
  isMockMode,
  simulateDelay,
  LS_KEYS,
  getStoredList,
  getStoredRoles,
  saveStoredRoles,
  getStoredUsers,
  getStoredAuditLogs,
  saveStoredAuditLogs,
} from "./_shared";

const getStoredPermissions = (): Permission[] =>
  getStoredList(LS_KEYS.PERMISSIONS, INITIAL_PERMISSIONS, true);

export const getPermissions = async (): Promise<Permission[]> => {
  if (isMockMode()) {
    const list = getStoredPermissions();
    return simulateDelay(list);
  }
  const response = await apiClient.get("/permissions");
  return response.data;
};

export const getRoles = async (): Promise<Role[]> => {
  if (isMockMode()) {
    const roles = getStoredRoles();
    const users = getStoredUsers();
    // Compute live user_count for each role
    const enriched = roles.map((r) => ({
      ...r,
      user_count: users.filter((u) => u.roleId === r.id || u.role === r.code)
        .length,
    }));
    return simulateDelay(enriched);
  }
  const response = await apiClient.get("/roles");
  return response.data;
};

export const createRole = async (data: {
  code: string;
  name: string;
  description?: string;
  permission_ids: string[];
}): Promise<Role> => {
  if (isMockMode()) {
    const roles = getStoredRoles();
    const perms = getStoredPermissions();
    const selectedPerms = perms.filter((p) =>
      data.permission_ids.includes(p.id),
    );
    const cleanCode = data.code.trim().toUpperCase().replace(/\s+/g, "_");

    // Check duplicate code
    if (roles.some((r) => r.code === cleanCode)) {
      throw new Error(`Mã vai trò '${cleanCode}' đã tồn tại!`);
    }

    const newRole: Role = {
      id: `role-${Date.now().toString().slice(-4)}`,
      code: cleanCode,
      name: data.name.trim(),
      description: data.description || "",
      is_system: false,
      permissions_version: 1,
      permissions: selectedPerms,
      user_count: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStoredRoles([...roles, newRole]);

    // Record audit log
    const auditLogs = getStoredAuditLogs();
    const newAudit: AuditLog = {
      id: `audit-${Date.now().toString().slice(-6)}`,
      user_id: "user-000",
      user_name: "Tổng Quản Trị Hệ Thống",
      action: "ROLE_CREATE",
      target_type: "ROLE",
      target_id: newRole.id,
      target_name: newRole.name,
      changes_summary: `Tạo vai trò mới '${newRole.name}' (${newRole.code}) với ${selectedPerms.length} quyền`,
      details_json: JSON.stringify({
        code: newRole.code,
        permissions: selectedPerms.map((p) => p.code),
      }),
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString(),
    };
    saveStoredAuditLogs([newAudit, ...auditLogs]);

    return simulateDelay(newRole);
  }

  const response = await apiClient.post("/roles", data);
  return response.data;
};

export const updateRole = async (
  roleId: string,
  data: { name?: string; description?: string; permission_ids?: string[] },
): Promise<Role> => {
  if (isMockMode()) {
    const roles = getStoredRoles();
    const idx = roles.findIndex((r) => r.id === roleId);
    if (idx === -1) throw new Error("Role not found");

    const role = roles[idx];
    const oldPermCodes = role.permissions.map((p) => p.code);
    let newPerms = role.permissions;

    if (data.permission_ids) {
      const allPerms = getStoredPermissions();
      newPerms = allPerms.filter((p) => data.permission_ids!.includes(p.id));
      role.permissions = newPerms;
      role.permissions_version = (role.permissions_version || 1) + 1;
    }
    if (data.name) role.name = data.name.trim();
    if (data.description !== undefined) role.description = data.description;
    role.updatedAt = new Date().toISOString();

    roles[idx] = role;
    saveStoredRoles(roles);

    // Update active user in localStorage if matching role
    const curUserStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (curUserStr) {
      try {
        const curUser = JSON.parse(curUserStr);
        if (curUser.roleId === role.id || curUser.role === role.code) {
          curUser.permissions = newPerms.map((p) => p.code);
          curUser.permissionsVersion = role.permissions_version;
          localStorage.setItem("user", JSON.stringify(curUser));
          document.cookie = `artisan_permissions=${encodeURIComponent(JSON.stringify(curUser.permissions))}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `artisan_perm_version=${encodeURIComponent(String(role.permissions_version))}; path=/; max-age=604800; SameSite=Lax`;
        }
      } catch {
        // ignore
      }
    }

    // Record audit log
    const newPermCodes = newPerms.map((p) => p.code);
    const diffAdded = newPermCodes.filter((c) => !oldPermCodes.includes(c));
    const diffRemoved = oldPermCodes.filter((c) => !newPermCodes.includes(c));
    const auditLogs = getStoredAuditLogs();
    const newAudit: AuditLog = {
      id: `audit-${Date.now().toString().slice(-6)}`,
      user_id: "user-000",
      user_name: "Tổng Quản Trị Hệ Thống",
      action: "ROLE_UPDATE_PERMISSIONS",
      target_type: "ROLE",
      target_id: role.id,
      target_name: role.name,
      changes_summary: `Cập nhật quyền vai trò '${role.name}' (+${diffAdded.length}/-${diffRemoved.length})`,
      details_json: JSON.stringify({
        before: oldPermCodes,
        after: newPermCodes,
        diff_added: diffAdded,
        diff_removed: diffRemoved,
        version: role.permissions_version,
      }),
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString(),
    };
    saveStoredAuditLogs([newAudit, ...auditLogs]);

    return simulateDelay(role);
  }

  const response = await apiClient.put(`/roles/${roleId}`, data);
  return response.data;
};

export const deleteRole = async (
  roleId: string,
): Promise<{ message: string }> => {
  if (isMockMode()) {
    const roles = getStoredRoles();
    const role = roles.find((r) => r.id === roleId);
    if (!role) throw new Error("Role not found");
    if (role.is_system) throw new Error("Không thể xóa vai trò hệ thống gốc!");

    const users = getStoredUsers();
    const count = users.filter(
      (u) => u.roleId === role.id || u.role === role.code,
    ).length;
    if (count > 0)
      throw new Error(
        `Không thể xóa vai trò đang có ${count} người dùng trực thuộc!`,
      );

    saveStoredRoles(roles.filter((r) => r.id !== roleId));

    const auditLogs = getStoredAuditLogs();
    const newAudit: AuditLog = {
      id: `audit-${Date.now().toString().slice(-6)}`,
      user_id: "user-000",
      user_name: "Tổng Quản Trị Hệ Thống",
      action: "ROLE_DELETE",
      target_type: "ROLE",
      target_id: role.id,
      target_name: role.name,
      changes_summary: `Xóa vai trò tùy biến '${role.name}' (${role.code})`,
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString(),
    };
    saveStoredAuditLogs([newAudit, ...auditLogs]);

    return simulateDelay({
      message: `Đã xóa vai trò '${role.name}' thành công!`,
    });
  }

  const response = await apiClient.delete(`/roles/${roleId}`);
  return response.data;
};

export const getAuditLogs = async (
  targetType?: string,
): Promise<AuditLog[]> => {
  if (isMockMode()) {
    let logs = getStoredAuditLogs();
    if (targetType) {
      logs = logs.filter((l) => l.target_type === targetType);
    }
    return simulateDelay(logs);
  }

  const response = await apiClient.get("/audit-logs", {
    params: { target_type: targetType },
  });
  return response.data;
};
