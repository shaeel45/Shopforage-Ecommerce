import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import { promoCodes } from "../data/products";
import {
  addCartItem,
  applyCartPromo,
  clearServerCart,
  DEFAULT_STORE_SETTINGS,
  fetchCart,
  fetchStoreSettings,
  getCartToken,
  removeCartItem,
  removeCartPromo,
  syncCart,
  updateCartItem,
  validatePromoCode,
} from "../api";

const CartContext = createContext(null);

/** Cart lines are identified by product + variant, same rule as the service. */
const lineKey = (id, name, size, color) =>
  `${id ?? name}|${size ?? ""}|${color ?? ""}`;

/** Convert a stored server line back into the storefront cart shape. */
function toLocalItem(item) {
  const numeric = Number(item.productId);
  const id =
    Number.isInteger(numeric) && String(numeric) === String(item.productId)
      ? numeric
      : item.productId;

  return {
    id,
    name: item.name,
    price: Number(item.price) || 0,
    image: item.image || "",
    selectedSize: item.size || "Standard",
    selectedColor: item.color || "Default",
    quantity: Number(item.quantity) || 1,
  };
}

/** Keep the variant → server line id map in sync with a cart response. */
function indexServerCart(serverCart, ref) {
  if (!serverCart?.items) return;
  ref.current = new Map(
    serverCart.items.map((item) => [
      lineKey(item.productId, item.name, item.size, item.color),
      item.id,
    ])
  );
}

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

  /** Promotions banner + shipping rules, refreshed from the settings API. */
  const [storeSettings, setStoreSettings] = useState(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const settings = await fetchStoreSettings();
      if (!cancelled) setStoreSettings(settings);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { addToast } = useToast();
  const { user } = useAuth();

  /** Server line ids for the current browser cart (variant key → item id). */
  const serverIds = useRef(new Map());

  /** Customer link sent with every cart call; the token keeps guest carts. */
  const customer = () => ({
    customerId: user?.id,
    customerEmail: user?.email,
  });

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

  /**
   * The browser cart stays the source of truth for rendering; the orders
   * service holds the authoritative copy used by checkout. On mount we push
   * the local cart, or hydrate from the server when the browser has none.
   */
  useEffect(() => {
    let cancelled = false;
    const cartToken = getCartToken();

    (async () => {
      if (cart.length > 0) {
        const serverCart = await syncCart(cartToken, cart, customer());
        if (cancelled || !serverCart) return;
        indexServerCart(serverCart, serverIds);
        if (serverCart.promo && !appliedPromo) {
          setAppliedPromo({
            code: serverCart.promo.code,
            discountPercent: serverCart.promo.discountPercent,
            description: serverCart.promo.description,
          });
        }
        return;
      }

      const serverCart = await fetchCart(cartToken, customer());
      if (cancelled || !serverCart?.items?.length) return;
      indexServerCart(serverCart, serverIds);
      setCart(serverCart.items.map(toLocalItem));
      if (serverCart.promo) {
        setAppliedPromo({
          code: serverCart.promo.code,
          discountPercent: serverCart.promo.discountPercent,
          description: serverCart.promo.description,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // Runs on mount and whenever the signed-in customer changes so the server
    // cart is linked to the account without re-keying the cart identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  /** Push the whole cart when a granular call cannot be targeted. */
  const fullSync = async (nextCart) => {
    const serverCart = await syncCart(
      getCartToken(),
      nextCart,
      customer()
    );
    if (serverCart) indexServerCart(serverCart, serverIds);
  };

  const addToCart = (product, quantity = 1, size = null, color = null) => {
    const selectedSize = size || (product.sizes && product.sizes[0]) || "Standard";
    const selectedColor = color || (product.colors && product.colors[0]) || "Default";

    const key = lineKey(product.id, product.name, selectedSize, selectedColor);
    const existingIndex = cart.findIndex(
      (item) =>
        lineKey(item.id, item.name, item.selectedSize, item.selectedColor) === key
    );

    const nextCart =
      existingIndex > -1
        ? cart.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [
            ...cart,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              image: product.image,
              category: product.category,
              selectedSize,
              selectedColor,
              quantity,
            },
          ];

    setCart(nextCart);

    addCartItem(
      getCartToken(),
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        selectedSize,
        selectedColor,
        image: product.image,
      },
      customer()
    ).then((serverCart) => {
      if (serverCart) indexServerCart(serverCart, serverIds);
      else fullSync(nextCart);
    });

    addToast(
      `Added ${quantity}x "${product.name}" (${selectedSize}) to cart!`,
      "success"
    );
  };

  const removeFromCart = (id, selectedSize, selectedColor) => {
    const key = lineKey(id, null, selectedSize, selectedColor);
    const nextCart = cart.filter(
      (item) =>
        !(
          item.id === id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        )
    );

    setCart(nextCart);

    const itemId = serverIds.current.get(key);
    if (itemId) {
      removeCartItem(getCartToken(), itemId).then((serverCart) => {
        if (serverCart) indexServerCart(serverCart, serverIds);
        else fullSync(nextCart);
      });
    } else {
      fullSync(nextCart);
    }

    addToast("Item removed from cart", "info");
  };

  const updateQuantity = (id, selectedSize, selectedColor, delta) => {
    const key = lineKey(id, null, selectedSize, selectedColor);
    const current = cart.find(
      (item) =>
        item.id === id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );
    if (!current) return;

    const nextQuantity = current.quantity + delta;
    const nextCart =
      nextQuantity > 0
        ? cart.map((item) =>
            item.id === id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
              ? { ...item, quantity: nextQuantity }
              : item
          )
        : cart.filter(
            (item) =>
              !(
                item.id === id &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
              )
          );

    setCart(nextCart);

    const itemId = serverIds.current.get(key);
    if (itemId) {
      updateCartItem(getCartToken(), itemId, nextQuantity).then((serverCart) => {
        if (serverCart) indexServerCart(serverCart, serverIds);
        else fullSync(nextCart);
      });
    } else {
      fullSync(nextCart);
    }
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    serverIds.current = new Map();
    clearServerCart(getCartToken()).then((serverCart) => {
      if (serverCart) indexServerCart(serverCart, serverIds);
    });
  };

  const applyPromo = async (code) => {
    const cleanCode = String(code || "").trim().toUpperCase();
    if (!cleanCode) {
      addToast("Enter a coupon code", "error");
      return { success: false, message: "Enter a coupon code" };
    }

    const currentSubtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      // The cart service validates against promocodes and stores the discount
      // so checkout applies exactly what the customer saw.
      const serverCart = await applyCartPromo(getCartToken(), cleanCode);
      if (serverCart?.promo) {
        setAppliedPromo({
          code: serverCart.promo.code,
          discountPercent: serverCart.promo.discountPercent,
          description: serverCart.promo.description,
        });
        addToast(
          `Promo code "${serverCart.promo.code}" applied: ${serverCart.promo.discountPercent}% OFF!`,
          "success"
        );
        return { success: true, message: serverCart.promo.description };
      }

      // Cart service responded without a promo (offline mirror): fall through
      // to the standalone validator so the UI still reacts.
      const result = await validatePromoCode(cleanCode, currentSubtotal);
      if (result?.valid) {
        setAppliedPromo({
          code: result.code,
          discountPercent: result.discountPercent,
          description: result.message,
        });
        addToast(
          `Promo code "${result.code}" applied: ${result.discountPercent}% OFF!`,
          "success"
        );
        return { success: true, message: result.message };
      }

      addToast(result?.message || "Invalid or expired coupon code", "error");
      return {
        success: false,
        message: result?.message || "Invalid coupon code",
      };
    } catch (error) {
      // A real HTTP status means the backend rejected the code — report it.
      if (error?.status) {
        addToast(error.message, "error");
        return { success: false, message: error.message };
      }

      // Network failure → fall back to the bundled demo codes.
      const found = promoCodes.find((p) => p.code.toUpperCase() === cleanCode);
      if (found) {
        setAppliedPromo(found);
        addToast(
          `Promo code "${found.code}" applied: ${found.discountPercent}% OFF!`,
          "success"
        );
        return {
          success: true,
          message: `${found.discountPercent}% discount applied!`,
        };
      }

      addToast(error.message || "Invalid or expired coupon code", "error");
      return {
        success: false,
        message: error.message || "Invalid coupon code",
      };
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    removeCartPromo(getCartToken());
    addToast("Promo code removed", "info");
  };

  // Calculations
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = storeSettings.freeShippingThreshold;
  const qualifiesForFreeShipping =
    storeSettings.freeShippingEnabled && subtotal >= freeShippingThreshold;
  const shippingFee =
    subtotal === 0 || qualifiesForFreeShipping
      ? 0.0
      : storeSettings.standardShippingRate;
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
        qualifiesForFreeShipping,
        shippingFee,
        storeSettings,
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
