import apiClient from './apiClient';

export async function fetchCart() {
  // TODO: GET /api/cart
}

export async function addToCart(productId, quantity) {
  // TODO: POST /api/cart  { productId, quantity }
}

export async function updateCartItem(productId, quantity) {
  // TODO: PATCH /api/cart/:productId  { quantity }
}

export async function removeFromCart(productId) {
  // TODO: DELETE /api/cart/:productId
}
