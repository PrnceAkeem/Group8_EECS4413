import ScaffoldPage from '../components/ScaffoldPage';

function ProfilePage() {
  return (
    <ScaffoldPage
      title="My Profile"
      description="Profile page is scaffolded for team implementation with clear section boundaries."
      tasks={[
        'Load profile and orders in parallel',
        'Implement Personal Info update form',
        'Implement Address create/update flow',
        'Implement Payment Method create/update flow',
        'Show Purchase History links to /orders/:id'
      ]}
    />
  );
}

export default ProfilePage;
