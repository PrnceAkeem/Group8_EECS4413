import ScaffoldPage from '../components/ScaffoldPage';

function AdminPage() {
  return (
    <ScaffoldPage
      title="Admin Dashboard"
      description="Admin route is protected and scaffolded by feature area."
      tasks={[
        'Sales tab: filter and render all orders',
        'Inventory tab: edit price, quantity, and active status',
        'Inventory tab: create product form',
        'Customers tab: edit customer profile/admin flags'
      ]}
    />
  );
}

export default AdminPage;
