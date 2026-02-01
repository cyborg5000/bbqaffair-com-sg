import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import '../styles/product.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: quantity,
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
            <p className="product-price">${product.price.toFixed(2)}</p>
            
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="quantity-section">
              <label>Quantity:</label>
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
                {addedToCart ? '✓ Added to Cart!' : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
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
