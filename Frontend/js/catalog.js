let selectedBrands = [];
let isLoggedIn = false;

async function loadNav() {
  const res = await fetch('/api/auth/me').catch(() => null);
  const el = document.getElementById('nav-actions');
  if (res && res.ok) {
    const data = await res.json();
    isLoggedIn = true;
    el.innerHTML = `
      <span style="color:#fff;font-weight:700">Hi, ${data.user.firstName}</span>
      ${data.user.isAdmin ? '<a class="nav-link" href="/admin.html">Admin</a>' : ''}
      <a class="nav-link" href="/cart.html">Cart</a>
      <a class="nav-link" href="/profile.html">Profile</a>
      <button class="nav-link" onclick="logout()">Sign Out</button>
    `;
  } else {
    isLoggedIn = false;
    el.innerHTML = `
      <a class="nav-link" href="/cart.html">Cart</a>
      <a class="nav-link" href="/login.html">Sign In</a>
      <a class="nav-link filled" href="/register.html">Register</a>
    `;
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.reload();
}

async function loadFilters() {
  const res = await fetch('/api/catalog/brands');
  const { brands } = await res.json();
  document.getElementById('brand-filters').innerHTML = brands.map(b => `
    <label>
      <input type="checkbox" value="${b}" onchange="toggleBrand('${b}')"> ${b}
    </label>
  `).join('');
}

function toggleBrand(value) {
  selectedBrands = selectedBrands.includes(value)
    ? selectedBrands.filter(b => b !== value)
    : [...selectedBrands, value];
  loadProducts();
}

async function loadProducts() {
  const sort = document.getElementById('sort-select').value;
  const q = document.getElementById('search-input').value.trim();

  const params = new URLSearchParams();
  if (sort) params.set('sort', sort);
  if (q) params.set('q', q);
  if (selectedBrands.length === 1) params.set('brand', selectedBrands[0]);

  const res = await fetch(`/api/catalog?${params}`);
  const { products } = await res.json();

  let filtered = products;
  if (selectedBrands.length > 1) {
    filtered = filtered.filter(p => selectedBrands.includes(p.brand));
  }

  const heading = document.getElementById('results-heading');
  heading.textContent = filtered.length === products.length
    ? 'All Shoes'
    : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;

  const grid = document.getElementById('products-grid');
  if (filtered.length === 0) {
    grid.innerHTML = '<p class="no-results">No shoes found. Try adjusting your filters.</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const price = '$' + (p.priceCents / 100).toFixed(2);
    const img = p.imageUrl || '';
    const outOfStock = p.inventoryQuantity === 0;
    return `
      <div class="product-card" onclick="location.href='/product.html?id=${p.productId}'">
        <img src="${img}" alt="${p.name}" />
        <div class="card-body">
          <p class="card-brand">${p.brand}</p>
          <p class="card-name">${p.name}</p>
          <p class="card-category">${p.category}</p>
          <p class="card-price">${price}</p>
          <div class="card-actions">
            <button class="card-btn secondary" onclick="event.stopPropagation();location.href='/product.html?id=${p.productId}'">Details</button>
            <button class="card-btn" id="atc-${p.productId}" ${outOfStock ? 'disabled' : ''} onclick="event.stopPropagation();addToCart('${p.productId}', this)">${outOfStock ? 'Sold Out' : 'Add to Cart'}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function addToCart(productId, btn) {
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = '...';

  if (!isLoggedIn) {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    const idx = guestCart.findIndex(i => i.productId === productId);
    if (idx !== -1) {
      guestCart[idx].quantity += 1;
    } else {
      guestCart.push({ productId, quantity: 1 });
    }
    localStorage.setItem('guestCart', JSON.stringify(guestCart));
    btn.textContent = 'Added!';
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1500);
    return;
  }

  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity: 1 })
  });
  if (res.ok) {
    btn.textContent = 'Added!';
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1500);
  } else {
    btn.textContent = original;
    btn.disabled = false;
  }
}

document.getElementById('sort-select').addEventListener('change', loadProducts);

let searchTimer;
document.getElementById('search-input').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadProducts, 300);
});

document.getElementById('clear-btn').addEventListener('click', () => {
  selectedBrands = [];
  document.querySelectorAll('#brand-filters input[type="checkbox"]').forEach(cb => cb.checked = false);
  loadProducts();
});

loadNav();
loadFilters();
loadProducts();
