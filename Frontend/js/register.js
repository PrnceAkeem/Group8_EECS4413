const params = new URLSearchParams(window.location.search);
const next = params.get('next') || '/catalog.html';

async function register() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const dob       = document.getElementById('dob').value;
  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value;
  const msg       = document.getElementById('msg');

  if (!firstName || !lastName || !dob || !email || !password) {
    msg.className = 'msg error';
    msg.textContent = 'All fields are required.';
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    msg.className = 'msg error';
    msg.textContent = 'Please enter a valid email address.';
    return;
  }

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, dob, email, password })
  });

  const data = await res.json();

  if (res.ok) {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (guestCart.length > 0) {
      await fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: guestCart })
      }).catch(() => null);
      localStorage.removeItem('guestCart');
    }
    msg.className = 'msg success';
    msg.textContent = 'Account created! Redirecting...';
    setTimeout(() => { window.location.href = next; }, 1200);
  } else {
    msg.className = 'msg error';
    msg.textContent = data.message || 'Registration failed.';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') register();
});
