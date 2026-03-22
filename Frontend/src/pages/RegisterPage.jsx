import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await axios.post(
        '/api/auth/register',
        { firstName, lastName, dob, email, password },
        { withCredentials: true }
      );

      setMessage('Account created! Redirecting to Sign In...');
      setTimeout(() => navigate('/login'), 1300);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">6ixOutside</div>
        <h1>Create your account.</h1>
        <p>
          Join the store to save favorites, track orders, and move through
          checkout faster.
        </p>

        <div className="demo-box">
          <h3>What you get</h3>
          <ul className="auth-list">
            <li>Faster checkout and saved account info</li>
            <li>Order updates and purchase history</li>
            <li>Early access to selected sneaker drops</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>
          <p className="auth-subtext">Fill in your details to get started.</p>

          <div className="auth-row">
            <div>
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Akeem"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Mitchell"
                required
              />
            </div>
          </div>

          <label htmlFor="dob">Date of Birth</label>
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@email.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
          />

          <button type="submit" className="auth-btn">
            Create Account
          </button>

          {message && <p className="auth-message">{message}</p>}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
          <p className="auth-switch">
            <Link to="/">Back to Store</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
