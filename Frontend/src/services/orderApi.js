function notImplemented(name) {
  throw new Error(`Phase 3 TODO: ${name} is not implemented yet.`);
}

export async function placeOrder(shippingAddressId, paymentMethodId) {
  return notImplemented(`placeOrder(${shippingAddressId}, ${paymentMethodId})`);
}

export async function fetchOrders() {
  return notImplemented('fetchOrders');
}

export async function fetchOrder(orderId) {
  return notImplemented(`fetchOrder(${orderId})`);
}
