const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

async function loadNav() {
  const res = await fetch('/api/auth/me').catch(() => null);
  const el = document.getElementById('nav-actions');

  if (res && res.ok) {
    const data = await res.json();
    el.innerHTML = `
      <span style="color:#fff;font-weight:700">Hi, ${data.user.firstName}</span>
      ${data.user.isAdmin ? '<a class="nav-link" href="/admin.html">Admin</a>' : ''}
      <a class="nav-link" href="/cart.html">Cart</a>
      <a class="nav-link" href="/profile.html">Profile</a>
      <button class="nav-link" onclick="logout()">Sign Out</button>
    `;
    return;
  }

  el.innerHTML = `
    <a class="nav-link" href="/cart.html">Cart</a>
    <a class="nav-link" href="/login.html">Sign In</a>
    <a class="nav-link filled" href="/register.html">Register</a>
  `;
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/catalog.html';
}

async function loadProduct() {
  if (!productId) {
    document.getElementById('product-content').innerHTML = '<p>No product specified.</p>';
    return;
  }

  const res = await fetch(`/api/catalog/${productId}`);
  if (!res.ok) {
    document.getElementById('product-content').innerHTML = '<p>Product not found.</p>';
    return;
  }

  const { product: p } = await res.json();
  const price = '$' + (p.priceCents / 100).toFixed(2);
  const img = p.imageUrl || '';
  document.title = `6ixOutside — ${p.name}`;

  let stockLabel = '';
  if (p.inventoryQuantity === 0) {
    stockLabel = '<span class="inventory-status out-of-stock">Out of Stock</span>';
  } else if (p.inventoryQuantity <= 5) {
    stockLabel = `<span class="inventory-status low-stock">Almost Gone — ${p.inventoryQuantity} left</span>`;
  } else {
    stockLabel = `<span class="inventory-status in-stock">In Stock (${p.inventoryQuantity} available)</span>`;
  }

  const disabled = p.inventoryQuantity === 0 ? 'disabled' : '';

  document.getElementById('product-content').innerHTML = `
    <div class="product-layout">
      <div class="product-image-wrap">
        <img src="${img}" alt="${p.name}" />
      </div>
      <div class="product-info">
        <p class="product-brand">${p.brand}</p>
        <h1 class="product-name">${p.name}</h1>
        <p class="product-price">${price}</p>
        <div class="product-meta">
          <div class="meta-item">
            <p class="meta-label">Category</p>
            <p class="meta-value">${p.category}</p>
          </div>
          <div class="meta-item">
            <p class="meta-label">Colorway</p>
            <p class="meta-value">${p.colorway}</p>
          </div>
          <div class="meta-item">
            <p class="meta-label">Size Range</p>
            <p class="meta-value">${p.sizeRange}</p>
          </div>
          <div class="meta-item">
            <p class="meta-label">Release Year</p>
            <p class="meta-value">${p.releaseYear}</p>
          </div>
        </div>
        <p class="product-description">${p.description}</p>
        ${stockLabel}
        <div class="add-to-cart-row">
          <input class="qty-input" type="number" id="qty" value="1" min="1" max="${p.inventoryQuantity}" ${disabled} />
          <button class="add-btn" id="add-btn" onclick="addToCart('${p.productId}', ${p.inventoryQuantity})" ${disabled}>
            Add to Cart
          </button>
        </div>
        <p class="msg" id="msg"></p>
      </div>
    </div>
  `;
}

async function addToCart(productId, maxQty) {
  const qty = parseInt(document.getElementById('qty').value, 10);
  const msg = document.getElementById('msg');
  const btn = document.getElementById('add-btn');

  if (qty < 1 || qty > maxQty) {
    msg.className = 'msg error';
    msg.textContent = `Quantity must be between 1 and ${maxQty}.`;
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Adding...';

  try {
    const authRes = await fetch('/api/auth/me').catch(() => null);

    if (authRes && authRes.ok) {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: qty })
      });

      const data = await res.json();

      if (res.ok) {
        msg.className = 'msg success';
        msg.innerHTML = `
          Added to cart!
          <a href="/cart.html" style="margin-left:8px;font-weight:700;text-decoration:underline;">
            View Cart
          </a>
        `;
      } else {
        msg.className = 'msg error';
        msg.textContent = data.message || 'Failed to add to cart.';
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingIndex = guestCart.findIndex((item) => item.productId === productId);

      if (existingIndex !== -1) {
        const newQty = guestCart[existingIndex].quantity + qty;
        guestCart[existingIndex].quantity = Math.min(newQty, maxQty);
      } else {
        guestCart.push({ productId, quantity: qty });
      }

      localStorage.setItem('guestCart', JSON.stringify(guestCart));

      msg.className = 'msg success';
      msg.innerHTML = `
        Added to cart!
        <a href="/cart.html" style="margin-left:8px;font-weight:700;text-decoration:underline;">
          View Cart
        </a>
      `;
    }
  } catch (err) {
    msg.className = 'msg error';
    msg.textContent = 'Failed to add to cart.';
  } finally {
    btn.textContent = 'Add to Cart';
    btn.disabled = false;
  }
}

loadNav();
loadProduct();
