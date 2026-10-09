import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function QuickViewModal({ product, onClose }) {
  const [selectedSize, setSelectedSize] = useState(product?.sizes ? product.sizes[0] : null);
  const [selectedColor, setSelectedColor] = useState(product?.colors ? product.colors[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product?.image);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const ratingNum =
    typeof product.rating === "object" && product.rating !== null
      ? Number(product.rating.rate ?? product.rating.average ?? 5.0)
      : Number(product.rating) || 5.0;
  const reviewCount =
    typeof product.rating === "object" && product.rating !== null && product.rating.count !== undefined
      ? Number(product.rating.count)
      : Array.isArray(product.review)
      ? product.review.length
      : Number(product.reviewCount) || 0;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-100 max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-stone-100 text-stone-600 transition shadow-sm"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 bg-stone-50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-stone-200">
          <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-stone-100">
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                    activeImage === img ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[70vh] md:max-h-[90vh]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {product.category}
              </span>
              {product.isNew && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  NEW
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-stone-900 mb-2">{product.name}</h2>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center text-amber-500">
                {"★".repeat(Math.min(5, Math.max(0, Math.round(ratingNum))))}
                {"☆".repeat(Math.max(0, 5 - Math.min(5, Math.max(0, Math.round(ratingNum)))))}
              </div>
              <span className="text-xs text-stone-500">
                {ratingNum.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-stone-900">${product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <span className="text-stone-400 line-through text-sm">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 line-clamp-3 mb-5 leading-relaxed">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-medium text-stone-800 block mb-1.5">
                  Color: <span className="text-stone-500">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`text-xs px-3 py-1.5 rounded-md border font-medium transition ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-stone-200 text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-medium text-stone-800 block mb-1.5">
                  Size: <span className="text-stone-500">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`text-xs px-3 py-1.5 rounded-md border font-medium transition min-w-10 ${
                        selectedSize === sz
                          ? "border-black bg-black text-white"
                          : "border-stone-200 text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-5">
              <label className="text-xs font-medium text-stone-800 block mb-1.5">Quantity</label>
              <div className="flex items-center border border-stone-200 rounded-lg w-max">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  -
                </button>
                <span className="px-4 py-1 text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-stone-100">
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black hover:bg-stone-800 text-white text-sm font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition ${
                  isWishlisted
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-stone-200 text-stone-600 hover:border-stone-400"
                }`}
                title="Wishlist"
              >
                <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="block text-center text-xs font-semibold text-stone-600 hover:text-black py-2 underline"
            >
              View Full Product Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
