import apiClient from '../axios';
import { WorkShift, ShiftSummary, INITIAL_SHIFTS } from '../mock-data';
import { isMockMode, simulateDelay, LS_KEYS } from './_shared';

const getStoredShifts = (): WorkShift[] => {
  if (typeof window === 'undefined') return INITIAL_SHIFTS;
  const stored = localStorage.getItem(LS_KEYS.SHIFTS);
  if (!stored) {
    localStorage.setItem(LS_KEYS.SHIFTS, JSON.stringify(INITIAL_SHIFTS));
    return INITIAL_SHIFTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_SHIFTS;
  }
};

const saveStoredShifts = (shifts: WorkShift[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEYS.SHIFTS, JSON.stringify(shifts));
  }
};

export const getCurrentShift = async (): Promise<WorkShift> => {
  if (isMockMode()) {
    const shifts = getStoredShifts();
    const openShift = shifts.find((s) => s.status === 'OPEN') || {
      id: `shift-${Date.now().toString().slice(-4)}`,
      shiftName: 'Ca sáng (07:00 - 15:00) - 16/08/2026',
      staffId: 'user-002',
      staffName: 'Trần Thị Thu Ngân',
      startTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      endTime: null,
      initialCash: 500000,
      cashRevenue: 150000,
      cardRevenue: 380000,
      qrRevenue: 479000,
      totalRevenue: 1009000,
      ordersCount: 6,
      expectedCash: 650000,
      actualCash: 0,
      difference: -650000,
      status: 'OPEN',
      note: null,
      createdAt: new Date().toISOString(),
    };
    return simulateDelay(openShift);
  }

  const response = await apiClient.get('/shifts/current');
  return response.data;
};

export const closeCurrentShift = async (data: { actualCash: number; note?: string }): Promise<WorkShift> => {
  if (isMockMode()) {
    const shifts = getStoredShifts();
    const openIndex = shifts.findIndex((s) => s.status === 'OPEN');
    if (openIndex >= 0) {
      const shift = shifts[openIndex];
      shift.actualCash = data.actualCash;
      shift.difference = data.actualCash - shift.expectedCash;
      shift.note = data.note || null;
      shift.endTime = new Date().toISOString();
      shift.status = 'CLOSED';
      saveStoredShifts([...shifts]);
      return simulateDelay(shift);
    }
    const closed: WorkShift = {
      id: `shift-${Date.now().toString().slice(-4)}`,
      shiftName: 'Ca vừa đóng',
      staffId: 'user-current',
      staffName: 'Nhân Viên',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date().toISOString(),
      initialCash: 500000,
      cashRevenue: 150000,
      cardRevenue: 0,
      qrRevenue: 0,
      totalRevenue: 150000,
      ordersCount: 1,
      expectedCash: 650000,
      actualCash: data.actualCash,
      difference: data.actualCash - 650000,
      status: 'CLOSED',
      note: data.note || null,
      createdAt: new Date().toISOString(),
    };
    return simulateDelay(closed);
  }

  const response = await apiClient.post('/shifts/close', data);
  return response.data;
};

export const getShifts = async (params?: { status?: string; staffId?: string; date?: string; branchId?: string }): Promise<WorkShift[]> => {
  if (isMockMode()) {
    let list = getStoredShifts();
    if (params?.status) list = list.filter((s) => s.status === params.status);
    if (params?.staffId) list = list.filter((s) => s.staffId === params.staffId);
    if (params?.branchId && params.branchId !== 'ALL') {
      const match = list.filter((s) => !(s as any).branchId || (s as any).branchId === params.branchId);
      if (match.length > 0) list = match;
    }
    return simulateDelay(list);
  }

  const response = await apiClient.get('/shifts', { params });
  return response.data;
};

export const getShiftSummary = async (params?: { date?: string; branchId?: string }): Promise<ShiftSummary> => {
  if (isMockMode()) {
    let list = getStoredShifts();
    if (params?.branchId && params.branchId !== 'ALL') {
      const match = list.filter((s) => !(s as any).branchId || (s as any).branchId === params.branchId);
      if (match.length > 0) list = match;
    }
    const totalShiftsCount = list.length;
    const closedShiftsCount = list.filter((s) => s.status === 'CLOSED').length;
    const openShiftsCount = list.filter((s) => s.status === 'OPEN').length;
    const totalRevenue = list.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalCash = list.reduce((sum, s) => sum + s.cashRevenue, 0);
    const totalCard = list.reduce((sum, s) => sum + s.cardRevenue, 0);
    const totalQr = list.reduce((sum, s) => sum + s.qrRevenue, 0);
    const totalDifference = list.filter((s) => s.status === 'CLOSED').reduce((sum, s) => sum + s.difference, 0);

    return simulateDelay({
      totalShiftsCount,
      closedShiftsCount,
      openShiftsCount,
      totalRevenue,
      totalCash,
      totalCard,
      totalQr,
      totalDifference,
      shifts: list,
    });
  }

  const response = await apiClient.get('/shifts/summary', { params });
  return response.data;
};
