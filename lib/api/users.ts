import apiClient from '../axios';
import { User, AuditLog } from '../mock-data';
import {
  isMockMode,
  simulateDelay,
  getStoredUsers,
  saveStoredUsers,
  getStoredBranches,
  getStoredRoles,
  getStoredAuditLogs,
  saveStoredAuditLogs,
} from './_shared';

export const getUsers = async (): Promise<User[]> => {
  if (isMockMode()) {
    const list = getStoredUsers();
    return simulateDelay(list);
  }

  const response = await apiClient.get('/users');
  return response.data;
};

export const createUser = async (data: Omit<User, 'id' | 'createdAt'> & { password?: string; role_id?: string }): Promise<User> => {
  if (isMockMode()) {
    const list = getStoredUsers();
    const branches = getStoredBranches();
    const roles = getStoredRoles();
    const br = branches.find((b) => b.id === data.defaultBranchId);

    // Resolve role details
    let roleObj = roles.find((r) => r.id === (data.roleId || (data as any).role_id) || r.code === data.role);
    if (!roleObj) {
      roleObj = roles.find((r) => r.code === 'STAFF') || roles[0];
    }

    const newUser: User = {
      id: `user-${Date.now().toString().slice(-4)}`,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: roleObj.code,
      roleId: roleObj.id,
      roleName: roleObj.name,
      permissions: roleObj.permissions.map((p) => p.code),
      permissionsVersion: roleObj.permissions_version || 1,
      status: data.status || 'ACTIVE',
      defaultBranchId: data.defaultBranchId || null,
      defaultBranchName: br ? br.name : (data.defaultBranchName || null),
      createdAt: new Date().toISOString(),
    };
    saveStoredUsers([...list, newUser]);
    return simulateDelay(newUser);
  }

  const payload = {
    ...data,
    role_id: data.roleId || (data as any).role_id,
  };
  const response = await apiClient.post('/users', payload);
  return response.data;
};

export const updateUserActiveBranch = async (branchId: string): Promise<User> => {
  if (isMockMode()) {
    const users = getStoredUsers();
    const curUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (curUserStr) {
      try {
        const curUser = JSON.parse(curUserStr);
        curUser.lastActiveBranchId = branchId;
        localStorage.setItem('user', JSON.stringify(curUser));
        const idx = users.findIndex((u) => u.id === curUser.id);
        if (idx >= 0) {
          users[idx].lastActiveBranchId = branchId;
          saveStoredUsers(users);
        }
        return simulateDelay(curUser);
      } catch {
        // ignore
      }
    }
    return simulateDelay({} as User);
  }

  const response = await apiClient.patch('/users/me/active-branch', { branchId });
  if (typeof window !== 'undefined') {
    const curUserStr = localStorage.getItem('user');
    if (curUserStr) {
      const curUser = JSON.parse(curUserStr);
      curUser.lastActiveBranchId = branchId;
      localStorage.setItem('user', JSON.stringify(curUser));
    }
  }
  return response.data;
};

export const updateUser = async (id: string, data: Partial<User> & { password?: string; role_id?: string }): Promise<User> => {
  if (isMockMode()) {
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      const branches = getStoredBranches();
      const roles = getStoredRoles();
      const br = branches.find((b) => b.id === data.defaultBranchId);
      const oldUser = users[idx];

      let updatedRole = oldUser.role;
      let updatedRoleId = oldUser.roleId;
      let updatedRoleName = oldUser.roleName;
      let updatedPermissions = oldUser.permissions;
      let updatedPermissionsVersion = oldUser.permissionsVersion;

      const requestedRoleId = data.roleId || (data as any).role_id;
      if (requestedRoleId || (data.role && data.role !== oldUser.role)) {
        const matchedRole = roles.find((r) => r.id === requestedRoleId || r.code === data.role);
        if (matchedRole) {
          updatedRole = matchedRole.code;
          updatedRoleId = matchedRole.id;
          updatedRoleName = matchedRole.name;
          updatedPermissions = matchedRole.permissions.map((p) => p.code);
          updatedPermissionsVersion = matchedRole.permissions_version || 1;

          // Record audit log for user role change
          const auditLogs = getStoredAuditLogs();
          const newAudit: AuditLog = {
            id: `audit-${Date.now().toString().slice(-6)}`,
            user_id: 'user-000',
            user_name: 'Tổng Quản Trị Hệ Thống',
            action: 'USER_ROLE_CHANGE',
            target_type: 'USER',
            target_id: oldUser.id,
            target_name: oldUser.fullName || oldUser.username,
            changes_summary: `Đổi vai trò người dùng '${oldUser.username}' từ '${oldUser.roleName || oldUser.role}' sang '${matchedRole.name}'`,
            details_json: JSON.stringify({ old_role: oldUser.role, new_role: matchedRole.code }),
            ip_address: '127.0.0.1',
            created_at: new Date().toISOString(),
          };
          saveStoredAuditLogs([newAudit, ...auditLogs]);
        }
      }

      users[idx] = {
        ...users[idx],
        ...data,
        role: updatedRole,
        roleId: updatedRoleId,
        roleName: updatedRoleName,
        permissions: updatedPermissions,
        permissionsVersion: updatedPermissionsVersion,
        defaultBranchName: br ? br.name : (data.defaultBranchName !== undefined ? data.defaultBranchName : users[idx].defaultBranchName),
      };
      saveStoredUsers(users);
      return simulateDelay(users[idx]);
    }
    throw new Error('User not found');
  }

  const payload = {
    ...data,
    role_id: data.roleId || (data as any).role_id,
  };
  const response = await apiClient.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: string): Promise<User> => {
  if (isMockMode()) {
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      users[idx].status = 'INACTIVE';
      saveStoredUsers(users);
      return simulateDelay(users[idx]);
    }
    throw new Error('User not found');
  }
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};
