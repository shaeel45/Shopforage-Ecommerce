import { products as mockProducts } from "./data/products";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

export function resolveProductImage(imageURL) {
  if (!imageURL) return "";
  if (/^https?:\/\//i.test(imageURL)) return imageURL;
  return `${API_URL}${imageURL.startsWith("/") ? "" : "/"}${imageURL}`;
}

const splitValues = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export function normalizeProduct(product) {
  if (!product) return null;
  const imageURL = product.imageURL || product.image || "";
  const resolvedMainImage = resolveProductImage(imageURL);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(resolveProductImage)
    : resolvedMainImage ? [resolvedMainImage] : [];

  const rawRating = product.rating;
  const ratingNumber =
    typeof rawRating === "object" && rawRating !== null
      ? Number(rawRating.rate ?? rawRating.average ?? 5.0)
      : Number(rawRating) || 5.0;

  const reviewList = Array.isArray(product.review)
    ? product.review
    : Array.isArray(product.reviews)
    ? product.reviews
    : [];

  const reviewCount =
    typeof rawRating === "object" && rawRating !== null && rawRating.count !== undefined
      ? Number(rawRating.count)
      : reviewList.length > 0
      ? reviewList.length
      : Number(product.reviewCount) || 12;

  return {
    ...product,
    id: String(product.id),
    name: product.name || "",
    category: product.category || "shirts",
    price: Number(product.price) || 0,
    originalPrice: Number(product.original_price ?? product.originalPrice ?? product.price) || 0,
    stock: Number(product.stock) || 0,
    colors: splitValues(product.colors),
    sizes: splitValues(product.sizes),
    details: Array.isArray(product.details) ? product.details : splitValues(product.details),
    images,
    image: resolvedMainImage || images[0] || "",
    rating: ratingNumber,
    ratingObj: typeof rawRating === "object" && rawRating !== null ? rawRating : { rate: ratingNumber, count: reviewCount },
    reviewCount,
    reviews: reviewList,
    isNew: Boolean(product.isNew),
    isTrending: Boolean(product.isTrending),
    featured: Boolean(product.isFeatured ?? product.featured),
  };
}

export async function fetchProducts(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set("page", String(params.page));
  if (params.limit) queryParams.set("limit", String(params.limit));
  if (params.category && params.category !== "all") queryParams.set("category", params.category);
  if (params.search) queryParams.set("search", params.search);
  if (params.sortBy) queryParams.set("sortBy", params.sortBy);
  if (params.minPrice !== undefined) queryParams.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) queryParams.set("maxPrice", String(params.maxPrice));
  if (params.inStock) queryParams.set("inStock", "true");
  if (params.all) queryParams.set("all", "true");

  try {
    const response = await fetch(`${API_URL}/products?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();

    if (Array.isArray(data)) {
      const items = data.map(normalizeProduct);
      return {
        data: items,
        total: items.length,
        page: 1,
        limit: items.length,
        totalPages: 1,
      };
    }

    if (data && Array.isArray(data.data)) {
      return {
        data: data.data.map(normalizeProduct),
        total: Number(data.total) || data.data.length,
        page: Number(data.page) || 1,
        limit: Number(data.limit) || 12,
        totalPages: Number(data.totalPages) || 1,
      };
    }

    throw new Error("Invalid response format");
  } catch (error) {
    console.warn("Products API unreachable or error occurred, using fallback catalog:", error.message);
    // Client-side fallback to mock data
    let filtered = mockProducts.filter((p) => {
      if (params.category && params.category !== "all" && p.category !== params.category) return false;
      if (params.search && !p.name.toLowerCase().includes(params.search.toLowerCase())) return false;
      if (params.maxPrice !== undefined && p.price > params.maxPrice) return false;
      if (params.minPrice !== undefined && p.price < params.minPrice) return false;
      if (params.inStock && p.stock <= 0) return false;
      return true;
    });

    if (params.sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (params.sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else if (params.sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
    else if (params.sortBy === "newest") filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 12);
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      data: paginated.map(normalizeProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.id) {
        return normalizeProduct(data);
      }
    }
  } catch (error) {
    console.warn("fetchProductById error:", error.message);
  }

  // Fallback to mock product
  const found = mockProducts.find((p) => String(p.id) === String(id));
  return found ? normalizeProduct(found) : null;
}

export async function submitProductReview(id, reviewData) {
  try {
    const response = await fetch(`${API_URL}/products/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    if (response.ok) {
      const updated = await response.json();
      return normalizeProduct(updated);
    }
  } catch (error) {
    console.warn("submitProductReview error:", error.message);
  }

  // Fallback local return
  return null;
}

export async function fetchInventoryByProductId(productId) {
  try {
    const response = await fetch(`${API_URL}/inventory/product/${productId}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.warn("fetchInventoryByProductId error:", error.message);
    return null;
  }
}

/** Public JSON request with real status codes preserved on the error object. */
async function requestJson(path, { method = "GET", body, token, headers } = {}) {
  const requestHeaders = { ...(headers || {}) };
  if (body !== undefined && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || data || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function postPublicJson(path, payload) {
  return requestJson(path, { method: "POST", body: payload });
}

// --- Auth -------------------------------------------------------------------
// Storefront authentication is backed by the auth microservice through the
// gateway: POST /auth/login, POST /auth/register, POST /auth/refresh and
// GET /users/me for the signed-in profile.

export function loginUser({ email, password, role = "CUSTOMER" }) {
  return postPublicJson("/auth/login", { email, password, role });
}

export function registerUser({
  fullname,
  lastname,
  email,
  password,
  role = "CUSTOMER",
}) {
  return postPublicJson("/auth/register", {
    fullname,
    lastname,
    email,
    password,
    role,
  });
}

export function refreshAuthToken(refreshToken) {
  return postPublicJson("/auth/refresh", { refreshToken });
}

/** Current user profile for a valid access token. */
export function fetchCurrentUser(accessToken) {
  return requestJson("/users/me", { token: accessToken });
}

/** Hold stock for a pending checkout (prevents overselling). */
export function reserveInventory(productId, quantity, referenceId) {
  return postPublicJson("/inventory/checkout/reserve", {
    productId: Number(productId),
    quantity: Number(quantity),
    referenceId,
  });
}

/** Finalize a reservation into a completed sale. */
export function consumeInventory(productId, quantity, referenceId) {
  return postPublicJson("/inventory/checkout/consume", {
    productId: Number(productId),
    quantity: Number(quantity),
    referenceId,
  });
}

/** Release a reservation when checkout is cancelled or fails. */
export function releaseInventory(productId, quantity, referenceId) {
  return postPublicJson("/inventory/checkout/release", {
    productId: Number(productId),
    quantity: Number(quantity),
    referenceId,
  });
}

/**
 * Promo codes currently redeemable (active, unexpired, not exhausted).
 * Returns null when the API is unreachable so callers can fall back to
 * the bundled demo list.
 */
export async function fetchActivePromoCodes() {
  try {
    const response = await fetch(`${API_URL}/promocodes/active`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Promo codes API unreachable, using fallback list:", error.message);
    return null;
  }
}

/** Dry-run validation — never increments usage. */
export function validatePromoCode(code, orderAmount = 0) {
  return postPublicJson("/promocodes/validate", {
    code,
    orderAmount: Number(orderAmount) || 0,
  });
}

/** Record a redemption for a placed order (increments usage). */
export function redeemPromoCode(code, orderAmount, orderReference) {
  return postPublicJson("/promocodes/redeem", {
    code,
    orderAmount: Number(orderAmount) || 0,
    orderReference,
  });
}

/** Place an order. Throws on validation/network failure so callers can fall back. */
export function createOrder(payload) {
  return postPublicJson("/orders", payload);
}

/**
 * Run full checkout flow through the backend orders service:
 * validates promo, reserves stock, creates order, consumes stock, redeems promo.
 */
export function checkoutOrder(payload) {
  return postPublicJson("/checkout", payload);
}

// --- Server-side cart -------------------------------------------------------
// The orders service owns the authoritative cart. The browser keeps a local
// copy for instant UI and mirrors every mutation here on a best-effort basis.

const CART_TOKEN_KEY = "shopforge_cart_token";

/** Stable per-browser cart token; survives logout because it is not the user id. */
export function getCartToken() {
  try {
    const existing = localStorage.getItem(CART_TOKEN_KEY);
    if (existing) return existing;
    const generated =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `cart-${crypto.randomUUID()}`
        : `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(CART_TOKEN_KEY, generated);
    return generated;
  } catch {
    return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Map a storefront cart line into the API's cart item shape. */
export function toCartItemPayload(item) {
  return {
    productId:
      item.id === undefined || item.id === null ? undefined : String(item.id),
    name: item.name,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    size: item.selectedSize || item.size || undefined,
    color: item.selectedColor || item.color || undefined,
    image: item.image || undefined,
  };
}

/** Best-effort wrapper: cart mirroring must never break the storefront. */
async function mirrorCartRequest(path, options) {
  try {
    return await requestJson(path, options);
  } catch (error) {
    console.warn(`Cart API ${path} unavailable:`, error.message);
    return null;
  }
}

/** Read the server cart (creates an empty one on first call). */
export function fetchCart(cartToken = getCartToken(), customer = {}) {
  const params = new URLSearchParams({ cartToken });
  if (customer.customerId) params.set("customerId", customer.customerId);
  if (customer.customerEmail) params.set("customerEmail", customer.customerEmail);
  return mirrorCartRequest(`/cart?${params.toString()}`);
}

/** Replace the whole server cart with the browser snapshot. */
export function syncCart(cartToken, items, customer = {}) {
  return mirrorCartRequest("/cart", {
    method: "PUT",
    body: {
      cartToken,
      customerId: customer.customerId || undefined,
      customerEmail: customer.customerEmail || undefined,
      items: items.map(toCartItemPayload),
    },
  });
}

export function addCartItem(cartToken, item, customer = {}) {
  return mirrorCartRequest("/cart/items", {
    method: "POST",
    body: {
      cartToken,
      customerId: customer.customerId || undefined,
      customerEmail: customer.customerEmail || undefined,
      item: toCartItemPayload(item),
    },
  });
}

/** Set an absolute quantity for a stored line; 0 removes it. */
export function updateCartItem(cartToken, itemId, quantity) {
  return mirrorCartRequest(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: { cartToken, quantity: Number(quantity) || 0 },
  });
}

export function removeCartItem(cartToken, itemId) {
  return mirrorCartRequest(
    `/cart/items/${itemId}?cartToken=${encodeURIComponent(cartToken)}`,
    { method: "DELETE" }
  );
}

/** Apply a promo to the stored cart. Throws with `status` on a real rejection. */
export function applyCartPromo(cartToken, code) {
  return requestJson("/cart/promo", {
    method: "POST",
    body: { cartToken, code },
  });
}

export function removeCartPromo(cartToken) {
  return mirrorCartRequest(
    `/cart/promo?cartToken=${encodeURIComponent(cartToken)}`,
    { method: "DELETE" }
  );
}

export function clearServerCart(cartToken = getCartToken()) {
  return mirrorCartRequest(
    `/cart?cartToken=${encodeURIComponent(cartToken)}`,
    { method: "DELETE" }
  );
}

// --- Server-side wishlist ---------------------------------------------------
// The orders service owns the saved list. The browser keeps a local copy for
// instant UI and mirrors every save/remove here on a best-effort basis.

const WISHLIST_TOKEN_KEY = "shopforge_wishlist_token";

/** Stable per-browser wishlist token; survives logout because it is not the user id. */
export function getWishlistToken() {
  try {
    const existing = localStorage.getItem(WISHLIST_TOKEN_KEY);
    if (existing) return existing;
    const generated =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `wishlist-${crypto.randomUUID()}`
        : `wishlist-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(WISHLIST_TOKEN_KEY, generated);
    return generated;
  } catch {
    return `wishlist-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Map a storefront saved product into the API's wishlist item shape. */
export function toWishlistItemPayload(item) {
  return {
    productId:
      item.id === undefined || item.id === null ? undefined : String(item.id),
    name: item.name,
    price: Number(item.price) || 0,
    image: item.image || undefined,
    category: item.category || undefined,
  };
}

/** Best-effort wrapper: wishlist mirroring must never break the storefront. */
async function mirrorWishlistRequest(path, options) {
  try {
    return await requestJson(path, options);
  } catch (error) {
    console.warn(`Wishlist API ${path} unavailable:`, error.message);
    return null;
  }
}

/** Read the saved list (creates an empty one on first call). */
export function fetchWishlist(wishlistToken = getWishlistToken(), customer = {}) {
  const params = new URLSearchParams({ wishlistToken });
  if (customer.customerId) params.set("customerId", customer.customerId);
  if (customer.customerEmail) params.set("customerEmail", customer.customerEmail);
  return mirrorWishlistRequest(`/wishlist?${params.toString()}`);
}

/** Replace the whole saved list with the browser snapshot. */
export function syncWishlist(wishlistToken, items, customer = {}) {
  return mirrorWishlistRequest("/wishlist", {
    method: "PUT",
    body: {
      wishlistToken,
      customerId: customer.customerId || undefined,
      customerEmail: customer.customerEmail || undefined,
      items: items.map(toWishlistItemPayload),
    },
  });
}

export function addWishlistItem(wishlistToken, item, customer = {}) {
  return mirrorWishlistRequest("/wishlist/items", {
    method: "POST",
    body: {
      wishlistToken,
      customerId: customer.customerId || undefined,
      customerEmail: customer.customerEmail || undefined,
      item: toWishlistItemPayload(item),
    },
  });
}

/** Heart-button behaviour: add when missing, remove when already saved. */
export function toggleWishlistItem(wishlistToken, item, customer = {}) {
  return mirrorWishlistRequest("/wishlist/toggle", {
    method: "POST",
    body: {
      wishlistToken,
      customerId: customer.customerId || undefined,
      customerEmail: customer.customerEmail || undefined,
      item: toWishlistItemPayload(item),
    },
  });
}

export function removeWishlistItem(wishlistToken, productId) {
  return mirrorWishlistRequest(
    `/wishlist/items/${encodeURIComponent(productId)}?wishlistToken=${encodeURIComponent(
      wishlistToken
    )}`,
    { method: "DELETE" }
  );
}

export function clearServerWishlist(wishlistToken = getWishlistToken()) {
  return mirrorWishlistRequest(
    `/wishlist?wishlistToken=${encodeURIComponent(wishlistToken)}`,
    { method: "DELETE" }
  );
}

/**
 * Orders for one storefront customer. Returns `null` when the API is
 * unreachable so the caller can keep showing local history.
 */
export async function fetchMyOrders(params = {}) {
  const entries = Object.entries(params).filter(
    ([key, value]) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      // The backend validates `email`, so drop a simulated username that is
      // not an address instead of failing the whole lookup.
      !(key === "email" && !String(value).includes("@"))
  );
  const search = new URLSearchParams(entries).toString();

  try {
    const response = await fetch(
      `${API_URL}/orders/mine${search ? `?${search}` : ""}`
    );
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) return data;
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.warn("Orders API unreachable, using local order history:", error.message);
    return null;
  }
}

/** Public receipt lookup by order number (used by the success page). */
export async function fetchOrderByNumber(orderNumber) {
  try {
    const response = await fetch(
      `${API_URL}/orders/track/${encodeURIComponent(orderNumber)}`
    );
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.warn("Order lookup failed:", error.message);
    return null;
  }
}

/** Map an API order into the shape the storefront pages render. */
export function mapApiOrder(order) {
  if (!order) return null;
  const status =
    typeof order.status === "string"
      ? order.status.charAt(0) + order.status.slice(1).toLowerCase()
      : "Processing";

  return {
    id: order.orderNumber ?? String(order.id),
    numericId: order.id,
    date: order.createdAt
      ? new Date(order.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    status,
    trackingNumber: order.trackingNumber || undefined,
    items: (order.items || []).map((item) => ({
      id: item.productId ?? String(item.id),
      name: item.productName,
      price: Number(item.unitPrice) || 0,
      quantity: Number(item.quantity) || 0,
      selectedSize: item.size || undefined,
      selectedColor: item.color || undefined,
      image: item.image || "",
    })),
    shippingAddress: {
      fullName: order.shippingFullName,
      email: order.customerEmail,
      phone: order.customerPhone || undefined,
      street: order.shippingStreet,
      city: order.shippingCity,
      state: order.shippingState,
      postalCode: order.shippingPostalCode,
      country: order.shippingCountry,
    },
    shippingMethod: order.shippingMethod,
    paymentMethod: order.paymentMethod,
    promoCode: order.promoCode || undefined,
    subtotal: Number(order.subtotal) || 0,
    discount: Number(order.discount) || 0,
    tax: Number(order.tax) || 0,
    shippingFee: Number(order.shippingFee) || 0,
    total: Number(order.total) || 0,
  };
}
