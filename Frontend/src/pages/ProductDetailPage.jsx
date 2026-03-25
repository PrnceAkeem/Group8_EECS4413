import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/catalogApi';
import { useAuth } from '../context/AuthContext';

// ProductDetailPage — shows a single product fetched by its ID from the URL
// URL shape: /catalog/:id   e.g. /catalog/SNK-NIKE-AF1
//
// useParams() pulls the :id segment out of the URL so we know what to fetch.
// This is the same idea as request path params in Express (req.params.id).

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError]     = useState(null);

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

  return (
    <div className="store-page">
      <header className="store-header">
        <div className="store-logo">6ixOutside</div>

        <div className="store-actions">
          <Link to="/catalog" className="header-link">Back to Catalog</Link>
          {user ? (
            <>
              <span className="header-link">Hi, {user.firstName}</span>
              <button
                className="header-link filled"
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="header-link">Sign In</Link>
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
                style={{ width: '100%' }}
                onClick={() => alert('Add to cart — coming in Phase 3!')}
              >
                Add to Cart
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
