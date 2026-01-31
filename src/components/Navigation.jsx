import { Link } from 'react-router-dom';
import { Flame, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

function Navigation() {
  const { toggleCart, totalItems } = useCart();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <Flame size={28} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          BBQ<span>Affair</span>
        </Link>
        
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/menu">Menu</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li>
            <button 
              onClick={toggleCart}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-dark)',
                fontSize: '1rem'
              }}
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'var(--primary-color)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {totalItems}
                </span>
              )}
            </button>
          </li>
          <li>
            <Link to="/contact" className="nav-cta">
              Book Now
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
