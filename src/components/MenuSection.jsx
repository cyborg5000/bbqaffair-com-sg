import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchMenuPackages, fetchAddOns } from '../data/menu';
import { Star, ShoppingCart, Eye } from 'lucide-react';

function MenuSection() {
  // Temporarily hidden per request.
  const isHidden = true;
  if (isHidden) return null;

  const { addToCart } = useCart();
  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pkgs, addons] = await Promise.all([
          fetchMenuPackages(),
          fetchAddOns()
        ]);

        setPackages(pkgs);
        setAddOns(addons);
      } catch (error) {
        console.error('Error loading menu data:', error);
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
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading our delicious menu...</p>
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
                <Star size={14} />
                Most Popular
              </div>
            )}

            {pkg.image && (
              <div className="menu-card-image-wrapper">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="menu-card-image"
                  loading="lazy"
                />
              </div>
            )}

            <div className="menu-card-content">
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

              <div className="menu-card-actions">
                <Link
                  to={`/product/${pkg.id}`}
                  className="btn btn-outline-dark"
                >
                  <Eye size={18} />
                  Details
                </Link>
                <button
                  onClick={() => handleAddToCart(pkg)}
                  className="btn btn-primary"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add-ons Section */}
      {addOns.length > 0 && (
        <div className="addons-section-inner">
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
                  className="btn btn-primary addon-btn"
                >
                  <ShoppingCart size={16} />
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
