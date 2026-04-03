import ScaffoldPage from '../components/ScaffoldPage';

function CartPage() {
  return (
    <ScaffoldPage
      title="Cart"
      description="This page is scaffolded for Phase 3 so teammates can implement cart behavior in parallel."
      tasks={[
        'Fetch cart items from cartApi.fetchCart() on mount',
        'Render product rows with unit price, quantity controls, and line totals',
        'Update subtotal live when quantity changes',
        'Call cartApi.removeFromCart() for remove action',
        'Wire Proceed to Checkout navigation to /checkout'
      ]}
    />
  );
}

export default CartPage;
