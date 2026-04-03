import ScaffoldPage from '../components/ScaffoldPage';

function CheckoutPage() {
  return (
    <ScaffoldPage
      title="Checkout"
      description="Checkout structure is in place and waiting for service wiring from the team."
      tasks={[
        'Load cart and profile data in parallel on mount',
        'Redirect to /cart if cart is empty',
        'Support saved/new address and payment method flows',
        'Show subtotal, 13% HST, and grand total',
        'Handle order placement success and 402 payment denial'
      ]}
    />
  );
}

export default CheckoutPage;
