import { Link, useParams } from 'react-router-dom';

// TODO: Read :id from URL params (useParams).
// Fetch order with orderApi.fetchOrder(id).
// Show order status, payment status, date placed.
// Show a table of line items: product name, quantity, unit price, line total.
// Show subtotal, tax, and grand total.

function OrderDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Order #{id}</h1>
      <Link to="/orders">Back to Order History</Link>
    </div>
  );
}

export default OrderDetailPage;
