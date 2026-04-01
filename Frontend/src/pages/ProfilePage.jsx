import { Link } from 'react-router-dom';

// TODO: On mount, load profile (profileApi.fetchProfile) and orders (orderApi.fetchOrders) in parallel.
// Sections to build:
//   1. Personal Info — editable form (firstName, lastName, dob, phone). Save calls profileApi.updateProfile().
//   2. Shipping Addresses — list saved addresses + form to add/update one (profileApi.saveAddress).
//   3. Payment Methods — list saved cards + form to add/update one (profileApi.savePaymentMethod).
//   4. Purchase History — list of past orders with a link to /orders/:id for each.

function ProfilePage() {
  return (
    <div>
      <h1>My Profile</h1>
      <Link to="/catalog">Back to Store</Link>
    </div>
  );
}

export default ProfilePage;
