import { useEffect, useState } from 'react';

function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/profile`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) window.location.href = '/login';
        else setProfile(data);
      });
  }, []);

  const handleLogout = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE}/logout`;
  };

  return (
    <div style={{ maxWidth: '600px', margin: '5rem auto', textAlign: 'center' }}>
      <h2>Welcome to WinIQ</h2>
      {profile ? (
        <>
          <p>Hello, {profile.name} ({profile.provider})</p>
          <p>Email: {profile.email}</p>
          <button onClick={handleLogout} style={{ marginTop: '2rem' }}>
            Logout
          </button>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

export default Dashboard;