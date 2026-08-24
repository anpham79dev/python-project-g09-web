import apiClient from '../axios';
import { User } from '../mock-data';
import { isMockMode, simulateDelay, getStoredUsers, getStoredRoles } from './_shared';

export const login = async (credentials: { username: string; password?: string }): Promise<{ token: string; user: User }> => {
  if (isMockMode()) {
    const users = getStoredUsers();
    const roles = getStoredRoles();
    const cleanUser = credentials.username.toLowerCase().trim();
    let found = users.find((u) => u.username.toLowerCase() === cleanUser);

    if (!found) {
      const isSuper = cleanUser === 'superadmin';
      const isAdmin = cleanUser === 'admin' || cleanUser.includes('admin');
      const rCode = isSuper ? 'SUPER_ADMIN' : (isAdmin ? 'ADMIN' : 'STAFF');
      const matchedRole = roles.find((r) => r.code === rCode) || roles[0];

      found = {
        id: isSuper ? 'user-000' : (isAdmin ? 'user-001' : 'user-002'),
        username: cleanUser,
        fullName: isSuper ? 'Tổng Quản Trị Hệ Thống' : (isAdmin ? 'Quản Trị Viên' : 'Thu Ngân Bán Hàng'),
        email: `${cleanUser}@artisanbakery.vn`,
        phone: '0901234567',
        role: rCode,
        roleId: matchedRole.id,
        roleName: matchedRole.name,
        permissions: matchedRole.permissions.map((p) => p.code),
        permissionsVersion: matchedRole.permissions_version || 1,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      } as User;
    } else {
      // Refresh permissions from role definition
      const userRole = roles.find((r) => r.id === found!.roleId || r.code === found!.role);
      if (userRole) {
        found.roleId = userRole.id;
        found.roleName = userRole.name;
        found.role = userRole.code;
        found.permissions = userRole.permissions.map((p) => p.code);
        found.permissionsVersion = userRole.permissions_version || 1;
      }
    }

    return simulateDelay({
      token: `mock_jwt_token_${found.role.toLowerCase()}_${Date.now()}`,
      user: found,
    });
  }

  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};
