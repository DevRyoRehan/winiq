import { useState } from 'react';

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
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Welcome, ${data.name || 'user'}!`);
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
    <div>
      <h2>Login to WinIQ</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>

      <hr />

      <h3>Or login with:</h3>
      <button onClick={() => handleSocialLogin('google')}>Google</button>
      <button onClick={() => handleSocialLogin('facebook')}>Facebook</button>
    </div>
  );
}

export default Login;