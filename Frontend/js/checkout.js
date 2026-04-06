let profile = null;
let cartItems = [];
let subtotalCents = 0;

async function loadNav() {
  const res = await fetch('/api/auth/me').catch(() => null);
  const el = document.getElementById('nav-actions');
  if (res && res.ok) {
    const data = await res.json();
    el.innerHTML = `
      <span style="color:#fff;font-weight:700">Hi, ${data.user.firstName}</span>
      <a class="nav-link" href="/cart.html">Cart</a>
      <a class="nav-link" href="/profile.html">Profile</a>
      <button class="nav-link" onclick="logout()">Sign Out</button>
    `;
  } else {
    window.location.href = '/login.html?next=/checkout.html';
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/catalog.html';
}

async function loadData() {
  const authRes = await fetch('/api/auth/me');
  if (!authRes.ok) { window.location.href = '/login.html?next=/checkout.html'; return; }

  const [profileRes, cartRes] = await Promise.all([
    fetch('/api/profile'),
    fetch('/api/cart')
  ]);

  profile = await profileRes.json();
  const cartData = await cartRes.json();
  cartItems = cartData.items;
  subtotalCents = cartData.subtotalCents;

  renderAddress();
  renderPayment();
  renderSummary();
}

function renderAddress() {
  const el = document.getElementById('address-section');
  const addresses = profile.addresses || [];
  if (addresses.length === 0) {
    el.innerHTML = `<p class="text-muted small">No saved addresses. <a href="/profile.html">Add one in your profile.</a></p>`;
    return;
  }
  el.innerHTML = addresses.map(a => `
    <div class="form-check mb-2">
      <input class="form-check-input" type="radio" name="address" value="${a.addressId}" id="addr-${a.addressId}" ${a.isDefaultShipping ? 'checked' : ''}>
      <label class="form-check-label" for="addr-${a.addressId}">
        <strong>${a.recipientName}</strong> — ${a.streetLine1}, ${a.city}, ${a.province} ${a.postalCode}
      </label>
    </div>
  `).join('');
}

function renderPayment() {
  const el = document.getElementById('payment-section');
  const methods = profile.paymentMethods || [];
  if (methods.length === 0) {
    el.innerHTML = `<p class="text-muted small">No saved payment methods. <a href="/profile.html">Add one in your profile.</a></p>`;
    return;
  }
  el.innerHTML = methods.map(m => `
    <div class="form-check mb-2">
      <input class="form-check-input" type="radio" name="payment" value="${m.paymentMethodId}" id="pay-${m.paymentMethodId}" ${m.isDefault ? 'checked' : ''}>
      <label class="form-check-label" for="pay-${m.paymentMethodId}">
        ${m.cardBrand} ending in ${m.cardLast4} — expires ${m.expiryMonth}/${m.expiryYear}
      </label>
    </div>
  `).join('');
}

function renderSummary() {
  const shipping = 1200;
  const tax = Math.round(subtotalCents * 0.13);
  const total = subtotalCents + shipping + tax;
  document.getElementById('summary-section').innerHTML = `
    <div class="d-flex justify-content-between mb-1"><span>Subtotal</span><span>$${(subtotalCents/100).toFixed(2)}</span></div>
    <div class="d-flex justify-content-between mb-1"><span>Shipping</span><span>$${(shipping/100).toFixed(2)}</span></div>
    <div class="d-flex justify-content-between mb-2"><span>Tax (13%)</span><span>$${(tax/100).toFixed(2)}</span></div>
    <div class="d-flex justify-content-between fw-bold border-top pt-2"><span>Total</span><span>$${(total/100).toFixed(2)}</span></div>
  `;
}

async function placeOrder() {
  const msg = document.getElementById('msg');
  const btn = document.getElementById('place-btn');

  const addrEl = document.querySelector('input[name="address"]:checked');
  const payEl  = document.querySelector('input[name="payment"]:checked');

  if (!addrEl || !payEl) {
    msg.className = 'mt-2 fw-bold text-danger';
    msg.textContent = 'Please select a shipping address and payment method.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Processing...';
  msg.textContent = '';

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shippingAddressId: addrEl.value,
      paymentMethodId: payEl.value
    })
  });

  const data = await res.json();

  if (res.ok) {
    window.location.href = `/orders.html?confirmed=${data.order.orderId}`;
  } else {
    msg.className = 'mt-2 fw-bold text-danger';
    msg.textContent = data.message || 'Credit Card Authorization Failed.';
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
}

loadNav();
loadData();
