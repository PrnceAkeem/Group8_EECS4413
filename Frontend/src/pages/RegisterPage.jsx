import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

//RegisterPage — allows a new customer to create an account.
//On success, the backend inserts a new row into the customers table
//and the user is redirected to the login page to sign in.

function RegisterPage() {
  //One useState for each form field
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [dob, setDob]             = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');

  //message shows feedback to the user (success or error)
  const [message, setMessage]     = useState('');

  //useNavigate lets us redirect to login after successful registration
  const navigate = useNavigate();

  //handleSubmit runs when the Sign Up button is clicked
  async function handleSubmit(e) {
    //Prevent the default browser form submission
    e.preventDefault();

    try {
      //Send all form fields to the backend register endpoint
      await axios.post('/api/auth/register',
        { firstName, lastName, dob, email, password },
        { withCredentials: true }
      );

      //Registration worked — tell the user and send them to login
      setMessage('Account created! Redirecting to Sign In...');
      setTimeout(() => navigate('/login'), 1500);

    } catch (error) {
      //Show the error message from the backend (e.g. email already in use)
      setMessage(error.response?.data?.message || 'Registration failed.');
    }
  }

  return (
    <div>
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit}>

        {/* First Name */}
        <div>
          <label>First Name:</label><br />
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>

        <br />

        {/* Last Name */}
        <div>
          <label>Last Name:</label><br />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>

        <br />

        {/* Date of Birth */}
        <div>
          <label>Date of Birth:</label><br />
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <br />

        {/* Email */}
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
          />
        </div>

        <br />

        {/* Password */}
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
        </div>

        <br />

        {/* Submit button */}
        <button type="submit">Sign Up</button>

      </form>

      {/* Shows success or error message after submission */}
      {message && <p>{message}</p>}

      <br />
      {/* Link back to login if they already have an account */}
      <p>Already have an account? <Link to="/login">Sign In</Link></p>

    </div>
  );
}

export default RegisterPage;
