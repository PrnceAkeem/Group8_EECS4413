import ScaffoldPage from '../components/ScaffoldPage';

function OrderHistoryPage() {
  return (
    <ScaffoldPage
      title="Order History"
      description="Order history route is scaffolded and protected."
      tasks={[
        'Fetch orders from orderApi.fetchOrders()',
        'Render order table with ID, date, status, and total',
        'Link each row to /orders/:id',
        'Show empty-state message when no orders exist'
      ]}
    />
  );
}

export default OrderHistoryPage;
