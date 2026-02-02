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

  const addToCart = useCallback((item) => {
    setCartItems(prev => {
      // Create unique key: product_id + option_id (for products with options)
      const getItemKey = (i) => i.optionId ? `${i.id}-${i.optionId}` : String(i.id);
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
  }, []);

  // Helper to get unique cart item key
  const getItemKey = useCallback((item) => {
    return item.optionId ? `${item.id}-${item.optionId}` : String(item.id);
  }, []);

  const removeFromCart = useCallback((itemId, optionId = null) => {
    const keyToRemove = optionId ? `${itemId}-${optionId}` : String(itemId);
    setCartItems(prev => prev.filter(i => getItemKey(i) !== keyToRemove));
  }, [getItemKey]);

  const updateQuantity = useCallback((itemId, quantity, optionId = null) => {
    if (quantity <= 0) {
      removeFromCart(itemId, optionId);
      return;
    }
    const keyToUpdate = optionId ? `${itemId}-${optionId}` : String(itemId);
    setCartItems(prev =>
      prev.map(i => getItemKey(i) === keyToUpdate ? { ...i, quantity } : i)
    );
  }, [removeFromCart, getItemKey]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('bbqaffair-cart');
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = cartItems.reduce((sum, item) => {
    // Handle both number and string prices (e.g., "$25.00" or 25)
    const price = typeof item.price === 'number'
      ? item.price
      : parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    return sum + (price * item.quantity);
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
