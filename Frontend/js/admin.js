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
          ${orders.map(o => `
            <tr>
              <td>#${o.orderId}</td>
              <td>
                <div class="fw-bold">${o.customerName || ''}</div>
                <div class="text-muted small">${o.customerEmail || ''}</div>
              </td>
              <td>${new Date(o.placedAt).toLocaleDateString()}</td>
              <td><span class="badge bg-secondary">${o.orderStatus}</span></td>
              <td><span class="badge ${o.paymentStatus === 'approved' ? 'bg-success' : 'bg-danger'}">${o.paymentStatus}</span></td>
              <td class="fw-bold">$${(o.totalCents/100).toFixed(2)}</td>
              <td>
                <button class="btn btn-sm btn-outline-secondary" onclick="toggleOrderItems(${o.orderId})">Items</button>
                <div id="order-items-${o.orderId}" style="display:none" class="mt-2"></div>
              </td>
            </tr>
          `).join('')}
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
    releaseYear:       document.getElementById('new-year').value,
    sizeRange:         document.getElementById('new-size').value.trim() || 'US 7-13',
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
    ['new-name','new-price','new-qty','new-colorway','new-year','new-size','new-img','new-desc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('new-brand').value = '';
    document.getElementById('new-cat').value = '';
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
              <td><button class="btn btn-sm btn-outline-secondary" onclick="editCustomer(${c.customerId}, '${c.firstName}', '${c.lastName}', '${c.email}', '${c.phone || ''}')">Edit</button></td>
            </tr>
            <tr id="cust-edit-${c.customerId}" style="display:none">
              <td colspan="7">
                <div class="d-flex gap-2 flex-wrap align-items-end p-2 bg-light rounded">
                  <div>
                    <label class="form-label small mb-1">First Name</label>
                    <input class="form-control form-control-sm" id="edit-fn-${c.customerId}" value="${c.firstName}" />
                  </div>
                  <div>
                    <label class="form-label small mb-1">Last Name</label>
                    <input class="form-control form-control-sm" id="edit-ln-${c.customerId}" value="${c.lastName}" />
                  </div>
                  <div>
                    <label class="form-label small mb-1">Email</label>
                    <input class="form-control form-control-sm" id="edit-em-${c.customerId}" value="${c.email}" />
                  </div>
                  <div>
                    <label class="form-label small mb-1">Phone</label>
                    <input class="form-control form-control-sm" id="edit-ph-${c.customerId}" value="${c.phone || ''}" />
                  </div>
                  <button class="btn btn-sm btn-dark" onclick="saveCustomer(${c.customerId})">Save</button>
                  <button class="btn btn-sm btn-outline-secondary" onclick="cancelEdit(${c.customerId})">Cancel</button>
                  <span class="text-success fw-bold small" id="edit-msg-${c.customerId}"></span>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function editCustomer(id) {
  document.getElementById(`cust-edit-${id}`).style.display = '';
}

function cancelEdit(id) {
  document.getElementById(`cust-edit-${id}`).style.display = 'none';
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
