import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Initialize from localStorage if available
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bbqaffair-cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('bbqaffair-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Helper to get unique cart item key (product_id + option_id + addons)
  const getItemKey = useCallback((item) => {
    let key = String(item.id);
    if (item.optionId) {
      key += `-${item.optionId}`;
    }
    // Include addons in key (sorted by id for consistency)
    if (item.addons && item.addons.length > 0) {
      const addonIds = item.addons.map(a => a.id).sort().join(',');
      key += `-addons:${addonIds}`;
    }
    return key;
  }, []);

  const addToCart = useCallback((item) => {
    setCartItems(prev => {
      const itemKey = getItemKey(item);

      const existing = prev.find(i => getItemKey(i) === itemKey);
      if (existing) {
        return prev.map(i =>
          getItemKey(i) === itemKey
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    setIsCartOpen(true);
  }, [getItemKey]);

  // Remove item - accepts full item object to properly match with addons
  const removeFromCart = useCallback((item) => {
    const keyToRemove = getItemKey(item);
    setCartItems(prev => prev.filter(i => getItemKey(i) !== keyToRemove));
  }, [getItemKey]);

  // Update quantity - accepts full item object to properly match with addons
  const updateQuantity = useCallback((item, quantity) => {
    if (quantity <= 0) {
      removeFromCart(item);
      return;
    }
    const keyToUpdate = getItemKey(item);
    setCartItems(prev =>
      prev.map(i => getItemKey(i) === keyToUpdate ? { ...i, quantity } : i)
    );
  }, [removeFromCart, getItemKey]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('bbqaffair-cart');
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const parsePrice = (value) => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    // Handle both number and string prices (e.g., "$25.00" or 25)
    const basePrice = parsePrice(item.price);
    const addonsTotal = (item.addons || []).reduce((addonSum, addon) => {
      return addonSum + parsePrice(addon.price);
    }, 0);
    return sum + ((basePrice + addonsTotal) * item.quantity);
  }, 0);

  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      toggleCart,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export default CartContext;
