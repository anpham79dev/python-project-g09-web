import apiClient from '../axios';
import { Product } from '../mock-data';
import { isMockMode, simulateDelay, getStoredProducts, saveStoredProducts } from './_shared';

export const getProducts = async (params?: { search?: string; category?: string; status?: string }): Promise<Product[]> => {
  if (isMockMode()) {
    let list = getStoredProducts();
    if (params?.category && params.category !== 'Tất cả') {
      list = list.filter((p) => p.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (params?.status) {
      list = list.filter((p) => p.status === params.status);
    }
    return simulateDelay(list);
  }

  const response = await apiClient.get('/products', { params });
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  if (isMockMode()) {
    const list = getStoredProducts();
    const product = list.find((p) => p.id === id);
    if (!product) throw new Error('Không tìm thấy sản phẩm');
    return simulateDelay(product);
  }

  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  if (isMockMode()) {
    const list = getStoredProducts();
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    saveStoredProducts([newProduct, ...list]);
    return simulateDelay(newProduct);
  }

  const response = await apiClient.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  if (isMockMode()) {
    const list = getStoredProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy sản phẩm để cập nhật');

    const updated: Product = { ...list[index], ...data };
    list[index] = updated;
    saveStoredProducts([...list]);
    return simulateDelay(updated);
  }

  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<{ success: boolean }> => {
  if (isMockMode()) {
    const list = getStoredProducts();
    const filtered = list.filter((p) => p.id !== id);
    saveStoredProducts(filtered);
    return simulateDelay({ success: true });
  }

  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};
