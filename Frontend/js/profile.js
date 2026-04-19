let existingAddressId = null;
let existingPaymentMethodId = null;
let allAddresses = [];
let allPayments = [];

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
      ${data.user.isAdmin ? '<a class="nav-link" href="/admin.html">Admin</a>' : ''}
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

  allAddresses = data.addresses || [];
  allPayments  = data.paymentMethods || [];

  renderAddressList();
  renderPaymentList();

  // Pre-fill form with default address if one exists
  const defaultAddr = allAddresses.find(a => a.isDefaultShipping) || allAddresses[0];
  if (defaultAddr) fillAddressForm(defaultAddr);

  // Pre-fill form with default payment if one exists
  const defaultPay = allPayments.find(p => p.isDefault) || allPayments[0];
  if (defaultPay) fillPaymentForm(defaultPay);
}

// ─── Address ────────────────────────────────────────────────────────────────

function renderAddressList() {
  const el = document.getElementById('addresses-list');
  if (allAddresses.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = allAddresses.map(a => `
    <div class="card mb-2">
      <div class="card-body d-flex justify-content-between align-items-center py-2">
        <div>
          <span class="fw-bold text-capitalize">${a.label}</span>
          <span class="text-muted ms-2 small">${a.recipientName} — ${a.streetLine1}, ${a.city}, ${a.province} ${a.postalCode}</span>
          ${a.isDefaultShipping ? '<span class="badge bg-dark ms-2">Default Shipping</span>' : ''}
          ${a.isDefaultBilling  ? '<span class="badge bg-secondary ms-1">Default Billing</span>'  : ''}
        </div>
        <button class="btn btn-sm btn-outline-dark" onclick="editAddress(${a.addressId})">Edit</button>
      </div>
    </div>
  `).join('');
}

function editAddress(addressId) {
  const addr = allAddresses.find(a => a.addressId === addressId);
  if (!addr) return;
  fillAddressForm(addr);
  document.getElementById('addr-msg').textContent = '';
  document.getElementById('addr-form-title').textContent = `Editing: ${addr.label}`;
  document.getElementById('tab-address').scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function fillAddressForm(addr) {
  existingAddressId = addr.addressId;
  document.getElementById('recipientName').value       = addr.recipientName || '';
  document.getElementById('addrLabel').value           = addr.label || 'home';
  document.getElementById('streetLine1').value         = addr.streetLine1 || '';
  document.getElementById('city').value                = addr.city || '';
  document.getElementById('province').value            = addr.province || 'ON';
  document.getElementById('postalCode').value          = addr.postalCode || '';
  document.getElementById('isDefaultShipping').checked = addr.isDefaultShipping;
  document.getElementById('isDefaultBilling').checked  = addr.isDefaultBilling;
  document.getElementById('addr-form-title').textContent = `Editing: ${addr.label}`;
}

function newAddress() {
  existingAddressId = null;
  document.getElementById('recipientName').value       = '';
  document.getElementById('addrLabel').value           = 'home';
  document.getElementById('streetLine1').value         = '';
  document.getElementById('city').value                = '';
  document.getElementById('province').value            = 'ON';
  document.getElementById('postalCode').value          = '';
  document.getElementById('isDefaultShipping').checked = false;
  document.getElementById('isDefaultBilling').checked  = false;
  document.getElementById('addr-msg').textContent      = '';
  document.getElementById('addr-form-title').textContent = 'Add New Address';
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

  if (res.ok) {
    // Refresh the list from the server
    const profileRes = await fetch('/api/profile');
    const profileData = await profileRes.json();
    allAddresses = profileData.addresses || [];
    renderAddressList();
    if (data.address) {
      existingAddressId = data.address.addressId;
      document.getElementById('addr-form-title').textContent = `Editing: ${data.address.label}`;
    }
  }
}

// ─── Payment ─────────────────────────────────────────────────────────────────

function renderPaymentList() {
  const el = document.getElementById('payments-list');
  if (allPayments.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = allPayments.map(p => `
    <div class="card mb-2">
      <div class="card-body d-flex justify-content-between align-items-center py-2">
        <div>
          <span class="fw-bold">${p.cardBrand}</span>
          <span class="text-muted ms-2 small">ending in ${p.cardLast4} — expires ${p.expiryMonth}/${p.expiryYear}</span>
          <span class="text-muted ms-2 small">${p.cardholderName}</span>
          ${p.isDefault ? '<span class="badge bg-dark ms-2">Default</span>' : ''}
        </div>
        <button class="btn btn-sm btn-outline-dark" onclick="editPayment(${p.paymentMethodId})">Edit</button>
      </div>
    </div>
  `).join('');
}

function editPayment(paymentMethodId) {
  const pay = allPayments.find(p => p.paymentMethodId === paymentMethodId);
  if (!pay) return;
  fillPaymentForm(pay);
  document.getElementById('pay-msg').textContent = '';
  document.getElementById('pay-form-title').textContent = `Editing: ${pay.cardBrand} ****${pay.cardLast4}`;
  document.getElementById('tab-payment').scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function fillPaymentForm(pay) {
  existingPaymentMethodId = pay.paymentMethodId;
  document.getElementById('cardholderName').value = pay.cardholderName || '';
  document.getElementById('cardBrand').value      = pay.cardBrand || '';
  document.getElementById('cardLast4').value      = pay.cardLast4 || '';
  document.getElementById('expiryMonth').value    = pay.expiryMonth || '';
  document.getElementById('expiryYear').value     = pay.expiryYear || '';
  document.getElementById('payDefault').checked   = pay.isDefault;
  document.getElementById('pay-form-title').textContent = `Editing: ${pay.cardBrand} ****${pay.cardLast4}`;
}

function newPayment() {
  existingPaymentMethodId = null;
  document.getElementById('cardholderName').value = '';
  document.getElementById('cardBrand').value      = '';
  document.getElementById('cardLast4').value      = '';
  document.getElementById('expiryMonth').value    = '';
  document.getElementById('expiryYear').value     = '';
  document.getElementById('payDefault').checked   = false;
  document.getElementById('pay-msg').textContent  = '';
  document.getElementById('pay-form-title').textContent = 'Add New Payment Method';
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

  if (res.ok) {
    const profileRes = await fetch('/api/profile');
    const profileData = await profileRes.json();
    allPayments = profileData.paymentMethods || [];
    renderPaymentList();
    if (data.paymentMethod) {
      existingPaymentMethodId = data.paymentMethod.paymentMethodId;
      document.getElementById('pay-form-title').textContent = `Editing: ${data.paymentMethod.cardBrand} ****${data.paymentMethod.cardLast4}`;
    }
  }
}

// ─── Personal Info ────────────────────────────────────────────────────────────

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

// ─── Order History ────────────────────────────────────────────────────────────

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
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-1 fw-bold">Order #${o.orderId}</h6>
            <p class="mb-1 text-muted small">${new Date(o.placedAt).toLocaleDateString('en-CA', { year:'numeric', month:'long', day:'numeric' })}</p>
            <span class="badge bg-secondary">${o.orderStatus}</span>
            <span class="badge ms-1 ${o.paymentStatus === 'approved' ? 'bg-success' : 'bg-danger'}">${o.paymentStatus}</span>
          </div>
          <div class="text-end">
            <p class="mb-1 fw-bold fs-5">$${(o.totalCents / 100).toFixed(2)}</p>
          </div>
        </div>
        <div class="mt-2">
          <button class="btn btn-sm btn-outline-secondary" onclick="toggleOrderItems(${o.orderId}, this)">View Items</button>
          <div id="order-items-${o.orderId}" style="display:none" class="mt-2"></div>
        </div>
      </div>
    </div>
  `).join('');
}

async function toggleOrderItems(orderId, btn) {
  const el = document.getElementById(`order-items-${orderId}`);
  if (el.style.display !== 'none') {
    el.style.display = 'none';
    btn.textContent = 'View Items';
    return;
  }
  if (el.dataset.loaded) {
    el.style.display = '';
    btn.textContent = 'Hide Items';
    return;
  }

  const res = await fetch(`/api/orders/${orderId}`);
  const data = await res.json();
  const items = data.items || [];

  el.innerHTML = `
    <table class="table table-sm mt-1">
      <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
      <tbody>
        ${items.map(i => `
          <tr>
            <td>${i.productName}</td>
            <td>${i.quantity}</td>
            <td>$${(i.unitPriceCents / 100).toFixed(2)}</td>
            <td>$${(i.lineTotalCents / 100).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  el.dataset.loaded = 'true';
  el.style.display = '';
  btn.textContent = 'Hide Items';
}

loadNav();
loadProfile();
