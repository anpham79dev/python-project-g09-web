import apiClient from "../axios";
import {
  ShiftTemplate,
  SystemSettings,
  INITIAL_SHIFT_TEMPLATES,
  INITIAL_SYSTEM_SETTINGS,
} from "../mock-data";
import {
  isMockMode,
  simulateDelay,
  LS_KEYS,
  getStoredList,
  saveStoredList,
} from "./_shared";

export const getSystemSettings = async (): Promise<SystemSettings> => {
  if (isMockMode()) {
    const stored = localStorage.getItem(LS_KEYS.SETTINGS);
    if (!stored) {
      localStorage.setItem(
        LS_KEYS.SETTINGS,
        JSON.stringify(INITIAL_SYSTEM_SETTINGS),
      );
      return simulateDelay(INITIAL_SYSTEM_SETTINGS);
    }
    try {
      return simulateDelay(JSON.parse(stored));
    } catch {
      return simulateDelay(INITIAL_SYSTEM_SETTINGS);
    }
  }
  const response = await apiClient.get("/settings");
  return response.data;
};

export const updateSystemSettings = async (
  data: Partial<SystemSettings>,
): Promise<SystemSettings> => {
  if (isMockMode()) {
    const current = await getSystemSettings();
    const updated = { ...current, ...data };
    localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(updated));
    return simulateDelay(updated);
  }
  const response = await apiClient.put("/settings", data);
  return response.data;
};

const getStoredShiftTemplates = (): ShiftTemplate[] =>
  getStoredList(LS_KEYS.TEMPLATES, INITIAL_SHIFT_TEMPLATES);
const saveStoredShiftTemplates = (templates: ShiftTemplate[]) =>
  saveStoredList(LS_KEYS.TEMPLATES, templates);

export const getShiftTemplates = async (): Promise<ShiftTemplate[]> => {
  if (isMockMode()) {
    return simulateDelay(getStoredShiftTemplates());
  }
  const response = await apiClient.get("/settings/shift-templates");
  return response.data;
};

export const createShiftTemplate = async (
  data: Omit<ShiftTemplate, "id" | "createdAt">,
): Promise<ShiftTemplate> => {
  if (isMockMode()) {
    const templates = getStoredShiftTemplates();
    const newTmpl: ShiftTemplate = {
      ...data,
      id: `tmpl-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    saveStoredShiftTemplates([...templates, newTmpl]);
    return simulateDelay(newTmpl);
  }
  const response = await apiClient.post("/settings/shift-templates", data);
  return response.data;
};

export const updateShiftTemplate = async (
  id: string,
  data: Partial<ShiftTemplate>,
): Promise<ShiftTemplate> => {
  if (isMockMode()) {
    const templates = getStoredShiftTemplates();
    const idx = templates.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Không tìm thấy mẫu ca để cập nhật");
    templates[idx] = { ...templates[idx], ...data };
    saveStoredShiftTemplates(templates);
    return simulateDelay(templates[idx]);
  }
  const response = await apiClient.put(`/settings/shift-templates/${id}`, data);
  return response.data;
};

export const deleteShiftTemplate = async (id: string): Promise<void> => {
  if (isMockMode()) {
    const templates = getStoredShiftTemplates();
    saveStoredShiftTemplates(templates.filter((t) => t.id !== id));
    return simulateDelay(undefined);
  }
  await apiClient.delete(`/settings/shift-templates/${id}`);
};
