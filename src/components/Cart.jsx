import { useCart } from '../context/CartContext';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';

function Cart() {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          opacity: isCartOpen ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Cart Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '100%',
        maxWidth: '450px',
        height: '100vh',
        background: 'white',
        zIndex: 2001,
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8f8f8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag size={24} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Your Cart</h2>
            <span style={{
              background: 'var(--primary-color)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              {totalItems}
            </span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem'
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#666'
            }}>
              <ShoppingBag size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Your cart is empty</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Add some BBQ packages to get started!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map((item, index) => {
                // Generate unique key including addons
                let itemKey = item.optionId ? `${item.id}-${item.optionId}` : String(item.id);
                if (item.addons && item.addons.length > 0) {
                  itemKey += `-addons:${item.addons.map(a => a.id).sort().join(',')}`;
                }
                const displayPrice = typeof item.price === 'number'
                  ? `$${item.price.toFixed(2)}`
                  : item.price;

                return (
                  <div
                    key={itemKey}
                    style={{
                      background: '#f8f8f8',
                      padding: '1rem',
                      borderRadius: '8px',
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                        {item.name}
                        {item.optionName && (
                          <span style={{ color: 'var(--primary-color)', fontWeight: 'normal' }}>
                            {' '}- {item.optionName}
                          </span>
                        )}
                      </h4>
                      {/* Display Add-Ons */}
                      {item.addons && item.addons.length > 0 && (
                        <div style={{
                          margin: '0.375rem 0',
                          fontSize: '0.8rem',
                          color: '#666'
                        }}>
                          {item.addons.map(addon => (
                            <div key={addon.id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '0.125rem 0',
                              color: '#3b82f6'
                            }}>
                              <span>+ {addon.name}</span>
                              <span>+${parseFloat(addon.price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span style={{ textDecoration: 'line-through', marginRight: '0.5rem', color: '#999' }}>
                            ${item.originalPrice.toFixed(2)}
                          </span>
                        )}
                        {displayPrice}
                        {item.unitLabel && (
                          <span style={{ color: '#888' }}> / {item.unitLabel}</span>
                        )}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'white',
                      borderRadius: '6px',
                      padding: '0.25rem'
                    }}>
                      <button
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: 'none',
                          background: '#eee',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Minus size={16} />
                      </button>
                      <span style={{
                        minWidth: '30px',
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: 'none',
                          background: '#eee',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e74c3c',
                        cursor: 'pointer',
                        padding: '0.5rem'
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '1.5rem',
            borderTop: '2px solid #eee',
            background: '#f8f8f8'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary-color)' }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            
            <a
              href="/checkout"
              className="btn btn-primary"
              style={{
                width: '100%',
                textAlign: 'center',
                display: 'block',
                marginBottom: '0.75rem'
              }}
              onClick={() => setIsCartOpen(false)}
            >
              Proceed to Checkout
            </a>
            
            <button
              onClick={clearCart}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Cart;
