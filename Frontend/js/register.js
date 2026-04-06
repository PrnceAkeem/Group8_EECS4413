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

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, dob, email, password })
  });

  const data = await res.json();

  if (res.ok) {
    msg.className = 'msg success';
    msg.textContent = 'Account created! Redirecting to sign in...';
    setTimeout(() => { window.location.href = '/login.html'; }, 1200);
  } else {
    msg.className = 'msg error';
    msg.textContent = data.message || 'Registration failed.';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') register();
});
