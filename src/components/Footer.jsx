import { Link } from 'react-router-dom';
import { Flame, Facebook, Instagram } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={24} />
            BBQAffair
          </h4>
          <p>
            Premium BBQ catering services in Singapore. 
            Making your events memorable with authentic flavors.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Services</h4>
          <ul>
            <li><a href="/menu">Corporate Events</a></li>
            <li><a href="/menu">Private Parties</a></li>
            <li><a href="/menu">Wedding Catering</a></li>
            <li><a href="/menu">Birthday Celebrations</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Follow Us</h4>
          <p>Stay updated with our latest events and promotions</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Facebook size={20} /> Facebook
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Instagram size={20} /> Instagram
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} BBQAffair Singapore. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Serving authentic BBQ across Singapore | Quality guaranteed
        </p>
      </div>
    </footer>
  );
}

export default Footer;
