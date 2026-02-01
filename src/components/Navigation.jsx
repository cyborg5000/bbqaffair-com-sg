import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

function Navigation() {
  const { toggleCart, totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <Flame size={28} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          BBQ<span>Affair</span>
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="nav-links desktop-nav">
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

        {/* Mobile Navigation */}
        <div className="mobile-nav">
          {/* Cart Icon for Mobile */}
          <button 
            onClick={toggleCart}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-dark)',
              marginRight: '1rem'
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

          {/* Hamburger Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-dark)'
            }}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'white',
          zIndex: 999,
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <li>
              <Link 
                to="/" 
                onClick={closeMobileMenu}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '500',
                  color: 'var(--text-dark)',
                  textDecoration: 'none',
                  display: 'block',
                  padding: '0.5rem 0'
                }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/menu" 
                onClick={closeMobileMenu}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '500',
                  color: 'var(--text-dark)',
                  textDecoration: 'none',
                  display: 'block',
                  padding: '0.5rem 0'
                }}
              >
                Menu
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                onClick={closeMobileMenu}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '500',
                  color: 'var(--text-dark)',
                  textDecoration: 'none',
                  display: 'block',
                  padding: '0.5rem 0'
                }}
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                onClick={closeMobileMenu}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '500',
                  color: 'var(--text-dark)',
                  textDecoration: 'none',
                  display: 'block',
                  padding: '0.5rem 0'
                }}
              >
                Contact
              </Link>
            </li>
            <li style={{ marginTop: '1rem' }}>
              <Link 
                to="/contact" 
                onClick={closeMobileMenu}
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'white',
                  background: 'var(--primary-color)',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  textAlign: 'center'
                }}
              >
                Book Now
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
