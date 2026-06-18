import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath =
    user?.user_type === 'admin' ? '/admin' :
    user?.user_type === 'agent' ? '/agent' : '/dashboard';

  return (
    <nav style={styles.nav}>
      <span style={styles.brand} onClick={() => navigate(dashboardPath)}>
        📋 ComplaintReg
      </span>
      {user && (
        <div style={styles.right}>
          <span style={styles.name}>👤 {user.name}</span>
          <span style={styles.badge}>{user.user_type}</span>
          <button onClick={handleLogout} style={styles.btn}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 32px', height: 60, background: '#4f46e5',
    color: '#fff', position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  brand: { fontWeight: 700, fontSize: 20, cursor: 'pointer', letterSpacing: 0.5 },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  name:  { fontSize: 14 },
  badge: {
    background: 'rgba(255,255,255,0.2)', padding: '3px 10px',
    borderRadius: 20, fontSize: 12, textTransform: 'capitalize'
  },
  btn: {
    padding: '6px 14px', background: 'rgba(255,255,255,0.15)',
    color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 6, cursor: 'pointer', fontSize: 13
  }
};