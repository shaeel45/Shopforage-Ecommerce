import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchMyOrders, mapApiOrder } from "../api";

const OrderContext = createContext(null);

const STORAGE_KEY = "shopforge_orders";

const initialOrders = [
  {
    id: "SF-829410",
    date: "2026-03-01",
    status: "Delivered",
    trackingNumber: "TRK9482710492",
    items: [
      {
        id: "sh-1",
        name: "Classic Oxford Cotton Button-Down",
        price: 68.0,
        selectedSize: "L",
        selectedColor: "Sky Blue",
        quantity: 1,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "pa-1",
        name: "Tailored Slim Chino Trousers",
        price: 78.0,
        selectedSize: "32x32",
        selectedColor: "Khaki Tan",
        quantity: 1,
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80"
      }
    ],
    shippingAddress: {
      fullName: "Alex Morgan",
      email: "alex.morgan@shopforge.com",
      street: "450 Broadway Ave, Apt 4B",
      city: "New York",
      state: "NY",
      postalCode: "10013",
      country: "United States"
    },
    shippingMethod: "Standard Express (Free)",
    paymentMethod: "Credit Card (ending in 4242)",
    subtotal: 146.0,
    discount: 14.6,
    tax: 10.51,
    shippingFee: 0.0,
    total: 141.91
  }
];

function readStoredOrders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialOrders;
  } catch {
    return initialOrders;
  }
}

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(readStoredOrders);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  /**
   * Local-only order used when the orders API cannot be reached. It is flagged
   * so a later sync can keep it alongside server orders.
   */
  const placeOrder = (orderData) => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: `SF-${randomSuffix}`,
      date: new Date().toISOString().split("T")[0],
      status: "Processing",
      trackingNumber: `TRK${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      offline: true,
      ...orderData
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  /** Store an order created by the API in the local cache (newest first). */
  const recordOrder = useCallback((apiOrder) => {
    const mapped = mapApiOrder(apiOrder);
    if (!mapped) return null;

    setOrders((prev) => [mapped, ...prev.filter((order) => order.id !== mapped.id)]);
    return mapped;
  }, []);

  /**
   * Replace local history with the server's orders for this customer while
   * keeping any offline-only orders. No-op when the API is unreachable.
   */
  const syncOrders = useCallback(async (user) => {
    if (!user) return;

    const remote = await fetchMyOrders({
      customerId: user.id,
      email: user.email,
      limit: 50
    });
    if (!remote) return;

    const mapped = remote.map(mapApiOrder).filter(Boolean);
    const remoteIds = new Set(mapped.map((order) => order.id));

    setOrders((prev) => {
      const offlineOnly = prev.filter(
        (order) => order.offline && !remoteIds.has(order.id)
      );
      return [...mapped, ...offlineOnly].sort((a, b) =>
        String(b.date).localeCompare(String(a.date))
      );
    });
  }, []);

  const getOrder = (id) => {
    return orders.find((o) => o.id === id);
  };

  return (
    <OrderContext.Provider
      value={{ orders, placeOrder, recordOrder, syncOrders, getOrder }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
