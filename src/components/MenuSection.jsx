import { useCart } from '../context/CartContext';
import { menuPackages, addOns } from '../data/menu';
import { Star, ShoppingCart } from 'lucide-react';

function MenuSection() {
  const { addToCart } = useCart();

  const handleAddToCart = (pkg) => {
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      description: pkg.description
    });
  };

  const handleAddAddon = (addon) => {
    addToCart({
      id: `addon-${addon.name}`,
      name: addon.name,
      price: addon.price,
      description: addon.description
    });
  };

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

      {/* Add-ons Section */}
      <div style={{ marginTop: '4rem' }}>
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
                onClick={() => handleAddAddon(addon)}
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
      </div>
    </section>
  );
}

export default MenuSection;
