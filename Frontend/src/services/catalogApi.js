import axios from 'axios';

const api = axios.create({
  baseURL: '/api/catalog'
});

export async function fetchCatalog(params = {}) {
  const { data } = await api.get('/', { params });
  return data.products;
}

export async function fetchProductById(id) {
  const { data } = await api.get(`/${id}`);
  return data.product;
}

export async function fetchBrands() {
  const { data } = await api.get('/brands');
  return data.brands;
}

export async function fetchCategories() {
  const { data } = await api.get('/categories');
  return data.categories;
}
