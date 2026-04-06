function showTab(tab) {
  ['orders','inventory','customers'].forEach(t => {
    document.getElementById(`tab-${t}`).style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('#admin-tabs .nav-link').forEach((btn, i) => {
    btn.classList.toggle('active', ['orders','inventory','customers'][i] === tab);
  });
  if (tab === 'orders') loadOrders();
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

async function loadOrders() {
  const res = await fetch('/api/admin/orders');
  const data = await res.json();
  const orders = data.orders || [];
  document.getElementById('orders-table').innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover table-sm">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Status</th><th>Payment</th><th>Total</th></tr></thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td>#${o.orderId}</td>
              <td>${o.customerEmail || o.customerId}</td>
              <td>${new Date(o.placedAt).toLocaleDateString()}</td>
              <td><span class="badge bg-secondary">${o.orderStatus}</span></td>
              <td><span class="badge ${o.paymentStatus === 'approved' ? 'bg-success' : 'bg-danger'}">${o.paymentStatus}</span></td>
              <td class="fw-bold">$${(o.totalCents/100).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadInventory() {
  const res = await fetch('/api/admin/products');
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
              <td>${p.brand}</td>
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

async function addProduct() {
  const msg = document.getElementById('add-msg');
  const body = {
    productId:         document.getElementById('new-id').value.trim(),
    name:              document.getElementById('new-name').value.trim(),
    model:             document.getElementById('new-model').value.trim(),
    brandId:           parseInt(document.getElementById('new-brand').value, 10),
    categoryId:        parseInt(document.getElementById('new-cat').value, 10),
    priceCents:        parseInt(document.getElementById('new-price').value, 10),
    inventoryQuantity: parseInt(document.getElementById('new-qty').value, 10),
    sizeRange:         document.getElementById('new-size').value.trim(),
    releaseYear:       parseInt(document.getElementById('new-year').value, 10),
    description:       document.getElementById('new-desc').value.trim(),
    colorway:          document.getElementById('new-colorway').value.trim()
  };
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  msg.className = res.ok ? 'mt-2 fw-bold text-success' : 'mt-2 fw-bold text-danger';
  msg.textContent = res.ok ? 'Product added!' : (data.message || 'Failed.');
  if (res.ok) loadInventory();
}

async function loadCustomers() {
  const res = await fetch('/api/admin/customers');
  const data = await res.json();
  const customers = data.customers || [];
  document.getElementById('customers-table').innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover table-sm">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Admin</th><th>Joined</th></tr></thead>
        <tbody>
          ${customers.map(c => `
            <tr>
              <td>${c.customerId}</td>
              <td>${c.firstName} ${c.lastName}</td>
              <td>${c.email}</td>
              <td>${c.isAdmin ? '<span class="badge bg-warning text-dark">Admin</span>' : ''}</td>
              <td class="text-muted small">${new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

loadNav();
loadOrders();
