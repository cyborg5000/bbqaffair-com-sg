import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '🍖' },
    { path: '/admin/orders', label: 'Orders', icon: '📋' },
    { path: '/', label: 'View Website', icon: '🌐' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>BBQAffair</h2>
          <span>Admin Panel</span>
        </div>
        
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="admin-logout">
          <span>🚪</span> Logout
        </button>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
