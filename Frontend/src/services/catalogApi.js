import apiClient from './apiClient';

export async function fetchCatalog(params = {}) {
  const { data } = await apiClient.get('/api/catalog', { params });
  return data.products;
}

export async function fetchProductById(id) {
  const { data } = await apiClient.get(`/api/catalog/${id}`);
  return data.product;
}

export async function fetchBrands() {
  const { data } = await apiClient.get('/api/catalog/brands');
  return data.brands;
}

export async function fetchCategories() {
  const { data } = await apiClient.get('/api/catalog/categories');
  return data.categories;
}
