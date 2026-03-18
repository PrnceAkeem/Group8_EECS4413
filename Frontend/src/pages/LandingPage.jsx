import { Link } from 'react-router-dom';

// LandingPage — the first page any visitor sees.
// No login required. Anyone can browse this page.

function LandingPage() {
  return (
    <div>

      {/* Top navigation bar — Sign In and Sign Up links in top right corner */}
      <div style={{ textAlign: 'right', padding: '10px' }}>
        {/* Link navigates to /login without reloading the page */}
        <Link to="/login">Sign In</Link>
        &nbsp;&nbsp;
        {/* Link navigates to /register without reloading the page */}
        <Link to="/register">Sign Up</Link>
      </div>

      {/* Main landing content — placeholder until real catalog is built */}
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h1>6ixOutside</h1>
        <p>Landing Page Coming Soon</p>
      </div>

    </div>
  );
}

export default LandingPage;
