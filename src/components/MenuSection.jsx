import { menuPackages } from '../data/menu';
import { Star } from 'lucide-react';

function MenuSection() {
  return (
    <section className="menu-section" id="menu">
      <h2 className="section-title">Our BBQ Packages</h2>
      <p className="section-subtitle">
        Choose from our carefully curated packages, perfect for any event size
      </p>
      
      <div className="menu-grid">
        {menuPackages.map((pkg) => (
          <div key={pkg.id} className={`menu-card ${pkg.popular ? 'popular' : ''}`}>
            {pkg.popular && (
              <div className="popular-badge">
                <Star size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Most Popular
              </div>
            )}
            
            <h3>{pkg.name}</h3>
            <div className="menu-price">
              {pkg.price}<span>{pkg.perPerson}</span>
            </div>
            <p className="min-pax">Minimum {pkg.minPax} pax</p>
            <p>{pkg.description}</p>
            
            <ul className="menu-items">
              {pkg.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            
            <a href="/contact" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              Book This Package
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MenuSection;
