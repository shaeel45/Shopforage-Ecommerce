import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import {
  clearServerWishlist,
  fetchWishlist,
  getWishlistToken,
  removeWishlistItem,
  syncWishlist,
  toggleWishlistItem,
} from "../api";

const WishlistContext = createContext(null);

/** Convert a stored server item back into the storefront wishlist shape. */
function toLocalItem(item) {
  const numeric = Number(item.productId);
  const id =
    item.productId !== undefined &&
    item.productId !== null &&
    Number.isInteger(numeric) &&
    String(numeric) === String(item.productId)
      ? numeric
      : item.productId ?? item.id;

  return {
    id,
    name: item.name,
    price: Number(item.price) || 0,
    image: item.image || "",
    category: item.category || "shop",
    sizes: [],
    colors: [],
  };
}

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("shopforge_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { addToast } = useToast();
  const { user } = useAuth();

  /** Customer link sent with every wishlist call; the token keeps guest lists. */
  const customer = () => ({
    customerId: user?.id,
    customerEmail: user?.email,
  });

  useEffect(() => {
    localStorage.setItem("shopforge_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  /**
   * The browser list stays the source of truth for rendering; the orders
   * service holds the authoritative copy so saves follow the customer.
   * On mount we push the local list, or hydrate from the server when the
   * browser has none.
   */
  useEffect(() => {
    let cancelled = false;
    const wishlistToken = getWishlistToken();

    (async () => {
      if (wishlist.length > 0) {
        const serverWishlist = await syncWishlist(
          wishlistToken,
          wishlist,
          customer()
        );
        if (cancelled || !serverWishlist) return;
        setWishlist((prev) => mergeServerWishlist(serverWishlist, prev));
        return;
      }

      const serverWishlist = await fetchWishlist(wishlistToken, customer());
      if (cancelled || !serverWishlist?.items?.length) return;
      setWishlist(serverWishlist.items.map(toLocalItem));
    })();

    return () => {
      cancelled = true;
    };
    // Runs on mount and whenever the signed-in customer changes so the saved
    // list is linked to the account without re-keying the wishlist identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const isInWishlist = (id) =>
    wishlist.some((item) => String(item.id) === String(id));

  const toggleWishlist = (product) => {
    const wasSaved = isInWishlist(product.id);

    setWishlist((prev) =>
      wasSaved
        ? prev.filter((item) => String(item.id) !== String(product.id))
        : [...prev, product]
    );

    addToast(
      wasSaved
        ? `Removed "${product.name}" from wishlist`
        : `Saved "${product.name}" to wishlist!`,
      wasSaved ? "info" : "success"
    );

    toggleWishlistItem(getWishlistToken(), product, customer()).then(
      (serverWishlist) => {
        if (serverWishlist) {
          setWishlist((prev) => mergeServerWishlist(serverWishlist, prev));
        }
      }
    );
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => String(item.id) !== String(id)));
    addToast("Item removed from wishlist", "info");

    if (id === undefined || id === null) return;
    removeWishlistItem(getWishlistToken(), String(id)).then((serverWishlist) => {
      if (serverWishlist) {
        setWishlist((prev) => mergeServerWishlist(serverWishlist, prev));
      }
    });
  };

  const clearWishlist = () => {
    setWishlist([]);
    clearServerWishlist(getWishlistToken()).then((serverWishlist) => {
      if (serverWishlist) {
        setWishlist((prev) => mergeServerWishlist(serverWishlist, prev));
      }
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

/**
 * Make local rendering agree with the server list while keeping the richer
 * local product snapshots (sizes, colors, stock) that the API does not store.
 */
function mergeServerWishlist(serverWishlist, previous) {
  const serverItems = Array.isArray(serverWishlist?.items)
    ? serverWishlist.items
    : [];

  const previousById = new Map(
    previous.map((item) => [String(item.id), item])
  );

  return serverItems.map((serverItem) => {
    const key = String(serverItem.productId ?? serverItem.id);
    const local = previousById.get(key);
    return local ? { ...local, price: Number(serverItem.price) || local.price } : toLocalItem(serverItem);
  });
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
