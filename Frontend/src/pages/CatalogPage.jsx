import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchCatalog, fetchBrands, fetchCategories } from '../services/catalogApi';
import { SORT_STRATEGIES } from '../utils/sortStrategies';
import { useAuth } from '../context/AuthContext';

function CatalogPage() {
  // useSearchParams reads/writes the URL query string (?brand=Nike&sort=price_asc)
  // This means refreshing the page keeps your filter selection
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [brands, setBrands]         = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch filter options once on mount — data-driven from the DB
  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // Read initial values from the URL (so refresh preserves state)
  const brand    = searchParams.get('brand')    || '';
  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')     || '';
  const q        = searchParams.get('q')        || '';

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Re-fetch whenever any filter/sort/search changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchCatalog({
      brand:    brand    || undefined,
      category: category || undefined,
      sort:     sort     || undefined,
      q:        q        || undefined
    })
      .then(setProducts)
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setLoading(false));
  }, [brand, category, sort, q]);

  // Helper: update one param in the URL without wiping the others
  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  // Clear all filters + sort + search at once
  function clearAll() {
    setSearchParams({});
  }

  const hasFilters = brand || category || sort || q;

  return (
    <div className="store-page">
      <header className="store-header">
        <div className="store-logo">6ixOutside</div>

        {/* Search input — updates ?q= in the URL on every keystroke */}
        <div className="store-search">
          <input
            type="text"
            placeholder="Search shoes, brands, categories..."
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
          />
        </div>

        <div className="store-actions">
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

            {/* Sort dropdown — Strategy pattern: each option maps to a SORT_STRATEGIES entry */}
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
            >
              <option value="">Sort By</option>
              {SORT_STRATEGIES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          {loading && <p className="state-message">Loading products...</p>}
          {error   && <p className="state-message state-error">{error}</p>}

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

        {/* Filters sidebar */}
        <aside className="filters-panel">
          <h3>Filters</h3>

          <div className="filter-dropdown">
            <label>Brand</label>
            <select value={brand} onChange={(e) => setParam('brand', e.target.value)}>
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <label>Category</label>
            <select value={category} onChange={(e) => setParam('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              className="product-btn"
              type="button"
              style={{ marginTop: '1rem', width: '100%' }}
              onClick={clearAll}
            >
              Clear Filters
            </button>
          )}
        </aside>
      </main>
    </div>
  );
}

export default CatalogPage;
