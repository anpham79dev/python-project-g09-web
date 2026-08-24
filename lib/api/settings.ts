import apiClient from '../axios';
import { ShiftTemplate, SystemSettings, INITIAL_SHIFT_TEMPLATES, INITIAL_SYSTEM_SETTINGS } from '../mock-data';
import { isMockMode, simulateDelay, LS_KEYS } from './_shared';

export const getSystemSettings = async (): Promise<SystemSettings> => {
  if (isMockMode()) {
    const stored = localStorage.getItem(LS_KEYS.SETTINGS);
    if (!stored) {
      localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(INITIAL_SYSTEM_SETTINGS));
      return simulateDelay(INITIAL_SYSTEM_SETTINGS);
    }
    try {
      return simulateDelay(JSON.parse(stored));
    } catch {
      return simulateDelay(INITIAL_SYSTEM_SETTINGS);
    }
  }
  const response = await apiClient.get('/settings');
  return response.data;
};

export const updateSystemSettings = async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
  if (isMockMode()) {
    const current = await getSystemSettings();
    const updated = { ...current, ...data };
    localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(updated));
    return simulateDelay(updated);
  }
  const response = await apiClient.put('/settings', data);
  return response.data;
};

export const getShiftTemplates = async (): Promise<ShiftTemplate[]> => {
  if (isMockMode()) {
    const stored = localStorage.getItem(LS_KEYS.TEMPLATES);
    if (!stored) {
      localStorage.setItem(LS_KEYS.TEMPLATES, JSON.stringify(INITIAL_SHIFT_TEMPLATES));
      return simulateDelay(INITIAL_SHIFT_TEMPLATES);
    }
    try {
      return simulateDelay(JSON.parse(stored));
    } catch {
      return simulateDelay(INITIAL_SHIFT_TEMPLATES);
    }
  }
  const response = await apiClient.get('/settings/shift-templates');
  return response.data;
};

export const createShiftTemplate = async (data: Omit<ShiftTemplate, 'id' | 'createdAt'>): Promise<ShiftTemplate> => {
  if (isMockMode()) {
    const templates = await getShiftTemplates();
    const newTmpl: ShiftTemplate = {
      ...data,
      id: `tmpl-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    templates.push(newTmpl);
    localStorage.setItem(LS_KEYS.TEMPLATES, JSON.stringify(templates));
    return simulateDelay(newTmpl);
  }
  const response = await apiClient.post('/settings/shift-templates', data);
  return response.data;
};

export const updateShiftTemplate = async (id: string, data: Partial<ShiftTemplate>): Promise<ShiftTemplate> => {
  if (isMockMode()) {
    const templates = await getShiftTemplates();
    const idx = templates.findIndex((t) => t.id === id);
    if (idx >= 0) {
      templates[idx] = { ...templates[idx], ...data };
      localStorage.setItem(LS_KEYS.TEMPLATES, JSON.stringify(templates));
      return simulateDelay(templates[idx]);
    }
  }
  const response = await apiClient.put(`/settings/shift-templates/${id}`, data);
  return response.data;
};

export const deleteShiftTemplate = async (id: string): Promise<void> => {
  if (isMockMode()) {
    const templates = await getShiftTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(LS_KEYS.TEMPLATES, JSON.stringify(filtered));
    return simulateDelay(undefined);
  }
  await apiClient.delete(`/settings/shift-templates/${id}`);
};
