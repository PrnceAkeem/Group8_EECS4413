import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchCatalog, fetchBrands } from '../services/catalogApi';
import { SORT_STRATEGIES } from '../utils/sortStrategies';
import { useAuth } from '../context/AuthContext';

const TOP_TABS = [
  { key: 'new-arrivals', label: 'New Arrivals' },
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
  { key: 'kids', label: 'Kids' }
];

const COLOR_OPTIONS = ['Black', 'White', 'Red', 'Blue'];
const SIZE_OPTIONS = ['7', '8', '9', '10', '11'];
const PRICE_OPTIONS = ['Under $150', '$150 - $200', 'Over $200'];

function parseRange(sizeRange) {
  if (!sizeRange) return null;
  const match = sizeRange.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;
  return {
    min: Number.parseInt(match[1], 10),
    max: Number.parseInt(match[2], 10)
  };
}

function sizeInRange(sizeRange, size) {
  const range = parseRange(sizeRange);
  if (!range) return false;
  const n = Number.parseInt(size, 10);
  return n >= range.min && n <= range.max;
}

function categoryFromTab(product, tabKey) {
  if (tabKey === 'new-arrivals') {
    return (product.releaseYear || 0) >= 2024;
  }

  if (tabKey === 'men') {
    return ['Basketball', 'Running'].includes(product.category);
  }

  if (tabKey === 'women') {
    return product.category === 'Lifestyle';
  }

  if (tabKey === 'kids') {
    return ['Skate', 'Trail Running'].includes(product.category);
  }

  return true;
}

function displayAudience(product) {
  if ((product.releaseYear || 0) >= 2024) return 'New Arrivals';
  if (['Basketball', 'Running'].includes(product.category)) return 'Men';
  if (product.category === 'Lifestyle') return 'Women';
  if (['Skate', 'Trail Running'].includes(product.category)) return 'Kids';
  return product.category;
}

function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || '';
  const audience = searchParams.get('audience') || '';

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchCatalog({
      sort: sort || undefined,
      q: q || undefined
    })
      .then(setProducts)
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setLoading(false));
  }, [sort, q]);

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

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  function toggleItem(current, setCurrent, value) {
    if (current.includes(value)) {
      setCurrent(current.filter((item) => item !== value));
      return;
    }
    setCurrent([...current, value]);
  }

  function clearAll() {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedPrices([]);
    setSelectedBrands([]);
    setSearchParams({});
  }

  const brandOptions = useMemo(() => {
    if (brands.length > 0) return brands;
    return [...new Set(products.map((p) => p.brand))].sort();
  }, [brands, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!categoryFromTab(product, audience)) {
        return false;
      }

      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      if (
        selectedColors.length > 0 &&
        !selectedColors.some((color) =>
          (product.colorway || '').toLowerCase().includes(color.toLowerCase())
        )
      ) {
        return false;
      }

      if (
        selectedSizes.length > 0 &&
        !selectedSizes.some((size) => sizeInRange(product.sizeRange, size))
      ) {
        return false;
      }

      if (selectedPrices.length > 0) {
        const inAnyRange = selectedPrices.some((priceLabel) => {
          if (priceLabel === 'Under $150') return product.priceCents < 15000;
          if (priceLabel === '$150 - $200') {
            return product.priceCents >= 15000 && product.priceCents <= 20000;
          }
          if (priceLabel === 'Over $200') return product.priceCents > 20000;
          return false;
        });

        if (!inAnyRange) return false;
      }

      return true;
    });
  }, [products, audience, selectedBrands, selectedColors, selectedSizes, selectedPrices]);

  const hasFilters =
    q ||
    sort ||
    audience ||
    selectedColors.length ||
    selectedSizes.length ||
    selectedPrices.length ||
    selectedBrands.length;

  const subsetFiltersActive =
    q ||
    audience ||
    selectedColors.length ||
    selectedSizes.length ||
    selectedPrices.length ||
    selectedBrands.length;

  return (
    <div className="store-page">
      <header className="store-header">
        <div className="store-logo">6ixOutside</div>

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

      <section className="top-banner">
        <div className="top-banner-content">
          <p className="banner-label">Streetwear Footwear</p>
          <p className="banner-copy">
            Shop trending sneakers, everyday essentials, and the newest drops in one place.
          </p>
        </div>
      </section>

      <nav className="category-tabs">
        {TOP_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab ${audience === tab.key ? 'active' : ''}`}
            onClick={() => setParam('audience', audience === tab.key ? '' : tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="store-content">
        <section className="products-section">
          <div className="products-topbar">
            <h2>
              Featured Products{' '}
              {!loading &&
                (subsetFiltersActive
                  ? `(${filteredProducts.length} of ${products.length})`
                  : `(${products.length})`)}
            </h2>

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
          {error && <p className="state-message state-error">{error}</p>}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="state-message">No products found.</p>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.productId} className="product-card">
                  <div className="product-image-wrap">
                    <img src={product.imageUrl} alt={product.name} />
                  </div>

                  <div className="product-details">
                    <p className="product-brand">{product.brand}</p>
                    <h3>{product.name}</h3>
                    <p className="product-category">{displayAudience(product)}</p>
                    <p className="product-price">${(product.priceCents / 100).toFixed(2)}</p>
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

          <details className="filter-dropdown" open>
            <summary>Colors</summary>
            <div className="filter-options">
              {COLOR_OPTIONS.map((color) => (
                <label key={color}>
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(color)}
                    onChange={() => toggleItem(selectedColors, setSelectedColors, color)}
                  />
                  <span>{color}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="filter-dropdown">
            <summary>Size</summary>
            <div className="filter-options">
              {SIZE_OPTIONS.map((size) => (
                <label key={size}>
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggleItem(selectedSizes, setSelectedSizes, size)}
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="filter-dropdown">
            <summary>Price</summary>
            <div className="filter-options">
              {PRICE_OPTIONS.map((priceOption) => (
                <label key={priceOption}>
                  <input
                    type="checkbox"
                    checked={selectedPrices.includes(priceOption)}
                    onChange={() => toggleItem(selectedPrices, setSelectedPrices, priceOption)}
                  />
                  <span>{priceOption}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="filter-dropdown">
            <summary>Brand</summary>
            <div className="filter-options">
              {brandOptions.map((brandOption) => (
                <label key={brandOption}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brandOption)}
                    onChange={() => toggleItem(selectedBrands, setSelectedBrands, brandOption)}
                  />
                  <span>{brandOption}</span>
                </label>
              ))}
            </div>
          </details>

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
