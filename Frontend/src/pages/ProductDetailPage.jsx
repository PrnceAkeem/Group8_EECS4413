import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/catalogApi';
import { useAuth } from '../context/AuthContext';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setError(null);

    fetchProductById(id)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setProduct(data);
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError('Failed to load product. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;

    function handleOutsideClick(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isUserMenuOpen]);

  return (
    <div className="store-page">
      <header className="store-header">
        <Link to="/catalog" className="store-logo">6ixOutside</Link>
        <div aria-hidden="true" />

        <div className="store-actions">
          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="header-link user-menu-trigger"
                onClick={() => setIsUserMenuOpen((open) => !open)}
              >
                {user.firstName}
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-dropdown">
                  <Link to="/cart" className="user-menu-item" onClick={() => setIsUserMenuOpen(false)}>
                    Cart
                  </Link>
                  <Link to="/orders" className="user-menu-item" onClick={() => setIsUserMenuOpen(false)}>
                    Orders
                  </Link>
                  <Link to="/profile" className="user-menu-item" onClick={() => setIsUserMenuOpen(false)}>
                    Profile
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="user-menu-item" onClick={() => setIsUserMenuOpen(false)}>
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    className="user-menu-item danger"
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      await logout();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="header-link">Sign In</Link>
              <Link to="/register" className="header-link filled">Sign Up</Link>
            </>
          )}
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>

        {loading  && <p className="state-message">Loading product...</p>}
        {error    && <p className="state-message state-error">{error}</p>}

        {notFound && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p className="state-message state-error">Product not found.</p>
            <button
              className="product-btn"
              type="button"
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/catalog')}
            >
              Back to Catalog
            </button>
          </div>
        )}

        {!loading && !error && !notFound && product && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Product image */}
            <div className="product-image-wrap" style={{ flex: '0 0 320px', maxWidth: '320px' }}>
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </div>

            {/* Product info */}
            <div className="product-details" style={{ flex: 1, minWidth: '220px' }}>
              <p className="product-brand">{product.brand}</p>
              <h2 style={{ margin: '0.25rem 0' }}>{product.name}</h2>
              <p className="product-category">{product.category}</p>
              <p className="product-price" style={{ fontSize: '1.5rem', margin: '0.75rem 0' }}>
                ${(product.priceCents / 100).toFixed(2)}
              </p>

              {product.description && (
                <p style={{ color: '#555', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {product.description}
                </p>
              )}

              {product.colorway && (
                <p style={{ fontSize: '0.9rem', color: '#777' }}>
                  Colorway: {product.colorway}
                </p>
              )}

              {product.releaseYear && (
                <p style={{ fontSize: '0.9rem', color: '#777' }}>
                  Year: {product.releaseYear}
                </p>
              )}

              {product.sizeRange && (
                <p style={{ fontSize: '0.9rem', color: '#777' }}>
                  Sizes: {product.sizeRange}
                </p>
              )}

              <p style={{ fontSize: '0.9rem', color: product.inventoryQuantity > 0 ? '#2a7a2a' : '#c0392b', marginBottom: '1.25rem' }}>
                {product.inventoryQuantity > 0
                  ? `In Stock (${product.inventoryQuantity} available)`
                  : 'Out of Stock'}
              </p>

              <button
                className="product-btn"
                type="button"
                disabled
                style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }}
              >
                Add to Cart (Phase 3 In Progress)
              </button>

              <button
                className="product-btn"
                type="button"
                style={{ width: '100%', marginTop: '0.5rem', background: 'transparent', color: '#222', border: '1px solid #ccc' }}
                onClick={() => navigate('/catalog')}
              >
                Back to Catalog
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductDetailPage;
