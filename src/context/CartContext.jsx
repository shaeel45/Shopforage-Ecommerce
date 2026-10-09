import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";
import { promoCodes } from "../data/products";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("shopforge_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState(() => {
    try {
      const saved = localStorage.getItem("shopforge_promo");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem("shopforge_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem("shopforge_promo", JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem("shopforge_promo");
    }
  }, [appliedPromo]);

  const addToCart = (product, quantity = 1, size = null, color = null) => {
    const selectedSize = size || (product.sizes && product.sizes[0]) || "Standard";
    const selectedColor = color || (product.colors && product.colors[0]) || "Default";

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            category: product.category,
            selectedSize,
            selectedColor,
            quantity
          }
        ];
      }
    });

    addToast(`Added ${quantity}x "${product.name}" (${selectedSize}) to cart!`, "success");
  };

  const removeFromCart = (id, selectedSize, selectedColor) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
      )
    );
    addToast("Item removed from cart", "info");
  };

  const updateQuantity = (id, selectedSize, selectedColor, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyPromo = (code) => {
    const cleanCode = code.trim().toUpperCase();
    const found = promoCodes.find((p) => p.code.toUpperCase() === cleanCode);

    if (found) {
      setAppliedPromo(found);
      addToast(`Promo code "${found.code}" applied: ${found.discountPercent}% OFF!`, "success");
      return { success: true, message: `${found.discountPercent}% discount applied!` };
    } else {
      addToast("Invalid or expired coupon code", "error");
      return { success: false, message: "Invalid coupon code" };
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    addToast("Promo code removed", "info");
  };

  // Calculations
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 75.0;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0.0 : 9.99;
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const tax = ((subtotal - discountAmount) * 0.08); // 8% estimated tax
  const total = Math.max(0, subtotal - discountAmount + shippingFee + (subtotal > 0 ? tax : 0));

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        freeShippingThreshold,
        shippingFee,
        discountAmount,
        tax,
        total,
        appliedPromo,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromo,
        removePromo
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
