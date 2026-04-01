// TODO: Check if user is logged in (useAuth). If not, redirect to /login.
// If adminOnly prop is true, also check user.isAdmin — redirect to / if not admin.

function ProtectedRoute({ children, adminOnly = false }) {
  return children;
}

export default ProtectedRoute;
