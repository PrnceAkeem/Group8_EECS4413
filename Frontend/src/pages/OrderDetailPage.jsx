import { useParams } from 'react-router-dom';
import ScaffoldPage from '../components/ScaffoldPage';

function OrderDetailPage() {
  const { id } = useParams();

  return (
    <ScaffoldPage
      title={`Order #${id}`}
      description="Order detail structure is ready for implementation."
      tasks={[
        'Fetch a single order with orderApi.fetchOrder(id)',
        'Show status, payment status, and placed date',
        'Render line items with unit and line totals',
        'Display subtotal, tax, and total'
      ]}
    />
  );
}

export default OrderDetailPage;
