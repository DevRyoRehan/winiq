import { useEffect, useState } from 'react';

function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    console.log("✅ Dashboard mounted");

    fetch(`${import.meta.env.VITE_API_BASE}/profile`, {
      credentials: 'include'
    })
      .then(res => {
        console.log("🔄 Profile fetch status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("📦 Profile response:", data);
        if (data.error) {
          console.warn("🔐 Not authenticated, redirecting to /login");
          window.location.href = '/login';
        } else {
          setProfile(data);
        }
      })
      .catch(err => {
        console.error("❌ Fetch error:", err);
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