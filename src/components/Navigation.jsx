import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

function Navigation() {
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
