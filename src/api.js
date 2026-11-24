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

// --- Product search --------------------------------------------------------
// Backed by `GET /products/search` (ranked results) and
// `GET /products/suggestions` (header autocomplete). Both degrade to the
// bundled mock catalog when the API is unreachable.

const SEARCH_STOP_WORDS = new Set(["the", "a", "an", "and", "or", "for", "of"]);

function tokenizeSearch(value) {
  return Array.from(
    new Set(
      String(value || "")
        .toLowerCase()
        .split(/\s+/)
        .map((token) => token.replace(/[^\p{L}\p{N}'-]/gu, ""))
        .filter((token) => token && !SEARCH_STOP_WORDS.has(token))
    )
  );
}

function searchableList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).toLowerCase());
  if (typeof value === "string") return splitValues(value).map((item) => item.toLowerCase());
  return [];
}

/** Mirrors the server-side relevance scoring for offline/demo data. */
function scoreProductForSearch(product, phrase, tokens) {
  const name = String(product.name || "").toLowerCase();
  const description = String(product.description || "").toLowerCase();
  const category = String(product.category || "").toLowerCase();
  const colors = searchableList(product.colors);
  const sizes = searchableList(product.sizes);
  const details = searchableList(product.details);

  let score = 0;

  if (name === phrase) score += 140;
  else if (name.startsWith(phrase)) score += 100;
  else if (name.includes(phrase)) score += 80;

  if (category === phrase) score += 60;
  else if (category.includes(phrase)) score += 40;

  if (description.includes(phrase)) score += 15;

  for (const token of tokens) {
    if (name.split(/\s+/).includes(token)) score += 24;
    else if (name.includes(token)) score += 16;

    if (category.split(/\s+/).includes(token)) score += 12;
    else if (category.includes(token)) score += 8;

    if (description.includes(token)) score += 4;
    if (colors.some((color) => color === token)) score += 10;
    else if (colors.some((color) => color.includes(token))) score += 6;

    if (sizes.some((size) => size === token)) score += 6;
    if (details.some((detail) => detail.includes(token))) score += 3;
  }

  if (Number(product.stock) > 0) score += 3;
  if (product.isFeatured) score += 2;
  if (product.isTrending) score += 1;

  return score;
}

function buildLocalSuggestions(ranked, phrase, suggestionLimit) {
  const keywordScores = new Map();
  const categoryCounts = new Map();

  const collect = (raw, weight) => {
    const word = String(raw || "").replace(/[^\p{L}\p{N}'-]/gu, "").trim();
    if (!word) return;
    const key = word.toLowerCase();
    if (key === phrase || !key.startsWith(phrase)) return;
    keywordScores.set(key, (keywordScores.get(key) || 0) + weight);
  };

  for (const { product } of ranked) {
    const category = String(product.category || "").trim();
    if (category) {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    }
    for (const word of String(product.name || "").split(/\s+/)) collect(word, 3);
    collect(category, 2);
    for (const color of searchableList(product.colors)) collect(color, 1);
    for (const size of searchableList(product.sizes)) collect(size, 1);
  }

  return {
    products: ranked.slice(0, suggestionLimit).map(({ product }) => ({
      id: String(product.id),
      name: product.name || "",
      price: Number(product.price) || 0,
      image: resolveProductImage(product.imageURL || product.image || ""),
      category: product.category || "",
    })),
    categories: [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.min(5, suggestionLimit))
      .map(([name, count]) => ({ name, count })),
    keywords: [...keywordScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.min(6, suggestionLimit + 1))
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1)),
  };
}

function emptySearchResult(term, options = {}) {
  return {
    query: term,
    tokens: [],
    took: 0,
    total: 0,
    page: 1,
    limit: Number(options.limit) || 8,
    totalPages: 1,
    data: [],
    suggestions: { products: [], categories: [], keywords: [] },
  };
}

/** Local ranking/fallback used when the search API cannot be reached. */
function buildLocalSearchResult(term, options = {}) {
  const phrase = String(term || "").trim().toLowerCase();
  const tokens = tokenizeSearch(phrase);
  if (!tokens.length) return emptySearchResult(term, options);

  const limit = Math.max(1, Number(options.limit) || 8);
  const page = Math.max(1, Number(options.page) || 1);
  const suggestionLimit = Math.max(1, Number(options.suggestionLimit) || 5);

  const ranked = mockProducts
    .map((product) => ({
      product,
      score: scoreProductForSearch(product, phrase, tokens),
    }))
    .filter(({ product, score }) => {
      if (score <= 0) return false;
      if (options.category && options.category !== "all" && product.category !== options.category) {
        return false;
      }
      if (options.minPrice !== undefined && product.price < options.minPrice) return false;
      if (options.maxPrice !== undefined && product.price > options.maxPrice) return false;
      if (options.inStock && Number(product.stock) <= 0) return false;
      return true;
    });

  if (options.sortBy === "price-asc") ranked.sort((a, b) => a.product.price - b.product.price);
  else if (options.sortBy === "price-desc") ranked.sort((a, b) => b.product.price - a.product.price);
  else if (options.sortBy === "rating") ranked.sort((a, b) => b.product.rating - a.product.rating);
  else ranked.sort((a, b) => b.score - a.score);

  const total = ranked.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;

  return {
    query: String(term || "").trim(),
    tokens,
    took: 0,
    total,
    page: safePage,
    limit,
    totalPages,
    data: ranked
      .slice(start, start + limit)
      .map(({ product, score }) => ({
        ...normalizeProduct(product),
        relevance: Number(score.toFixed(2)),
      })),
    suggestions: buildLocalSuggestions(ranked, phrase, suggestionLimit),
  };
}

function normalizeSearchSuggestions(raw) {
  const products = Array.isArray(raw?.products) ? raw.products : [];
  const categories = Array.isArray(raw?.categories) ? raw.categories : [];
  const keywords = Array.isArray(raw?.keywords) ? raw.keywords : [];

  return {
    products: products.map((product) => ({
      id: String(product.id),
      name: product.name || "",
      price: Number(product.price) || 0,
      image: resolveProductImage(product.image || product.imageURL || ""),
      category: product.category || "",
    })),
    categories: categories.map((category) => ({
      name: String(category.name || ""),
      count: Number(category.count) || 0,
    })),
    keywords: keywords.map((keyword) => String(keyword)),
  };
}

function appendSearchParams(target, options) {
  if (options.limit) target.set("limit", String(options.limit));
  if (options.page) target.set("page", String(options.page));
  if (options.suggestionLimit) target.set("suggestionLimit", String(options.suggestionLimit));
  if (options.category && options.category !== "all") target.set("category", options.category);
  if (options.sortBy) target.set("sortBy", options.sortBy);
  if (options.minPrice !== undefined) target.set("minPrice", String(options.minPrice));
  if (options.maxPrice !== undefined) target.set("maxPrice", String(options.maxPrice));
  if (options.inStock) target.set("inStock", "true");
}

/**
 * Ranked product search.
 *
 * @param {{ q: string, page?: number, limit?: number, category?: string,
 *   sortBy?: string, minPrice?: number, maxPrice?: number, inStock?: boolean,
 *   suggestionLimit?: number }} options
 * @returns {Promise<{ query: string, total: number, page: number, limit: number,
 *   totalPages: number, data: any[], suggestions: { products: any[],
 *   categories: any[], keywords: string[] } }>}
 */
export async function searchProducts(options = {}) {
  const term = String(options.q || "").trim();
  if (!term) return emptySearchResult(term, options);

  const params = new URLSearchParams({ q: term });
  appendSearchParams(params, options);

  try {
    const response = await fetch(`${API_URL}/products/search?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();

    return {
      query: data?.query || term,
      tokens: Array.isArray(data?.tokens) ? data.tokens : tokenizeSearch(term),
      took: Number(data?.took) || 0,
      total: Number(data?.total) || 0,
      page: Number(data?.page) || 1,
      limit: Number(data?.limit) || Number(options.limit) || 8,
      totalPages: Number(data?.totalPages) || 1,
      data: Array.isArray(data?.data) ? data.data.map(normalizeProduct) : [],
      suggestions: normalizeSearchSuggestions(data?.suggestions),
    };
  } catch (error) {
    console.warn("Search API unreachable, using local catalog:", error.message);
    return buildLocalSearchResult(term, options);
  }
}

/**
 * Autocomplete feed for the header search bar.
 * Returns only the suggestion groups, never a full product page.
 */
export async function fetchSearchSuggestions(term, suggestionLimit = 5) {
  const query = String(term || "").trim();
  if (!query) {
    return { query: "", total: 0, suggestions: { products: [], categories: [], keywords: [] } };
  }

  const params = new URLSearchParams({
    q: query,
    suggestionLimit: String(suggestionLimit),
  });

  try {
    const response = await fetch(`${API_URL}/products/suggestions?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();

    return {
      query: data?.query || query,
      total: Number(data?.total) || 0,
      suggestions: normalizeSearchSuggestions(data?.suggestions),
    };
  } catch (error) {
    console.warn("Search suggestions API unreachable, using local catalog:", error.message);
    const local = buildLocalSearchResult(query, { limit: 1, suggestionLimit });
    return {
      query: local.query,
      total: local.total,
      suggestions: local.suggestions,
    };
  }
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

// --- Shipping address -------------------------------------------------------
// The users service stores the customer's default address. The profile page
// reads it on mount and replaces it on save.

/**
 * Saved default shipping address for the signed-in customer.
 * Throws when the request fails so the caller can fall back to the address
 * already cached in the auth context.
 */
export function fetchUserAddress(accessToken) {
  return requestJson("/users/me/address", { token: accessToken });
}

/** Persist the profile page address form (`PUT` replaces the whole address). */
export function updateUserAddress(address, accessToken) {
  return requestJson("/users/me/address", {
    method: "PUT",
    body: {
      street: address?.street || "",
      city: address?.city || "",
      state: address?.state || "",
      postalCode: address?.postalCode || "",
      country: address?.country || "United States",
    },
    token: accessToken,
  });
}

// --- Store settings ---------------------------------------------------------
// Promotions banner, shipping rules and branding, served by the promotions
// service through the gateway. The bundle below mirrors the server defaults so
// the storefront still renders correctly when the API is unreachable.

export const DEFAULT_STORE_SETTINGS = {
  storeName: "ShopForge",
  tagline: "Modern Wardrobe Essentials",
  supportEmail: "support@shopforge.com",
  bannerText:
    "Spring Season: Use code SHOPFORGE10 for 10% off | Free Shipping on orders over $75",
  bannerActive: true,
  freeShippingEnabled: true,
  freeShippingThreshold: 75,
  standardShippingRate: 9.99,
  expressShippingRate: 14.99,
  handlingDays: 1,
  currency: "USD",
};

/** Coerce the API payload into the numbers/booleans the storefront expects. */
export function normalizeStoreSettings(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_STORE_SETTINGS };

  const number = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };

  return {
    ...DEFAULT_STORE_SETTINGS,
    storeName: raw.storeName || DEFAULT_STORE_SETTINGS.storeName,
    tagline: raw.tagline || DEFAULT_STORE_SETTINGS.tagline,
    supportEmail: raw.supportEmail || DEFAULT_STORE_SETTINGS.supportEmail,
    bannerText:
      typeof raw.bannerText === "string"
        ? raw.bannerText
        : DEFAULT_STORE_SETTINGS.bannerText,
    bannerActive:
      raw.bannerActive === undefined
        ? DEFAULT_STORE_SETTINGS.bannerActive
        : Boolean(raw.bannerActive),
    freeShippingEnabled:
      raw.freeShippingEnabled === undefined
        ? DEFAULT_STORE_SETTINGS.freeShippingEnabled
        : Boolean(raw.freeShippingEnabled),
    freeShippingThreshold: number(
      raw.freeShippingThreshold,
      DEFAULT_STORE_SETTINGS.freeShippingThreshold
    ),
    standardShippingRate: number(
      raw.standardShippingRate,
      DEFAULT_STORE_SETTINGS.standardShippingRate
    ),
    expressShippingRate: number(
      raw.expressShippingRate,
      DEFAULT_STORE_SETTINGS.expressShippingRate
    ),
    handlingDays: number(
      raw.handlingDays,
      DEFAULT_STORE_SETTINGS.handlingDays
    ),
    currency: raw.currency || DEFAULT_STORE_SETTINGS.currency,
  };
}

/** Promotions banner + shipping rules. Falls back to the bundled defaults. */
export async function fetchStoreSettings() {
  try {
    const response = await fetch(`${API_URL}/settings/store`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    return normalizeStoreSettings(await response.json());
  } catch (error) {
    console.warn("Store settings API unreachable, using defaults:", error.message);
    return { ...DEFAULT_STORE_SETTINGS };
  }
}

/**
 * Shipping options with their live rates (checkout radio list).
 * Returns null when the API is unreachable so callers can fall back.
 */
export async function fetchShippingMethods() {
  try {
    const response = await fetch(`${API_URL}/settings/shipping/methods`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Shipping methods API unreachable:", error.message);
    return null;
  }
}

/**
 * Price a shipment for the current cart subtotal.
 * `POST`-free: `GET /settings/shipping/quote?subtotal=89.5&method=express`.
 */
export async function fetchShippingQuote(subtotal, method = "standard") {
  try {
    const params = new URLSearchParams({
      subtotal: String(Math.max(0, Number(subtotal) || 0)),
      method: method === "express" ? "express" : "standard",
    });
    const response = await fetch(`${API_URL}/settings/shipping/quote?${params}`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Shipping quote API unreachable:", error.message);
    return null;
  }
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
