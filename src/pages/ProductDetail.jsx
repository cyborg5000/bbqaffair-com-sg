import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../data/menu';
import { useCart } from '../context/CartContext';
import DOMPurify from 'dompurify';
import '../styles/product.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const data = await fetchProductById(id);
      setProduct(data);

      // Set default option if product has options
      if (data?.has_options && data?.product_options?.length > 0) {
        const defaultOpt = data.product_options.find(opt => opt.is_default)
          || data.product_options[0];
        setSelectedOption(defaultOpt);
      } else {
        setSelectedOption(null);
      }

      // Reset selected addons
      setSelectedAddons([]);

      setLoading(false);
    }
    loadProduct();
  }, [id]);

  // Calculate current and original price based on selection
  const basePrice = selectedOption?.current_price ?? product?.price ?? 0;
  const originalPrice = selectedOption?.original_price ?? null;
  const hasDiscount = originalPrice && originalPrice > basePrice;

  // Calculate add-ons total
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price), 0);
  const currentPrice = basePrice + addonsTotal;

  // Toggle addon selection
  function toggleAddon(addon) {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, { id: addon.id, name: addon.name, price: addon.price }];
      }
    });
  }

  function handleAddToCart() {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.image_url,
      quantity: quantity,
      optionId: selectedOption?.id || null,
      optionName: selectedOption?.name || null,
      unitLabel: product.unit_label || null,
      originalPrice: originalPrice,
      addons: selectedAddons.length > 0 ? selectedAddons : null,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Product Not Found</h2>
          <p>Sorry, we couldn't find the product you're looking for.</p>
          <button onClick={() => navigate('/menu')} className="btn-primary">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <span onClick={() => navigate('/')}>Home</span>
          <span>/</span>
          <span onClick={() => navigate('/menu')}>Menu</span>
          <span>/</span>
          <span className="current">{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Image Section */}
          <div className="product-image-section">
            <div className="product-image-main">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="no-image-placeholder">
                  <span>🍖</span>
                  <p>No Image Available</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="product-info-section">
            <span className="product-category">{product.category}</span>
            <h1 className="product-name">{product.name}</h1>

            {/* Price Display */}
            <p className="product-price">
              {hasDiscount && (
                <span className="original-price">${originalPrice.toFixed(2)}</span>
              )}
              <span className="current-price">${currentPrice.toFixed(2)}</span>
              {product.unit_label && (
                <span className="unit-label"> / {product.unit_label}</span>
              )}
            </p>

            {/* Option Selector */}
            {product.has_options && product.product_options?.length > 0 && (
              <div className="options-section">
                <label>Select Option:</label>
                <div className="options-selector">
                  {product.product_options.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      className={`option-btn ${selectedOption?.id === option.id ? 'selected' : ''}`}
                      onClick={() => setSelectedOption(option)}
                    >
                      <span className="option-name">{option.name}</span>
                      <span className="option-price">
                        {option.original_price && option.original_price > option.current_price && (
                          <span className="option-original-price">${option.original_price.toFixed(2)}</span>
                        )}
                        <span className="option-current-price">${option.current_price.toFixed(2)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-Ons Selector */}
            {product.product_addons?.length > 0 && (
              <div className="addons-section">
                <label>Add-Ons (Optional):</label>
                <div className="addons-list">
                  {product.product_addons
                    .filter(addon => addon.is_active)
                    .sort((a, b) => a.display_order - b.display_order)
                    .map(addon => (
                      <label key={addon.id} className="addon-item">
                        <input
                          type="checkbox"
                          checked={selectedAddons.some(a => a.id === addon.id)}
                          onChange={() => toggleAddon(addon)}
                        />
                        <span className="addon-name">{addon.name}</span>
                        <span className="addon-price">+${parseFloat(addon.price).toFixed(2)}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            <div className="product-description">
              <h3>Description</h3>
              {product.description ? (
                <div
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(product.description)
                  }}
                />
              ) : (
                <p>No description available.</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="quantity-section">
              <label>Quantity{product.unit_label ? ` (${product.unit_label})` : ''}:</label>
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="product-actions">
              <button 
                onClick={handleAddToCart}
                className={`btn-add-cart ${addedToCart ? 'added' : ''}`}
                disabled={!product.is_active}
              >
                {addedToCart ? '✓ Added to Cart!' : `Add to Cart - $${(currentPrice * quantity).toFixed(2)}`}
              </button>
              
              {!product.is_active && (
                <p className="unavailable-notice">This item is currently unavailable</p>
              )}
            </div>

            {/* Back to Menu */}
            <button onClick={() => navigate('/menu')} className="btn-back">
              ← Back to Menu
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="product-additional-info">
          <div className="info-card">
            <span>🚚</span>
            <h4>Free Delivery</h4>
            <p>For orders above $200</p>
          </div>
          <div className="info-card">
            <span>⭐</span>
            <h4>Premium Quality</h4>
            <p>Fresh ingredients daily</p>
          </div>
          <div className="info-card">
            <span>👨‍🍳</span>
            <h4>Expert Chefs</h4>
            <p>Professional BBQ masters</p>
          </div>
        </div>
      </div>
    </div>
  );
}
