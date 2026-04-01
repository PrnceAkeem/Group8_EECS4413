import { Link } from 'react-router-dom';

// TODO: On mount, load cart (cartApi.fetchCart) and profile (profileApi.fetchProfile) in parallel.
// If cart is empty, redirect to /cart.
// Show saved addresses in a dropdown + a form to add a new one (calls profileApi.saveAddress).
// Show saved payment methods in a dropdown + a form to add a new one (calls profileApi.savePaymentMethod).
// Show order summary: line items, subtotal, 13% HST tax, total.
// "Confirm Order" calls orderApi.placeOrder(shippingAddressId, paymentMethodId).
//   - On success (201): navigate to /orders/:id/confirmation
//   - On 402 payment denied: show "Credit Card Authorization Failed." with Try Again / Cancel options.

function CheckoutPage() {
  return (
    <div>
      <h1>Checkout</h1>
      <Link to="/cart">Back to Cart</Link>
    </div>
  );
}

export default CheckoutPage;
