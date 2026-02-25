import { useState, useCallback } from 'react';

export function useCart() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  });

  const save = (next) => { setItems(next); localStorage.setItem('cart', JSON.stringify(next)); };

  const addItem = useCallback((menu) => {
    setItems(prev => {
      const existing = prev.find(i => i.menuId === menu.id);
      const next = existing
        ? prev.map(i => i.menuId === menu.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { menuId: menu.id, nameKo: menu.nameKo, nameEn: menu.nameEn, price: menu.price, quantity: 1 }];
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQty = useCallback((menuId, qty) => {
    setItems(prev => {
      const next = qty <= 0 ? prev.filter(i => i.menuId !== menuId) : prev.map(i => i.menuId === menuId ? { ...i, quantity: qty } : i);
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => { save([]); }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, addItem, updateQty, clear, total };
}
