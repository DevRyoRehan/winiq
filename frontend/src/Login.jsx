import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Welcome, ${data.name || 'user'}!`);
        // Optionally redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${API_BASE}/auth/${provider}`;
  };

  return (
    <div style={{ maxWidth: '400px', margin: '5rem auto', textAlign: 'center' }}>
      <h2>Login to WinIQ</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button type="submit" style={{ width: '100%', padding: '0.5rem' }}>
          Login
        </button>
      </form>

      <p style={{ color: 'red', marginTop: '1rem' }}>{message}</p>

      <hr style={{ margin: '2rem 0' }} />

      <h3>Or login with:</h3>
      <button
        onClick={() => handleSocialLogin('google')}
        style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
      >
        Google
      </button>
      <button
        onClick={() => handleSocialLogin('facebook')}
        style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
      >
        Facebook
      </button>
    </div>
  );
}

export default Login;