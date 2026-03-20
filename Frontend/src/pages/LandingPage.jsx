import { Link } from 'react-router-dom';

const products = [
  {
    id: 1,
    name: 'Nike Air Max Pulse',
    brand: 'Nike',
    price: '$189.99',
    category: 'New Arrivals',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Adidas Forum Low',
    brand: 'Adidas',
    price: '$149.99',
    category: 'Men',
    image:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'New Balance 550',
    brand: 'New Balance',
    price: '$169.99',
    category: 'Women',
    image:
      'https://images.unsplash.com/photo-1608256246200-53e8b47b2f80?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'Puma RS-X',
    brand: 'Puma',
    price: '$139.99',
    category: 'Kids',
    image:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    name: 'Nike Dunk Low',
    brand: 'Nike',
    price: '$159.99',
    category: 'Men',
    image:
      'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    name: 'Adidas Ultraboost',
    brand: 'Adidas',
    price: '$199.99',
    category: 'New Arrivals',
    image:
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 7,
    name: 'Jordan Series',
    brand: 'Jordan',
    price: '$179.99',
    category: 'Women',
    image:
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    name: 'Reebok Classic',
    brand: 'Reebok',
    price: '$129.99',
    category: 'Kids',
    image:
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80',
  },
];

function LandingPage() {
  return (
    <div className="store-page">
      <header className="store-header">
        <div className="store-logo">6ixOutside</div>

        <div className="store-search">
          <input type="text" placeholder="Search shoes, brands, categories..." />
        </div>

        <div className="store-actions">
          <button className="icon-btn" type="button">
            🛒
          </button>
          <Link to="/login" className="header-link">
            Sign In
          </Link>
          <Link to="/register" className="header-link filled">
            Sign Up
          </Link>
        </div>
      </header>

      <section className="top-banner">
        <div>
          <p className="banner-label">Streetwear Footwear</p>
          <h1>6ixOutside Store</h1>
          <p>
            Shop trending sneakers, everyday essentials, and the newest drops in
            one place.
          </p>
        </div>
      </section>

      <nav className="category-tabs">
        <button className="tab active" type="button">
          New Arrivals
        </button>
        <button className="tab" type="button">
          Men
        </button>
        <button className="tab" type="button">
          Women
        </button>
        <button className="tab" type="button">
          Kids
        </button>
      </nav>

      <main className="store-content">
        <section className="products-section">
          <div className="products-topbar">
            <h2>Featured Products</h2>

            <select className="sort-select" defaultValue="Sort By">
              <option>Sort By</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
              <option>Brand</option>
            </select>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-wrap">
                  <img src={product.image} alt={product.name} />
                </div>

                <div className="product-details">
                  <p className="product-brand">{product.brand}</p>
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">{product.price}</p>
                  <button className="product-btn" type="button">
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="filters-panel">
          <h3>Filters</h3>

          <div className="filter-group">
            <h4>Category</h4>
            <label>
              <input type="checkbox" /> New Arrivals
            </label>
            <label>
              <input type="checkbox" /> Men
            </label>
            <label>
              <input type="checkbox" /> Women
            </label>
            <label>
              <input type="checkbox" /> Kids
            </label>
          </div>

          <div className="filter-group">
            <h4>Colors</h4>
            <label>
              <input type="checkbox" /> Black
            </label>
            <label>
              <input type="checkbox" /> White
            </label>
            <label>
              <input type="checkbox" /> Red
            </label>
            <label>
              <input type="checkbox" /> Blue
            </label>
          </div>

          <div className="filter-group">
            <h4>Size</h4>
            <label>
              <input type="checkbox" /> 7
            </label>
            <label>
              <input type="checkbox" /> 8
            </label>
            <label>
              <input type="checkbox" /> 9
            </label>
            <label>
              <input type="checkbox" /> 10
            </label>
            <label>
              <input type="checkbox" /> 11
            </label>
          </div>

          <div className="filter-group">
            <h4>Price</h4>
            <label>
              <input type="checkbox" /> Under $150
            </label>
            <label>
              <input type="checkbox" /> $150 - $200
            </label>
            <label>
              <input type="checkbox" /> Over $200
            </label>
          </div>

          <div className="filter-group">
            <h4>Brand</h4>
            <label>
              <input type="checkbox" /> Nike
            </label>
            <label>
              <input type="checkbox" /> Adidas
            </label>
            <label>
              <input type="checkbox" /> Puma
            </label>
            <label>
              <input type="checkbox" /> New Balance
            </label>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default LandingPage;