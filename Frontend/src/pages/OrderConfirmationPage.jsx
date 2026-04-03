import { useParams } from 'react-router-dom';
import ScaffoldPage from '../components/ScaffoldPage';

function OrderConfirmationPage() {
  const { id } = useParams();

  return (
    <ScaffoldPage
      title={`Order Confirmation #${id}`}
      description="Order confirmation route is wired. Team can now implement the final UI/details."
      tasks={[
        'Fetch order details using orderApi.fetchOrder(id)',
        'Display order items and totals',
        'Link to /orders/:id for full detail view'
      ]}
    />
  );
}

export default OrderConfirmationPage;
