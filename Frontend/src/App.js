import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// App.js — root of the frontend.
// Maps URL paths to page components.
// BrowserRouter enables navigation without full page reloads.
// AuthProvider wraps everything so any page can read auth state — Observer pattern.

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing page — no login required */}
          <Route path="/" element={<LandingPage />} />

          {/* Catalog — pulls live products from API, supports filters + sort */}
          <Route path="/catalog" element={<CatalogPage />} />

          {/* Single product detail — /catalog/SNK-NIKE-AF1 etc. */}
          <Route path="/catalog/:id" element={<ProductDetailPage />} />

          {/* Auth pages */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
