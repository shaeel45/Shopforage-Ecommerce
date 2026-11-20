import { products as mockProducts, reviews as mockReviews } from "./data/products";

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

async function postPublicJson(path, payload) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
    throw new Error(message);
  }

  return data;
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
