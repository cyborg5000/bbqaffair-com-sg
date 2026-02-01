import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchMenuPackages, fetchAddOns, staticMenuPackages, staticAddOns } from '../data/menu';
import { Star, ShoppingCart, Eye } from 'lucide-react';

function MenuSection() {
  const { addToCart } = useCart();
  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Try to fetch from Supabase
        const [pkgs, addons] = await Promise.all([
          fetchMenuPackages(),
          fetchAddOns()
        ]);

        // If data exists, use it; otherwise fallback to static
        setPackages(pkgs.length > 0 ? pkgs : staticMenuPackages);
        setAddOns(addons.length > 0 ? addons : staticAddOns);
      } catch (error) {
        console.error('Error loading menu data:', error);
        // Fallback to static data
        setPackages(staticMenuPackages);
        setAddOns(staticAddOns);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
      id: addon.id || `addon-${addon.name}`,
      name: addon.name,
      price: addon.price,
      description: addon.description
    });
  };

  if (loading) {
    return (
      <section className="menu-section" id="menu">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading menu...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="menu-section" id="menu">
      <h2 className="section-title">Our BBQ Packages</h2>
      <p className="section-subtitle">
        Choose from our carefully curated packages, perfect for any event size
      </p>
      
      <div className="menu-grid">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`menu-card ${pkg.popular ? 'popular' : ''}`}>
            {pkg.popular && (
              <div className="popular-badge">
                <Star size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Most Popular
              </div>
            )}
            
            {pkg.image && (
              <img 
                src={pkg.image} 
                alt={pkg.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}
              />
            )}
            
            <h3>{pkg.name}</h3>
            <div className="menu-price">
              {pkg.price}<span>{pkg.perPerson || '/person'}</span>
            </div>
            {pkg.minPax && <p className="min-pax">Minimum {pkg.minPax} pax</p>}
            <p>{pkg.description}</p>
            
            {pkg.items && pkg.items.length > 0 && (
              <ul className="menu-items">
                {pkg.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <Link 
                to={`/product/${pkg.id}`}
                className="btn btn-secondary"
                style={{ 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none'
                }}
              >
                <Eye size={18} />
                Details
              </Link>
              <button 
                onClick={() => handleAddToCart(pkg)}
                className="btn btn-primary" 
                style={{ 
                  flex: 2,
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
          </div>
        ))}
      </div>

      {/* Add-ons Section */}
      {addOns.length > 0 && (
        <div style={{ marginTop: '4rem' }}>
          <h2 className="section-title">Optional Add-Ons</h2>
          <p className="section-subtitle">
            Enhance your BBQ experience with these additional services
          </p>
          
          <div className="addons-grid">
            {addOns.map((addon) => (
              <div key={addon.id || addon.name} className="addon-card">
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
      )}
    </section>
  );
}

export default MenuSection;
