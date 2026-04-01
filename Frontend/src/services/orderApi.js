import apiClient from './apiClient';

export async function placeOrder(shippingAddressId, paymentMethodId) {
  // TODO: POST /api/orders  { shippingAddressId, paymentMethodId }
}

export async function fetchOrders() {
  // TODO: GET /api/orders
}

export async function fetchOrder(orderId) {
  // TODO: GET /api/orders/:orderId
}
