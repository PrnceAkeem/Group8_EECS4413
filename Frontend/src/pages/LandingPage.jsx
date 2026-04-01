import { Link, useNavigate } from 'react-router-dom';

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
      'https://images.unsplash.com/photo-1600181516264-3ea807ff44b9?auto=format&fit=crop&w=900&q=80',
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

const filterGroups = [
  {
    title: 'Colors',
    options: ['Black', 'White', 'Red', 'Blue'],
  },
  {
    title: 'Size',
    options: ['7', '8', '9', '10', '11'],
  },
  {
    title: 'Price',
    options: ['Under $150', '$150 - $200', 'Over $200'],
  },
  {
    title: 'Brand',
    options: ['Nike', 'Adidas', 'Puma', 'New Balance'],
  },
];

const AUDIENCE_MAP = {
  'New Arrivals': 'new-arrivals',
  Men: 'men',
  Women: 'women',
  Kids: 'kids'
};

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="store-page">
      <header className="store-header">
        <div className="store-logo">6ixOutside</div>

        <div className="store-search">
          <input type="text" placeholder="Search shoes, brands, categories..." />
        </div>

        <div className="store-actions">
          <Link to="/login" className="header-link">
            Sign In
          </Link>
          <Link to="/register" className="header-link filled">
            Sign Up
          </Link>
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
        <Link to="/catalog?audience=new-arrivals" className="tab active">
          New Arrivals
        </Link>
        <Link to="/catalog?audience=men" className="tab">
          Men
        </Link>
        <Link to="/catalog?audience=women" className="tab">
          Women
        </Link>
        <Link to="/catalog?audience=kids" className="tab">
          Kids
        </Link>
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
                  <button
                    className="product-btn"
                    type="button"
                    onClick={() =>
                      navigate(`/catalog?audience=${AUDIENCE_MAP[product.category] || 'new-arrivals'}`)
                    }
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="filters-panel">
          <h3>Filters</h3>

          {filterGroups.map((group, index) => (
            <details
              key={group.title}
              className="filter-dropdown"
              open={index === 0}>
              <summary>{group.title}</summary>

              <div className="filter-options">
                {group.options.map((option) => (
                  <label key={option}>
                    <input type="checkbox" />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </details>
          ))}
        </aside>
      </main>
    </div>
  );
}

export default LandingPage;
