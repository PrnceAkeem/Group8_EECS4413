let existingAddressId = null;
let existingPaymentMethodId = null;

function showTab(tab) {
  ['info','address','payment','orders'].forEach(t => {
    document.getElementById(`tab-${t}`).style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('#profile-tabs .nav-link').forEach((btn, i) => {
    btn.classList.toggle('active', ['info','address','payment','orders'][i] === tab);
  });
  if (tab === 'orders') loadOrders();
}

async function loadNav() {
  const res = await fetch('/api/auth/me').catch(() => null);
  const el = document.getElementById('nav-actions');
  if (res && res.ok) {
    const data = await res.json();
    el.innerHTML = `
      <span style="color:#fff;font-weight:700">Hi, ${data.user.firstName}</span>
      <a class="nav-link" href="/cart.html">Cart</a>
      <button class="nav-link" onclick="logout()">Sign Out</button>
    `;
  } else {
    window.location.href = '/login.html?next=/profile.html';
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/catalog.html';
}

async function loadProfile() {
  const authRes = await fetch('/api/auth/me');
  if (!authRes.ok) { window.location.href = '/login.html?next=/profile.html'; return; }

  const res = await fetch('/api/profile');
  const data = await res.json();

  document.getElementById('firstName').value = data.customer.firstName || '';
  document.getElementById('lastName').value  = data.customer.lastName  || '';
  document.getElementById('dob').value       = data.customer.dob ? data.customer.dob.split('T')[0] : '';
  document.getElementById('phone').value     = data.customer.phone || '';
  document.getElementById('email').value     = data.customer.email || '';

  const addr = (data.addresses || []).find(a => a.isDefaultShipping) || data.addresses?.[0];
  if (addr) {
    existingAddressId = addr.addressId;
    document.getElementById('recipientName').value = addr.recipientName || '';
    document.getElementById('addrLabel').value     = addr.label || 'home';
    document.getElementById('streetLine1').value   = addr.streetLine1 || '';
    document.getElementById('city').value          = addr.city || '';
    document.getElementById('province').value      = addr.province || 'ON';
    document.getElementById('postalCode').value    = addr.postalCode || '';
    document.getElementById('isDefaultShipping').checked = addr.isDefaultShipping;
    document.getElementById('isDefaultBilling').checked  = addr.isDefaultBilling;
  }

  const pay = (data.paymentMethods || []).find(p => p.isDefault) || data.paymentMethods?.[0];
  if (pay) {
    existingPaymentMethodId = pay.paymentMethodId;
    document.getElementById('cardholderName').value = pay.cardholderName || '';
    document.getElementById('cardBrand').value      = pay.cardBrand || '';
    document.getElementById('cardLast4').value      = pay.cardLast4 || '';
    document.getElementById('expiryMonth').value    = pay.expiryMonth || '';
    document.getElementById('expiryYear').value     = pay.expiryYear || '';
    document.getElementById('payDefault').checked   = pay.isDefault;
  }
}

async function saveInfo() {
  const msg = document.getElementById('info-msg');
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: document.getElementById('firstName').value.trim(),
      lastName:  document.getElementById('lastName').value.trim(),
      dob:       document.getElementById('dob').value,
      phone:     document.getElementById('phone').value.trim() || null
    })
  });
  const data = await res.json();
  msg.className = res.ok ? 'mt-2 fw-bold text-success' : 'mt-2 fw-bold text-danger';
  msg.textContent = res.ok ? 'Saved!' : (data.message || 'Failed to save.');
}

async function saveAddress() {
  const msg = document.getElementById('addr-msg');
  const body = {
    label:             document.getElementById('addrLabel').value.trim(),
    recipientName:     document.getElementById('recipientName').value.trim(),
    streetLine1:       document.getElementById('streetLine1').value.trim(),
    city:              document.getElementById('city').value.trim(),
    province:          document.getElementById('province').value.trim(),
    postalCode:        document.getElementById('postalCode').value.trim(),
    country:           'Canada',
    isDefaultShipping: document.getElementById('isDefaultShipping').checked,
    isDefaultBilling:  document.getElementById('isDefaultBilling').checked
  };
  if (existingAddressId) body.addressId = existingAddressId;

  const res = await fetch('/api/profile/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  msg.className = res.ok ? 'mt-2 fw-bold text-success' : 'mt-2 fw-bold text-danger';
  msg.textContent = res.ok ? 'Address saved!' : (data.message || 'Failed to save.');
  if (res.ok && data.address) existingAddressId = data.address.addressId;
}

async function savePayment() {
  const msg = document.getElementById('pay-msg');
  const body = {
    cardholderName: document.getElementById('cardholderName').value.trim(),
    cardBrand:      document.getElementById('cardBrand').value.trim(),
    cardLast4:      document.getElementById('cardLast4').value.trim(),
    expiryMonth:    parseInt(document.getElementById('expiryMonth').value, 10),
    expiryYear:     parseInt(document.getElementById('expiryYear').value, 10),
    isDefault:      document.getElementById('payDefault').checked
  };
  if (existingPaymentMethodId) body.paymentMethodId = existingPaymentMethodId;

  const res = await fetch('/api/profile/payment-methods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  msg.className = res.ok ? 'mt-2 fw-bold text-success' : 'mt-2 fw-bold text-danger';
  msg.textContent = res.ok ? 'Payment method saved!' : (data.message || 'Failed to save.');
  if (res.ok && data.paymentMethod) existingPaymentMethodId = data.paymentMethod.paymentMethodId;
}

async function loadOrders() {
  const res = await fetch('/api/orders');
  const data = await res.json();
  const el = document.getElementById('orders-list');
  if (!data.orders || data.orders.length === 0) {
    el.innerHTML = '<p class="text-muted">No orders yet.</p>';
    return;
  }
  el.innerHTML = data.orders.map(o => `
    <div class="card mb-3">
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <strong>Order #${o.orderId}</strong>
          <span class="ms-3 text-muted">${new Date(o.placedAt).toLocaleDateString()}</span>
          <span class="ms-3 badge bg-secondary">${o.orderStatus}</span>
        </div>
        <div class="fw-bold">$${(o.totalCents / 100).toFixed(2)}</div>
      </div>
    </div>
  `).join('');
}

loadNav();
loadProfile();
