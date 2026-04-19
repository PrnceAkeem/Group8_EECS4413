function showTab(tab) {
  ['orders','inventory','customers'].forEach(t => {
    document.getElementById(`tab-${t}`).style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('#admin-tabs .nav-link').forEach((btn, i) => {
    btn.classList.toggle('active', ['orders','inventory','customers'][i] === tab);
  });
  if (tab === 'orders')    loadOrders();
  if (tab === 'inventory') loadInventory();
  if (tab === 'customers') loadCustomers();
}

async function loadNav() {
  const res = await fetch('/api/auth/me').catch(() => null);
  if (!res || !res.ok) { window.location.href = '/login.html'; return; }
  const data = await res.json();
  if (!data.user.isAdmin) { window.location.href = '/catalog.html'; return; }
  document.getElementById('nav-actions').innerHTML = `
    <span style="color:#fff;font-weight:700">${data.user.firstName} (Admin)</span>
    <button class="nav-link" onclick="logout()">Sign Out</button>
  `;
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

async function loadOrders() {
  const customer = document.getElementById('filter-customer')?.value.trim() || '';
  const from     = document.getElementById('filter-from')?.value || '';
  const to       = document.getElementById('filter-to')?.value || '';
  const status   = document.getElementById('filter-status')?.value || '';

  const params = new URLSearchParams();
  if (customer) params.set('customerId', customer);
  if (from)     params.set('from', from);
  if (to)       params.set('to', to);
  if (status)   params.set('status', status);

  const res  = await fetch(`/api/admin/orders?${params}`);
  const data = await res.json();
  const orders = data.orders || [];

  document.getElementById('orders-table').innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover table-sm">
        <thead><tr>
          <th>Order ID</th><th>Customer</th><th>Date</th>
          <th>Status</th><th>Payment</th><th>Total</th><th></th>
        </tr></thead>
        <tbody>
          ${orders.length === 0 ? '<tr><td colspan="7" class="text-muted text-center">No orders found.</td></tr>' : ''}
          ${orders.map(o => {
            const statusColor = { processing:'bg-warning text-dark', shipped:'bg-primary', delivered:'bg-success', cancelled:'bg-danger' }[o.orderStatus] || 'bg-secondary';
            return `
            <tr>
              <td>#${o.orderId}</td>
              <td>
                <div class="fw-bold">${o.customerName || ''}</div>
                <div class="text-muted small">${o.customerEmail || ''}</div>
              </td>
              <td>${new Date(o.placedAt).toLocaleDateString()}</td>
              <td>
                <select class="form-select form-select-sm" id="status-${o.orderId}" style="width:130px">
                  ${['processing','shipped','delivered','cancelled'].map(s =>
                    `<option value="${s}" ${o.orderStatus===s?'selected':''}>${s}</option>`
                  ).join('')}
                </select>
              </td>
              <td><span class="badge ${o.paymentStatus === 'approved' ? 'bg-success' : 'bg-danger'}">${o.paymentStatus}</span></td>
              <td class="fw-bold">$${(o.totalCents/100).toFixed(2)}</td>
              <td class="d-flex gap-1 flex-wrap">
                <button class="btn btn-sm btn-dark" onclick="saveOrderStatus(${o.orderId})">Update</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="toggleOrderItems(${o.orderId})">Items</button>
                <div id="order-items-${o.orderId}" style="display:none;width:100%" class="mt-2"></div>
              </td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function toggleOrderItems(orderId) {
  const el = document.getElementById(`order-items-${orderId}`);
  if (el.style.display !== 'none') { el.style.display = 'none'; return; }
  if (el.dataset.loaded) { el.style.display = ''; return; }

  const res  = await fetch(`/api/admin/orders/${orderId}/items`);
  const data = await res.json();
  const items = data.items || [];

  el.innerHTML = `
    <table class="table table-sm table-bordered mt-1">
      <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
      <tbody>
        ${items.map(i => `
          <tr>
            <td>${i.productName}</td>
            <td>${i.quantity}</td>
            <td>$${(i.unitPriceCents/100).toFixed(2)}</td>
            <td>$${(i.lineTotalCents/100).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  el.dataset.loaded = 'true';
  el.style.display = '';
}

async function saveOrderStatus(orderId) {
  const status = document.getElementById(`status-${orderId}`).value;
  const res = await fetch(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (res.ok) {
    const btn = document.querySelector(`button[onclick="saveOrderStatus(${orderId})"]`);
    if (btn) { btn.textContent = 'Saved!'; setTimeout(() => { btn.textContent = 'Update'; }, 1500); }
  }
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────

async function loadInventory() {
  const res  = await fetch('/api/admin/products');
  const data = await res.json();
  const products = data.products || [];

  document.getElementById('inventory-table').innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover table-sm">
        <thead><tr><th>ID</th><th>Name</th><th>Brand</th><th>Price</th><th>Qty</th><th>Active</th><th>Update Qty</th></tr></thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td class="text-muted small">${p.productId}</td>
              <td>${p.name}</td>
              <td>${p.brandName || p.brand || ''}</td>
              <td>$${(p.priceCents/100).toFixed(2)}</td>
              <td id="qty-${p.productId}">${p.inventoryQuantity}</td>
              <td>${p.isActive ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'}</td>
              <td>
                <div class="input-group input-group-sm" style="width:130px">
                  <input type="number" class="form-control" id="new-qty-${p.productId}" value="${p.inventoryQuantity}" min="0" />
                  <button class="btn btn-outline-dark" onclick="updateQty('${p.productId}')">Save</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function updateQty(productId) {
  const qty = parseInt(document.getElementById(`new-qty-${productId}`).value, 10);
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inventoryQuantity: qty })
  });
  if (res.ok) {
    document.getElementById(`qty-${productId}`).textContent = qty;
  }
}

async function loadMeta() {
  const res = await fetch('/api/admin/meta');
  if (!res.ok) return;
  const { brands, categories } = await res.json();
  document.getElementById('new-brand').innerHTML =
    '<option value="">Select brand…</option>' +
    brands.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
  document.getElementById('new-cat').innerHTML =
    '<option value="">Select category…</option>' +
    categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

async function addProduct() {
  const msg = document.getElementById('add-msg');
  const body = {
    name:              document.getElementById('new-name').value.trim(),
    brand:             document.getElementById('new-brand').value,
    category:          document.getElementById('new-cat').value,
    priceDollars:      document.getElementById('new-price').value,
    inventoryQuantity: document.getElementById('new-qty').value,
    colorway:          document.getElementById('new-colorway').value.trim(),
    sizeRange:         document.getElementById('new-size').value,
    imageUrl:          document.getElementById('new-img').value.trim() || null,
    description:       document.getElementById('new-desc').value.trim() || null
  };
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  msg.className  = res.ok ? 'mt-2 fw-bold text-success' : 'mt-2 fw-bold text-danger';
  msg.textContent = res.ok ? `Product "${data.product.name}" added!` : (data.message || 'Failed.');
  if (res.ok) {
    ['new-name','new-price','new-qty','new-colorway','new-img','new-desc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('new-brand').value = '';
    document.getElementById('new-cat').value = '';
    document.getElementById('new-size').value = 'US 7-13';
    loadInventory();
  }
}

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────

async function loadCustomers() {
  const res  = await fetch('/api/admin/customers');
  const data = await res.json();
  const customers = data.customers || [];

  document.getElementById('customers-table').innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover table-sm">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Admin</th><th>Joined</th><th></th></tr></thead>
        <tbody>
          ${customers.map(c => `
            <tr id="cust-row-${c.customerId}">
              <td>${c.customerId}</td>
              <td>${c.firstName} ${c.lastName}</td>
              <td>${c.email}</td>
              <td>${c.phone || '—'}</td>
              <td>${c.isAdmin ? '<span class="badge bg-warning text-dark">Admin</span>' : ''}</td>
              <td class="text-muted small">${new Date(c.createdAt).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-sm btn-outline-secondary" onclick="expandCustomer(${c.customerId})">Edit</button>
                <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteCustomer(${c.customerId}, '${c.firstName} ${c.lastName}')">Delete</button>
              </td>
            </tr>
            <tr id="cust-edit-${c.customerId}" style="display:none">
              <td colspan="7">
                <div class="p-3 bg-light rounded border">

                  <div class="fw-bold mb-2">Account Info</div>
                  <div class="d-flex gap-2 flex-wrap align-items-end mb-3">
                    <div><label class="form-label small mb-1">First Name</label>
                      <input class="form-control form-control-sm" id="edit-fn-${c.customerId}" value="${c.firstName}" /></div>
                    <div><label class="form-label small mb-1">Last Name</label>
                      <input class="form-control form-control-sm" id="edit-ln-${c.customerId}" value="${c.lastName}" /></div>
                    <div><label class="form-label small mb-1">Email</label>
                      <input class="form-control form-control-sm" id="edit-em-${c.customerId}" value="${c.email}" /></div>
                    <div><label class="form-label small mb-1">Phone</label>
                      <input class="form-control form-control-sm" id="edit-ph-${c.customerId}" value="${c.phone || ''}" /></div>
                    <button class="btn btn-sm btn-dark" onclick="saveCustomer(${c.customerId})">Save Info</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="cancelEdit(${c.customerId})">Close</button>
                    <span class="fw-bold small" id="edit-msg-${c.customerId}"></span>
                  </div>

                  <div class="fw-bold mb-2">Reset Password</div>
                  <div class="d-flex gap-2 align-items-end mb-3">
                    <div><label class="form-label small mb-1">New Password</label>
                      <input type="password" class="form-control form-control-sm" id="edit-pw-${c.customerId}" placeholder="New password" /></div>
                    <button class="btn btn-sm btn-warning" onclick="resetPassword(${c.customerId})">Reset</button>
                    <span class="fw-bold small" id="pw-msg-${c.customerId}"></span>
                  </div>

                  <div class="fw-bold mb-2">Shipping Addresses <span class="text-muted fw-normal small" id="addr-list-${c.customerId}">loading…</span></div>
                  <div id="addr-panel-${c.customerId}" class="mb-3"></div>

                  <div class="fw-bold mb-2">Payment Methods <span class="text-muted fw-normal small" id="pm-list-${c.customerId}">loading…</span></div>
                  <div id="pm-panel-${c.customerId}"></div>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function expandCustomer(id) {
  const row = document.getElementById(`cust-edit-${id}`);
  if (row.style.display !== 'none') { row.style.display = 'none'; return; }
  row.style.display = '';
  const res  = await fetch(`/api/admin/customers/${id}`);
  const data = await res.json();
  if (!res.ok) return;
  const c = data.customer;

  const addrPanel = document.getElementById(`addr-panel-${id}`);
  document.getElementById(`addr-list-${id}`).textContent = '';
  if (c.addresses.length === 0) {
    addrPanel.innerHTML = '<p class="text-muted small">No addresses saved.</p>';
  } else {
    addrPanel.innerHTML = c.addresses.map(a => `
      <div class="d-flex justify-content-between align-items-center border rounded px-3 py-2 mb-1 bg-white">
        <span class="small">${a.recipientName} — ${a.streetLine1}, ${a.city}, ${a.province} ${a.postalCode}
          ${a.isDefaultShipping ? '<span class="badge bg-primary ms-1">Default Ship</span>' : ''}
          ${a.isDefaultBilling  ? '<span class="badge bg-secondary ms-1">Default Bill</span>' : ''}
        </span>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress(${id}, ${a.addressId})">Remove</button>
      </div>
    `).join('');
  }

  const pmPanel = document.getElementById(`pm-panel-${id}`);
  document.getElementById(`pm-list-${id}`).textContent = '';
  if (c.paymentMethods.length === 0) {
    pmPanel.innerHTML = '<p class="text-muted small">No payment methods saved.</p>';
  } else {
    pmPanel.innerHTML = c.paymentMethods.map(m => `
      <div class="d-flex justify-content-between align-items-center border rounded px-3 py-2 mb-1 bg-white">
        <span class="small">${m.cardBrand} ending in ${m.cardLast4} — expires ${m.expiryMonth}/${m.expiryYear}
          ${m.isDefault ? '<span class="badge bg-primary ms-1">Default</span>' : ''}
        </span>
        <button class="btn btn-sm btn-outline-danger" onclick="deletePayment(${id}, ${m.paymentMethodId})">Remove</button>
      </div>
    `).join('');
  }
}

function cancelEdit(id) {
  document.getElementById(`cust-edit-${id}`).style.display = 'none';
}

async function deleteCustomer(id, name) {
  if (!confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
  const res = await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
  if (res.ok) loadCustomers();
}

async function deleteAddress(customerId, addressId) {
  if (!confirm('Remove this address?')) return;
  await fetch(`/api/admin/customers/${customerId}/addresses/${addressId}`, { method: 'DELETE' });
  expandCustomer(customerId);
  document.getElementById(`cust-edit-${customerId}`).style.display = 'none';
  expandCustomer(customerId);
}

async function deletePayment(customerId, pmId) {
  if (!confirm('Remove this payment method?')) return;
  await fetch(`/api/admin/customers/${customerId}/payment-methods/${pmId}`, { method: 'DELETE' });
  document.getElementById(`cust-edit-${customerId}`).style.display = 'none';
  expandCustomer(customerId);
}

async function resetPassword(id) {
  const pw  = document.getElementById(`edit-pw-${id}`).value;
  const msg = document.getElementById(`pw-msg-${id}`);
  const res = await fetch(`/api/admin/customers/${id}/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pw })
  });
  const data = await res.json();
  msg.className = res.ok ? 'text-success' : 'text-danger';
  msg.textContent = res.ok ? 'Password updated!' : (data.message || 'Failed.');
}

async function saveCustomer(id) {
  const body = {
    firstName: document.getElementById(`edit-fn-${id}`).value.trim(),
    lastName:  document.getElementById(`edit-ln-${id}`).value.trim(),
    email:     document.getElementById(`edit-em-${id}`).value.trim(),
    phone:     document.getElementById(`edit-ph-${id}`).value.trim() || null
  };
  const res  = await fetch(`/api/admin/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  const msg  = document.getElementById(`edit-msg-${id}`);
  if (res.ok) {
    msg.textContent = 'Saved!';
    setTimeout(() => {
      document.getElementById(`cust-edit-${id}`).style.display = 'none';
      loadCustomers();
    }, 800);
  } else {
    msg.className   = 'text-danger fw-bold small';
    msg.textContent = data.message || 'Failed.';
  }
}

loadNav();
loadMeta();
loadOrders();
