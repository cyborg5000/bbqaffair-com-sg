import { useCart } from '../context/CartContext';
import { staticMenuPackages as menuPackages, staticAddOns as addOns } from '../data/menu';
import { Star, Check, ShoppingCart } from 'lucide-react';

function Menu() {
  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description
    });
  };

  return (
    <div style={{ paddingTop: '80px' }}>
      <section className="menu-section" style={{ paddingTop: '3rem' }}>
        <h1 className="section-title">Our BBQ Menu</h1>
        <p className="section-subtitle">
          Authentic Singapore BBQ, grilled to perfection for your special events
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
                  <li key={index}>
                    <Check size={16} style={{ color: 'var(--success)', marginRight: '8px' }} />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handleAddToCart(pkg)}
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
      
      <section className="addons-section">
        <h2 className="section-title">Optional Add-Ons</h2>
        <p className="section-subtitle">
          Enhance your BBQ experience with these additional services
        </p>
        
        <div className="addons-grid">
          {addOns.map((addon, index) => (
            <div key={index} className="addon-card">
              <h4>{addon.name}</h4>
              <div className="addon-price">{addon.price}</div>
              <p>{addon.description}</p>
              <button 
                onClick={() => handleAddToCart(addon)}
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
      
      <section style={{ background: 'var(--light-bg)', padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Need a Custom Package?
        </h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>
          We can create a tailored package to suit your specific needs and budget.
        </p>
        <a href="/contact" className="btn btn-primary">
          Contact Us for Custom Quote
        </a>
      </section>
    </div>
  );
}

export default Menu;
