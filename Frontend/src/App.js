import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './index.css';

// App.js — root of the frontend.
// Maps URL paths to page components.
// BrowserRouter enables navigation without full page reloads.

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page — no login required */}
        <Route path="/" element={<LandingPage />} />

        {/* Sign in page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Sign up page */}
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
