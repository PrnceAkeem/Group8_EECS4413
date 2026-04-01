import { Link, useParams } from 'react-router-dom';

// TODO: Read :id from URL params (useParams).
// Fetch order details with orderApi.fetchOrder(id).
// Display order number, list of items (product name, qty, line total), and grand total.
// Provide a "View Order Details" link to /orders/:id and a "Continue Shopping" link to /catalog.

function OrderConfirmationPage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Order Confirmation</h1>
      <p>Order #{id}</p>
      <Link to="/catalog">Continue Shopping</Link>
    </div>
  );
}

export default OrderConfirmationPage;
