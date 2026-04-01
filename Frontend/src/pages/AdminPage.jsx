import { Link } from 'react-router-dom';

// TODO: Admin dashboard with three tabs: Sales, Inventory, Customers.
//
// Sales tab:
//   - Filter inputs: Customer ID, Product ID, date range (from/to).
//   - "Apply Filters" calls adminApi.fetchAllOrders(filters).
//   - Table: Order ID, customer name, status, total, date.
//
// Inventory tab:
//   - Table of all products (adminApi.fetchAllProducts) with inline editable
//     price, inventory quantity, and active toggle. "Save" calls adminApi.updateProduct().
//   - Form to create a new product (adminApi.createProduct).
//
// Customers tab:
//   - Table of all customers (adminApi.fetchCustomers) with inline editable
//     name, email, phone, and admin toggle. "Save" calls adminApi.updateCustomer().

function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <Link to="/catalog">Back to Store</Link>
    </div>
  );
}

export default AdminPage;
