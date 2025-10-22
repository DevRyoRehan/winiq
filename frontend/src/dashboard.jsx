import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    console.log("✅ Dashboard mounted");

    axios.get(`${import.meta.env.VITE_API_BASE}/profile`, {
      withCredentials: true
    })
    .then(res => {
      console.log("🔄 Profile fetch status:", res.status);
      console.log("📦 Profile response:", res.data);
      if (res.data.error) {
        console.warn("🔐 Not authenticated, redirecting to /login");
        window.location.href = '/login';
      } else {
        setProfile(res.data);
      }
    })
    .catch(err => {
      console.error("❌ Axios fetch error:", err);
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
