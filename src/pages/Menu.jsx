import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { fetchProducts, fetchCategories } from '../data/menu';
import { Star, Check, ShoppingCart, Eye, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/menu-categories.css';


function Menu() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto-detect active category on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (categories.length === 0) return;
      
      const scrollPosition = window.scrollY + 160; // Offset for headers
      
      for (const category of categories) {
        const element = document.getElementById(`category-${category.name.replace(/\s+/g, '-')}`);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setSelectedCategory(category.name);
            return;
          }
        }
      }
      
      // If scrolled to top, clear selection
      if (window.scrollY < 100) {
        setSelectedCategory(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const cat = product.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  // Always show all categories - selectedCategory is only for UI highlighting
  const displayCategories = categories;

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description
    });
  };

  const scrollToCategory = (categoryName) => {
    const element = document.getElementById(`category-${categoryName.replace(/\s+/g, '-')}`);
    if (element) {
      const offset = 140; // Account for sticky header + category nav
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
    setSelectedCategory(categoryName);
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedCategory(null);
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', textAlign: 'center', padding: '4rem' }}>
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="menu-page">
      {/* Categories Sidebar - Desktop */}
      <aside className="categories-sidebar">
        <div className="categories-header">
          <h3>Categories</h3>
          <span className="categories-count">{categories.length}</span>
        </div>
        <nav className="categories-nav">
          <button 
            className={`category-btn ${!selectedCategory ? 'active' : ''}`}
            onClick={scrollToTop}
          >
            <span>🍖</span>
            All Products
            <span className="product-count">{products.length}</span>
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => scrollToCategory(category.name)}
            >
              <span>{getCategoryIcon(category.name)}</span>
              {category.name}
              <span className="product-count">
                {productsByCategory[category.name]?.length || 0}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Category Navigation */}
      <div className="mobile-category-nav">
        <button 
          className="mobile-category-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="mobile-category-icon">{selectedCategory ? getCategoryIcon(selectedCategory) : '🍖'}</span>
          <span className="mobile-category-label">{selectedCategory || 'All Categories'}</span>
          <ChevronDown size={20} className={`mobile-category-chevron ${isMobileMenuOpen ? 'open' : ''}`} />
        </button>
        
        {isMobileMenuOpen && (
          <div className="mobile-category-dropdown">
            <button 
              className={`mobile-category-item ${!selectedCategory ? 'active' : ''}`}
              onClick={scrollToTop}
            >
              <span>🍖</span>
              All Products
              <span className="product-count">{products.length}</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`mobile-category-item ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => scrollToCategory(category.name)}
              >
                <span>{getCategoryIcon(category.name)}</span>
                {category.name}
                <span className="product-count">
                  {productsByCategory[category.name]?.length || 0}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="menu-main">
        <div className="menu-header">
          <h1 className="section-title">Our BBQ Menu</h1>
          <p className="section-subtitle">
            Authentic Singapore BBQ, grilled to perfection for your special events
          </p>
        </div>

        {/* Products by Category */}
        {displayCategories.map((category) => {
          const categoryProducts = productsByCategory[category.name] || [];
          if (categoryProducts.length === 0) return null;

          return (
            <section 
              key={category.id} 
              id={`category-${category.name.replace(/\s+/g, '-')}`}
              className="category-section"
            >
              <div className="category-header">
                <h2>{category.name}</h2>
                <span className="category-badge">{categoryProducts.length} items</span>
              </div>
              
              <div className="menu-grid">
                {categoryProducts.map((product) => (
                  <div key={product.id} className={`menu-card ${product.popular ? 'popular' : ''}`}>
                    {product.popular && (
                      <div className="popular-badge">
                        <Star size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Most Popular
                      </div>
                    )}
                    
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginBottom: '1rem'
                        }}
                      />
                    )}
                    
                    <h3>{product.name}</h3>
                    <div className="menu-price">
                      ${product.price.toFixed(2)}
                      {product.min_pax && <span className="min-pax"> (min {product.min_pax} pax)</span>}
                    </div>
                    <p>{product.description}</p>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <Link 
                        to={`/product/${product.id}`}
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
                        onClick={() => handleAddToCart(product)}
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
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Custom Package CTA */}
        <section className="custom-package-cta">
          <h2>Need a Custom Package?</h2>
          <p>
            We can create a tailored package to suit your specific needs and budget.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Contact Us for Custom Quote
          </Link>
        </section>
      </main>
    </div>
  );
}

// Helper function for category icons
function getCategoryIcon(categoryName) {
  const icons = {
    'Special Set 2026': '🎉',
    'Chef and Service Staff (3 HOUR)': '👨‍🍳',
    'BBQ Package': '🍖',
    'Salad': '🥗',
    'Cooked Food (Mains)': '🍛',
    'Cooked Food (Sides)': '🥘',
    'Sides': '🍟',
    'Pork': '🥓',
    'Chicken': '🍗',
    'Lamb': '🍖',
    'Premium Beef': '🥩',
    'Seafood': '🦐',
    'Baby Lobster ( Seafood)': '🦞',
    'Sausage': '🌭',
    'Otah': '🐟',
    'Satay': '🍢',
    'Burger Set': '🍔',
    'Vegetarian': '🥬',
    'Lok Lok': '🍡',
    'Dessert': '🍰',
    'Dessert Tarts': '🥧',
    'Sauces': '🥫',
    'Drinks': '🥤',
    'Dry Goods': '📦',
    'Live station': '🔥',
    'Rental Service': '🏕️',
    'package': '📦',
    'addon': '➕',
    'service': '🔧'
  };
  return icons[categoryName] || '🍽️';
}

export default Menu;
