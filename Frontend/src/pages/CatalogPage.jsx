import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCatalog } from '../services/catalogApi';

function CatalogPage() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [sort, setSort]           = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchCatalog({ sort: sort || undefined })
      .then(setProducts)
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setLoading(false));
  }, [sort]);

  return (
    <div className="store-page">
      <header className="store-header">
        <div className="store-logo">6ixOutside</div>

        <div className="store-search">
          <input type="text" placeholder="Search shoes, brands, categories..." readOnly />
        </div>

        <div className="store-actions">
          <Link to="/login" className="header-link">Sign In</Link>
          <Link to="/register" className="header-link filled">Sign Up</Link>
        </div>
      </header>

      <section className="top-banner">
        <div className="top-banner-content">
          <p className="banner-label">Streetwear Footwear</p>
          <p className="banner-copy">
            Shop trending sneakers, everyday essentials, and the newest drops in one place.
          </p>
        </div>
      </section>

      <main className="store-content">
        <section className="products-section">
          <div className="products-topbar">
            <h2>All Products {!loading && `(${products.length})`}</h2>

            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

          {loading && (
            <p className="state-message">Loading products...</p>
          )}

          {error && (
            <p className="state-message state-error">{error}</p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="state-message">No products found.</p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.productId} className="product-card">
                  <div className="product-image-wrap">
                    <img src={product.imageUrl} alt={product.name} />
                  </div>

                  <div className="product-details">
                    <p className="product-brand">{product.brand}</p>
                    <h3>{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">
                      ${(product.priceCents / 100).toFixed(2)}
                    </p>
                    <button
                      className="product-btn"
                      type="button"
                      onClick={() => navigate(`/catalog/${product.productId}`)}
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="filters-panel">
          <h3>Filters</h3>
          <p className="state-message" style={{ fontSize: '0.85rem', color: '#888' }}>
            Coming soon
          </p>
        </aside>
      </main>
    </div>
  );
}

export default CatalogPage;
