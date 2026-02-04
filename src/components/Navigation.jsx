import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

function Navigation() {
  const { toggleCart, totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);
  const contactMenuRef = useRef(null);

  // Scroll detection for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contactMenuRef.current && !contactMenuRef.current.contains(event.target)) {
        setContactMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileContactOpen(false);
  };

  const toggleContactMenu = () => {
    setContactMenuOpen((open) => !open);
  };

  const closeContactMenu = () => {
    setContactMenuOpen(false);
  };

  const toggleMobileContactMenu = () => {
    setMobileContactOpen((open) => !open);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <img src="/images/logo.png" alt="BBQ Affair" className="logo-image" />
        </Link>

        {/* Desktop Navigation */}
        <ul className="nav-links desktop-nav">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/menu">Menu</Link></li>
          <li><Link to="/about">About</Link></li>
          <li
            className={`nav-dropdown ${contactMenuOpen ? 'open' : ''}`}
            ref={contactMenuRef}
            onMouseEnter={() => setContactMenuOpen(true)}
          >
            <button
              type="button"
              className="nav-link-button"
              onClick={toggleContactMenu}
              aria-haspopup="true"
              aria-expanded={contactMenuOpen}
            >
              Contact
              <span className="nav-caret" aria-hidden="true">▾</span>
            </button>
            <ul className="dropdown-menu" role="menu">
              <li role="none">
                <Link to="/contact" role="menuitem" onClick={closeContactMenu}>
                  Contact Us
                </Link>
              </li>
              <li role="none">
                <Link to="/review" role="menuitem" onClick={closeContactMenu}>
                  Leave a Review
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <button
              onClick={toggleCart}
              className="cart-button"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </button>
          </li>
          <li>
            <Link to="/menu" className="nav-cta">
              Book Now
            </Link>
          </li>
        </ul>

        {/* Mobile Navigation */}
        <div className="mobile-nav">
          {/* Cart Icon for Mobile */}
          <button
            onClick={toggleCart}
            className="cart-button"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="mobile-menu-button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <ul className="mobile-menu-links">
            <li>
              <Link to="/" onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/menu" onClick={closeMobileMenu}>
                Menu
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={closeMobileMenu}>
                About
              </Link>
            </li>
            <li className={`mobile-dropdown ${mobileContactOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="mobile-dropdown-toggle"
                onClick={toggleMobileContactMenu}
                aria-expanded={mobileContactOpen}
              >
                Contact
                <span className="nav-caret" aria-hidden="true">▾</span>
              </button>
              <ul className="mobile-dropdown-menu">
                <li>
                  <Link
                    to="/contact"
                    onClick={closeMobileMenu}
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/review"
                    onClick={closeMobileMenu}
                  >
                    Leave a Review
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
          <div className="mobile-menu-cta">
            <Link to="/menu" onClick={closeMobileMenu}>
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
