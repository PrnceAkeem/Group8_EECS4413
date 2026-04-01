import apiClient from './apiClient';

export async function fetchAllOrders(filters = {}) {
  // TODO: GET /api/admin/orders  (supports ?customerId=&productId=&from=&to=)
}

export async function fetchCustomers() {
  // TODO: GET /api/admin/customers
}

export async function updateCustomer(id, payload) {
  // TODO: PATCH /api/admin/customers/:id
}

export async function fetchAllProducts() {
  // TODO: GET /api/admin/products
}

export async function updateProduct(id, payload) {
  // TODO: PATCH /api/admin/products/:id
}

export async function createProduct(payload) {
  // TODO: POST /api/admin/products
}
