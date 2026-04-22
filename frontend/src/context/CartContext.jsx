import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("optica_cart") || "[]"); }
    catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("optica_cart", JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((p) => p.id === product.id);
      if (ex) return prev.map((p) => p.id === product.id ? { ...p, quantity: p.quantity + qty } : p);
      return [...prev, { ...product, quantity: qty }];
    });
    setOpen(true);
  };
  const remove = (id) => setItems((p) => p.filter((i) => i.id !== id));
  const update = (id, qty) => setItems((p) => p.map((i) => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total, count, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
