function notImplemented(name) {
  throw new Error(`Phase 3 TODO: ${name} is not implemented yet.`);
}

export async function fetchCart() {
  return notImplemented('fetchCart');
}

export async function addToCart(productId, quantity) {
  return notImplemented(`addToCart(${productId}, ${quantity})`);
}

export async function updateCartItem(productId, quantity) {
  return notImplemented(`updateCartItem(${productId}, ${quantity})`);
}

export async function removeFromCart(productId) {
  return notImplemented(`removeFromCart(${productId})`);
}
