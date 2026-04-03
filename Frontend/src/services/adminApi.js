function notImplemented(name) {
  throw new Error(`Phase 3 TODO: ${name} is not implemented yet.`);
}

export async function fetchAllOrders(filters = {}) {
  return notImplemented(`fetchAllOrders(${JSON.stringify(filters)})`);
}

export async function fetchCustomers() {
  return notImplemented('fetchCustomers');
}

export async function updateCustomer(id, payload) {
  return notImplemented(`updateCustomer(${id}, ${JSON.stringify(payload)})`);
}

export async function fetchAllProducts() {
  return notImplemented('fetchAllProducts');
}

export async function updateProduct(id, payload) {
  return notImplemented(`updateProduct(${id}, ${JSON.stringify(payload)})`);
}

export async function createProduct(payload) {
  return notImplemented(`createProduct(${JSON.stringify(payload)})`);
}
