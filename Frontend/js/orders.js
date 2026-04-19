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
  } else {
    window.location.href = '/login.html?next=/orders.html';
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/catalog.html';
}

async function loadOrders() {
  const authRes = await fetch('/api/auth/me');
  if (!authRes.ok) { window.location.href = '/login.html?next=/orders.html'; return; }

  const params = new URLSearchParams(window.location.search);
  const confirmedId = params.get('confirmed');
  if (confirmedId) {
    document.getElementById('confirmed-banner').innerHTML = `
      <div class="alert alert-success fw-bold">
        Order #${confirmedId} placed successfully! Thank you for your purchase.
      </div>
    `;
  }

  const res = await fetch('/api/orders');
  const data = await res.json();
  const el = document.getElementById('orders-content');

  if (!data.orders || data.orders.length === 0) {
    el.innerHTML = `<p class="text-muted">No orders yet. <a href="/catalog.html">Start shopping</a></p>`;
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
            <p class="mb-0 text-muted small">Subtotal $${(o.subtotalCents/100).toFixed(2)} + shipping + tax</p>
          </div>
        </div>
        <div class="mt-3" id="items-${o.orderId}">
          <button class="btn btn-sm btn-outline-secondary" onclick="toggleItems(${o.orderId})">View Items</button>
          <div id="items-detail-${o.orderId}" style="display:none" class="mt-2"></div>
        </div>
      </div>
    </div>
  `).join('');
}

async function toggleItems(orderId) {
  const el = document.getElementById(`items-detail-${orderId}`);
  if (el.style.display !== 'none') { el.style.display = 'none'; return; }
  if (el.dataset.loaded) { el.style.display = ''; return; }

  const res = await fetch(`/api/orders/${orderId}`);
  const data = await res.json();
  const items = data.items || [];

  el.innerHTML = `
    <table class="table table-sm mt-2">
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

loadNav();
loadOrders();
