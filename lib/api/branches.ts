import apiClient from "../axios";
import { Branch, StockItem } from "../mock-data";
import {
  isMockMode,
  simulateDelay,
  getStoredBranches,
  saveStoredBranches,
  getStoredProducts,
  getStoredStockOverrides,
  saveStoredStockOverrides,
} from "./_shared";

export const getBranches = async (params?: {
  status?: string;
}): Promise<Branch[]> => {
  if (isMockMode()) {
    let list = getStoredBranches();
    if (params?.status) list = list.filter((b) => b.status === params.status);
    return simulateDelay(list);
  }
  const response = await apiClient.get("/branches", { params });
  return response.data;
};

export const createBranch = async (
  data: Omit<Branch, "id" | "createdAt" | "warehouses">,
): Promise<Branch> => {
  if (isMockMode()) {
    const branches = getStoredBranches();
    const newBranch: Branch = {
      ...data,
      id: `branch-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      warehouses: [
        {
          id: `wh-${Date.now().toString().slice(-4)}`,
          branchId: `branch-${Date.now().toString().slice(-4)}`,
          code: `KHO-${data.code}-POS`,
          name: `Kho Quầy Bán Lẻ - ${data.name}`,
          warehouseType: "RETAIL",
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    branches.push(newBranch);
    saveStoredBranches(branches);
    return simulateDelay(newBranch);
  }
  const response = await apiClient.post("/branches", data);
  return response.data;
};

export const updateBranch = async (
  id: string,
  data: Partial<Branch>,
): Promise<Branch> => {
  if (isMockMode()) {
    const branches = getStoredBranches();
    const idx = branches.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Không tìm thấy chi nhánh để cập nhật");
    branches[idx] = { ...branches[idx], ...data };
    saveStoredBranches(branches);
    return simulateDelay(branches[idx]);
  }
  const response = await apiClient.put(`/branches/${id}`, data);
  return response.data;
};

export const getWarehouseStocks = async (params?: {
  warehouseId?: string;
  branchId?: string;
}): Promise<StockItem[]> => {
  if (isMockMode()) {
    const products = getStoredProducts();
    const branches = getStoredBranches();
    const overrides = getStoredStockOverrides();
    const stocks: StockItem[] = [];

    branches.forEach((b) => {
      b.warehouses.forEach((w) => {
        if (params?.warehouseId && w.id !== params.warehouseId) return;
        if (params?.branchId && b.id !== params.branchId) return;

        products.forEach((p) => {
          const quantity = overrides[`${w.id}::${p.id}`] ?? p.stock;
          stocks.push({
            id: `stk-${w.id}-${p.id}`,
            warehouseId: w.id,
            warehouseName: w.name,
            branchId: b.id,
            branchName: b.name,
            productId: p.id,
            productName: p.name,
            productImage: p.image,
            productCategory: p.category,
            quantity,
            minAlertStock: 5,
            status:
              quantity > 5
                ? "in_stock"
                : quantity > 0
                  ? "low_stock"
                  : "out_of_stock",
            updatedAt: new Date().toISOString(),
          });
        });
      });
    });

    return simulateDelay(stocks);
  }
  const response = await apiClient.get("/branches/stocks", { params });
  return response.data;
};

export const updateWarehouseStock = async (data: {
  warehouseId: string;
  productId: string;
  quantity: number;
  minAlertStock?: number;
}): Promise<StockItem> => {
  if (isMockMode()) {
    const overrides = getStoredStockOverrides();
    overrides[`${data.warehouseId}::${data.productId}`] = data.quantity;
    saveStoredStockOverrides(overrides);
    return simulateDelay({
      id: `stk-${data.warehouseId}-${data.productId}`,
      warehouseId: data.warehouseId,
      productId: data.productId,
      quantity: data.quantity,
      minAlertStock: data.minAlertStock || 5,
      status:
        data.quantity > 5
          ? "in_stock"
          : data.quantity > 0
            ? "low_stock"
            : "out_of_stock",
      updatedAt: new Date().toISOString(),
    });
  }
  const response = await apiClient.put("/branches/stocks", data);
  return response.data;
};
