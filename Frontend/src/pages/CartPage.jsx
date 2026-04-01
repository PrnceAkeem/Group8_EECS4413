import { Link } from 'react-router-dom';

// TODO: Fetch cart items from cartApi.fetchCart() on mount.
// Show a table with product name, unit price, quantity controls (+/-), line total.
// Subtotal updates immediately when quantity changes.
// "Remove" button calls cartApi.removeFromCart().
// "Proceed to Checkout" button navigates to /checkout.

function CartPage() {
  return (
    <div>
      <h1>Cart</h1>
      <Link to="/catalog">Back to Catalog</Link>
    </div>
  );
}

export default CartPage;
