let isLoggedIn = false;

async function loadNav() {
  const res = await fetch('/api/auth/me').catch(() => null);
  const el = document.getElementById('nav-actions');

  if (res && res.ok) {
    isLoggedIn = true;
    const data = await res.json();
    el.innerHTML = `
      <span style="color:#fff;font-weight:700">Hi, ${data.user.firstName}</span>
      <a class="nav-link" href="/cart.html">Cart</a>
      <a class="nav-link" href="/profile.html">Profile</a>
      <button class="nav-link" onclick="logout()">Sign Out</button>
    `;
    return;
  }

  isLoggedIn = false;
  const count = JSON.parse(localStorage.getItem('guestCart') || '[]').reduce((s, i) => s + i.quantity, 0);
  el.innerHTML = `
    <a class="cart-icon-link" href="/cart.html">🛒${count > 0 ? `<span class="cart-badge">${count}</span>` : ''}</a>
    <a class="nav-link" href="/catalog.html">Shop</a>
    <a class="nav-link" href="/login.html">Sign In</a>
    <a class="nav-link filled" href="/register.html">Register</a>
  `;
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/catalog.html';
}

async function loadCart() {
  const authRes = await fetch('/api/auth/me').catch(() => null);

  if (authRes && authRes.ok) {
    isLoggedIn = true;
    const res = await fetch('/api/cart');
    const data = await res.json();
    render(data.items, data.subtotalCents);
    return;
  }

  isLoggedIn = false;

  const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');

  if (guestCart.length === 0) {
    render([], 0);
    return;
  }

  try {
    const res = await fetch('/api/catalog');
    const data = await res.json();
    const products = data.products || [];

    const items = guestCart
      .map((cartItem) => {
        const product = products.find((p) => p.productId === cartItem.productId);
        if (!product) return null;

        return {
          product_id: product.productId,
          name: product.name,
          quantity: cartItem.quantity,
          price_cents: product.priceCents,
          inventory_quantity: product.inventoryQuantity,
          image_url: product.imageUrl || ''
        };
      })
      .filter(Boolean);

    const subtotalCents = items.reduce((sum, item) => {
      return sum + item.price_cents * item.quantity;
    }, 0);

    render(items, subtotalCents);
  } catch (err) {
    document.getElementById('cart-content').innerHTML = `
      <div class="cart-empty">
        <p style="font-size:1.2rem;font-weight:700;margin-bottom:8px">Failed to load cart.</p>
        <p><a href="/catalog.html">Continue shopping</a></p>
      </div>
    `;
  }
}

function render(items, subtotalCents) {
  const container = document.getElementById('cart-content');

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p style="font-size:1.2rem;font-weight:700;margin-bottom:8px">Your cart is empty.</p>
        <p><a href="/catalog.html">Continue shopping</a></p>
      </div>
    `;
    return;
  }

  const shipping = 1200;
  const tax = Math.round(subtotalCents * 0.13);
  const total = subtotalCents + shipping + tax;

  const rows = items
    .map((item) => {
      const unitPrice = '$' + (item.price_cents / 100).toFixed(2);
      const lineTotal = '$' + ((item.price_cents * item.quantity) / 100).toFixed(2);
      const img = item.image_url || `/assets/${item.product_id}.jpg`;

      return `
        <div class="cart-row" id="row-${item.product_id}">
          <img src="${img}" alt="${item.name}" />
          <div class="cart-item-info">
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-price">${unitPrice} each</p>
            <div class="qty-row">
              <button class="qty-btn" onclick="changeQty('${item.product_id}', ${item.quantity - 1}, ${item.inventory_quantity})">−</button>
              <span class="qty-num">${item.quantity}</span>
              <button class="qty-btn" onclick="changeQty('${item.product_id}', ${item.quantity + 1}, ${item.inventory_quantity})">+</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <span class="cart-item-subtotal">${lineTotal}</span>
            <button class="remove-btn" onclick="removeItem('${item.product_id}')">Remove</button>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">${rows}</div>
      <div class="order-summary">
        <h3>Order Summary</h3>
        <div class="summary-line"><span>Subtotal</span><span>$${(subtotalCents / 100).toFixed(2)}</span></div>
        <div class="summary-line"><span>Shipping</span><span>$${(shipping / 100).toFixed(2)}</span></div>
        <div class="summary-line"><span>Tax (13%)</span><span>$${(tax / 100).toFixed(2)}</span></div>
        <div class="summary-total"><span>Total</span><span>$${(total / 100).toFixed(2)}</span></div>
        <button class="checkout-btn" onclick="goToCheckout()">Proceed to Checkout</button>
        <a class="continue-link" href="/catalog.html">← Continue Shopping</a>
      </div>
    </div>
  `;
}

async function changeQty(productId, newQty, maxQty) {
  if (newQty < 1) {
    removeItem(productId);
    return;
  }

  if (newQty > maxQty) return;

  if (isLoggedIn) {
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty })
    });

    const data = await res.json();
    if (res.ok) render(data.items, data.subtotalCents);
    return;
  }

  const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
  const idx = guestCart.findIndex((item) => item.productId === productId);

  if (idx !== -1) {
    guestCart[idx].quantity = newQty;
    localStorage.setItem('guestCart', JSON.stringify(guestCart));
  }

  loadCart();
}

async function removeItem(productId) {
  if (isLoggedIn) {
    const res = await fetch(`/api/cart/${productId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) render(data.items, data.subtotalCents);
    return;
  }

  let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
  guestCart = guestCart.filter((item) => item.productId !== productId);
  localStorage.setItem('guestCart', JSON.stringify(guestCart));
  loadCart();
}

function goToCheckout() {
  if (isLoggedIn) {
    window.location.href = '/checkout.html';
  } else {
    window.location.href = '/login.html?next=/checkout.html';
  }
}

loadNav();
loadCart();
