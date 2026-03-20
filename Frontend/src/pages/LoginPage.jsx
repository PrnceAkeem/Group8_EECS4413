import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await axios.post(
        '/api/auth/login',
        { email, password },
        { withCredentials: true }
      );

      setMessage(`Welcome, ${response.data.user.firstName}!`);
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">6ixOutside</div>
        <h1>Welcome back.</h1>
        <p>
          Sign in to access your cart, manage your account, and shop the latest
          sneaker drops.
        </p>

        <div className="demo-box">
          <h3>Demo Accounts</h3>
          <p>
            <strong>Customer:</strong> maya@sixoutside.com / demo123
          </p>
          <p>
            <strong>Admin:</strong> admin@sixoutside.com / admin123
          </p>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
          <p className="auth-subtext">Enter your account details below.</p>

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <button type="submit" className="auth-btn">
            Sign In
          </button>

          {message && <p className="auth-message">{message}</p>}

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Sign Up</Link>
          </p>

          <p className="auth-switch">
            <Link to="/">Back to Store</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;