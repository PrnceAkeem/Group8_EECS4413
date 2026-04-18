const params = new URLSearchParams(window.location.search);
const next = params.get('next') || '/catalog.html';

async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('msg');

  if (!email || !password) {
    msg.className = 'msg error';
    msg.textContent = 'Please enter your email and password.';
    return;
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    if (data.user.isAdmin) {
      window.location.href = '/admin.html';
      return;
    }

    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (guestCart.length > 0) {
      await fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: guestCart })
      }).catch(() => null);
      localStorage.removeItem('guestCart');
    }

    window.location.href = next;
  } else {
    msg.className = 'msg error';
    msg.textContent = data.message || 'Login failed.';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') login();
});
