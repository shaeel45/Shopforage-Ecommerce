import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { reviews as defaultReviews } from "../data/products";
import { fetchProductById, fetchProducts, submitProductReview } from "../api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description"); // description | specs | reviews
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [productReviews, setProductReviews] = useState(defaultReviews);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchProductById(id)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        if (data) {
          setActiveImage(data.images?.[0] || data.image || "");
          setSelectedSize(data.sizes?.[0] || "");
          setSelectedColor(data.colors?.[0] || "");
          setQuantity(1);
          if (Array.isArray(data.reviews) && data.reviews.length > 0) {
            setProductReviews(data.reviews);
          } else {
            setProductReviews(defaultReviews);
          }

          // Fetch related products
          fetchProducts({ category: data.category, limit: 5 }).then((res) => {
            if (!active) return;
            const related = (res.data || []).filter((p) => String(p.id) !== String(data.id)).slice(0, 4);
            setRelatedProducts(related);
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching product detail:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-stone-500 text-sm">Loading product details…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Product Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">
          We couldn't locate the product you were looking for.
        </p>
        <Link
          to="/products"
          className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-stone-800 transition"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    navigate("/checkout");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewText.trim()) return;

    const newRev = {
      id: Date.now(),
      author: newReviewAuthor.trim(),
      role: "Verified Buyer",
      rating: newReviewRating,
      date: "Just now",
      comment: newReviewText.trim(),
      product: product.name,
    };

    // Optimistically update
    setProductReviews([newRev, ...productReviews]);
    setNewReviewAuthor("");
    setNewReviewText("");
    addToast("Thank you! Your review has been submitted.", "success");

    // Call API
    const updatedProduct = await submitProductReview(product.id, {
      author: newRev.author,
      rating: newRev.rating,
      comment: newRev.comment,
    });
    if (updatedProduct) {
      setProduct(updatedProduct);
      if (Array.isArray(updatedProduct.reviews)) {
        setProductReviews(updatedProduct.reviews);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-stone-500 mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black transition">Shop</Link>
          <span>/</span>
          <Link to={`/products/${product.category}`} className="capitalize hover:text-black transition">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gallery Column */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-100">
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
                {discountPercent && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    -{discountPercent}% OFF
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition shadow-md ${
                    isWishlisted
                      ? "bg-red-50 text-red-600"
                      : "bg-white/80 hover:bg-white text-stone-700 hover:text-red-500"
                  }`}
                  aria-label="Wishlist"
                >
                  <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        activeImage === img ? "border-black shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="Gallery item" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Information & Purchase Column */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    {product.category}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      ✓ In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-3">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-amber-500 text-sm">
                    {"★".repeat(Math.round(product.rating))}
                    {"☆".repeat(5 - Math.round(product.rating))}
                  </div>
                  <span className="text-xs font-bold text-stone-900">{product.rating}</span>
                  <span className="text-xs text-stone-400">({product.reviewCount} verified reviews)</span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                  <span className="text-3xl font-extrabold text-stone-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-stone-400 text-base line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {discountPercent && (
                    <span className="text-xs font-bold text-emerald-600">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Color Picker */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Color: <strong className="capitalize text-stone-600 font-normal">{selectedColor}</strong>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`text-xs font-medium px-4 py-2 rounded-xl border transition ${
                            selectedColor === color
                              ? "border-black bg-black text-white shadow-sm"
                              : "border-stone-200 text-stone-700 hover:border-stone-400 bg-white"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Picker */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Select Size: <strong className="capitalize text-stone-600 font-normal">{selectedSize}</strong>
                      </span>
                      <span className="text-xs text-stone-400 underline cursor-pointer">Size Guide</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-12 text-xs font-medium px-4 py-2.5 rounded-xl border transition ${
                            selectedSize === sz
                              ? "border-black bg-black text-white shadow-sm"
                              : "border-stone-200 text-stone-700 hover:border-stone-400 bg-white"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-8">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block mb-2">
                    Quantity
                  </span>
                  <div className="flex items-center border border-stone-200 rounded-xl w-max bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 rounded-l-xl font-bold transition"
                    >
                      -
                    </button>
                    <span className="px-5 py-2 text-xs font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 rounded-r-xl font-bold transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-stone-900 hover:bg-black text-white font-semibold py-3.5 px-6 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-sm"
                  >
                    Buy Now
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-3">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Free delivery over $75
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    30-day effortless return
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Product Details / Reviews */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 mb-16">
          <div className="flex border-b border-stone-200 gap-6 sm:gap-10 mb-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 text-sm font-bold transition border-b-2 ${
                activeTab === "description"
                  ? "border-black text-black"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              Description & Highlights
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-4 text-sm font-bold transition border-b-2 ${
                activeTab === "specs"
                  ? "border-black text-black"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              Material & Craftsmanship
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-sm font-bold transition border-b-2 ${
                activeTab === "reviews"
                  ? "border-black text-black"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              Customer Reviews ({productReviews.length})
            </button>
          </div>

          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="space-y-4 max-w-3xl text-sm text-stone-600 leading-relaxed">
              <p>{product.description}</p>
              <p>
                Every piece from ShopForge undergoes rigorous wear testing to ensure durability, structured fit, and luxurious tactile comfort through everyday life.
              </p>
            </div>
          )}

          {/* Specs Tab */}
          {activeTab === "specs" && (
            <div className="max-w-xl">
              <ul className="divide-y divide-stone-100 text-sm">
                {product.details?.map((item, idx) => (
                  <li key={idx} className="py-2.5 flex items-center gap-3 text-stone-700">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-10">
              {/* Reviews List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        {"★".repeat(rev.rating)}
                      </div>
                      <span className="text-[11px] text-stone-400">{rev.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 mb-3 leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <p className="text-xs font-bold text-stone-900">{rev.author}</p>
                  </div>
                ))}
              </div>

              {/* Submit Review Form */}
              <div className="pt-8 border-t border-stone-100 max-w-xl">
                <h3 className="text-base font-bold text-stone-900 mb-4">Leave a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Rating</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    >
                      <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                      <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                      <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Your Feedback</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your thoughts on the sizing, material quality, and fit..."
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-stone-800 transition"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
