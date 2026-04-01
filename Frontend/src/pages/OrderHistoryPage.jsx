import { Link } from 'react-router-dom';

// TODO: Fetch all orders for the logged-in user with orderApi.fetchOrders() on mount.
// Display a table: Order ID, date placed, status, total, and a "View" link to /orders/:id.
// Show a message if there are no past orders.

function OrderHistoryPage() {
  return (
    <div>
      <h1>Order History</h1>
      <Link to="/catalog">Back to Store</Link>
    </div>
  );
}

export default OrderHistoryPage;
