import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'ecom_cart';

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((saree) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === saree._id);
      if (existing) {
        return prev.map(i => i._id === saree._id ? { ...i, qty: i.qty + 1 } : i);
      }
      const imageUrl = saree.coverImage
        ? (typeof saree.coverImage === 'object' ? saree.coverImage.thumbnail || saree.coverImage.list : saree.coverImage)
        : null;
      return [...prev, {
        _id: saree._id,
        name: saree.name,
        price: saree.price,
        discount: saree.discount || 0,
        image: imageUrl,
        qty: 1,
      }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i._id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return removeItem(id);
    setItems(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((acc, i) => acc + i.qty, 0);
  const totalPrice = items.reduce((acc, i) => {
    const discounted = i.price * (1 - (i.discount || 0) / 100);
    return acc + discounted * i.qty;
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
