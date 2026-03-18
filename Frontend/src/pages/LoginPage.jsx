import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

//LoginPage — allows an existing customer to sign in.
//On success, the backend creates a session and sends back a cookie.
//The user is then redirected to the landing page.

function LoginPage() {
  //useState holds the value of each input field as the user types
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  //message shows feedback to the user (success or error)
  const [message, setMessage]   = useState('');

  //useNavigate lets us redirect the user to another page after login
  const navigate = useNavigate();

  //handleSubmit runs when the Sign In button is clicked
  async function handleSubmit(e) {
    //Prevent the default browser form submission (which would reload the page)
    e.preventDefault();

    try {
      //Send a POST request to the backend login endpoint
      //withCredentials: true is required so the browser saves the session cookie
      const response = await axios.post('/api/auth/login',
        { email, password },
        { withCredentials: true }
      );

      //Show a welcome message then redirect to the landing page
      setMessage(`Welcome, ${response.data.user.firstName}!`);
      setTimeout(() => navigate('/'), 1000);

    } catch (error) {
      //If login failed, show the error message returned by the backend
      setMessage(error.response?.data?.message || 'Login failed.');
    }
  }

  return (
    <div>
      <h2>Sign In</h2>

      <form onSubmit={handleSubmit}>

        {/* Email field */}
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <br />

        {/* Password field */}
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <br />

        {/* Submit button — triggers handleSubmit */}
        <button type="submit">Sign In</button>

      </form>

      {/* Shows success or error message after submission */}
      {message && <p>{message}</p>}

      <br />
      {/* Link to register page if the user doesn't have an account */}
      <p>Don't have an account? <Link to="/register">Sign Up</Link></p>

    </div>
  );
}

export default LoginPage;
