import apiClient from '../axios';
import { Order } from '../mock-data';
import {
  isMockMode,
  simulateDelay,
  getStoredOrders,
  saveStoredOrders,
  getStoredProducts,
  saveStoredProducts,
} from './_shared';

export const getOrders = async (params?: { search?: string; status?: string; staffId?: string; date?: string }): Promise<Order[]> => {
  if (isMockMode()) {
    let list = getStoredOrders();
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((o) => o.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          o.staffName.toLowerCase().includes(q)
      );
    }
    if (params?.staffId) {
      list = list.filter((o) => o.staffId === params.staffId);
    }
    return simulateDelay(list);
  }

  const response = await apiClient.get('/orders', { params });
  return response.data;
};

export const getOrderDetail = async (id: string): Promise<Order> => {
  if (isMockMode()) {
    const list = getStoredOrders();
    const order = list.find((o) => o.id === id || o.code === id);
    if (!order) throw new Error('Không tìm thấy đơn hàng');
    return simulateDelay(order);
  }

  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (data: Omit<Order, 'id' | 'code' | 'createdAt'>): Promise<Order> => {
  if (isMockMode()) {
    const list = getStoredOrders();
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const count = list.length + 1;
    const code = `HD-${dateStr}-${count < 10 ? '0' + count : count}`;

    const newOrder: Order = {
      ...data,
      id: `ord-${Date.now().toString().slice(-4)}`,
      code,
      createdAt: now.toISOString(),
    };

    // Giảm tồn kho các sản phẩm liên quan
    const products = getStoredProducts();
    data.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
        if (p.stock === 0) p.status = 'out_of_stock';
        else if (p.stock <= 5) p.status = 'low_stock';
      }
    });
    saveStoredProducts([...products]);
    saveStoredOrders([newOrder, ...list]);

    return simulateDelay(newOrder);
  }

  const response = await apiClient.post('/orders', data);
  return response.data;
};
