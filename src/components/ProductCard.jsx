import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import QuickViewModal from "./QuickViewModal";

export default function ProductCard({ product }) {
  const [showQuickView, setShowQuickView] = useState(false);
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
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
  };

  return (
    <>
      <div className="group relative flex flex-col bg-white rounded-2xl border border-stone-100 hover:border-stone-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative w-full aspect-square bg-stone-100 overflow-hidden">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            {discountPercent && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                New
              </span>
            )}
            {product.isTrending && !product.isNew && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Hot
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${
              isWishlisted
                ? "bg-red-50 text-red-600 shadow-red-200"
                : "bg-white/80 hover:bg-white text-stone-600 hover:text-red-500 hover:scale-110"
            }`}
            aria-label="Wishlist"
          >
            <svg
              className="w-4 h-4"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Quick View Button overlay on hover */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
              }}
              className="w-full bg-white/90 hover:bg-white text-stone-900 text-xs font-semibold py-2 rounded-xl backdrop-blur-sm shadow-md transition"
            >
              Quick View
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1">
              <span>{product.category}</span>
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <span>★</span>
                <span className="text-stone-700 text-xs">{ratingNum.toFixed(1)}</span>
                <span className="text-stone-400 font-normal">({reviewCount})</span>
              </div>
            </div>

            <Link
              to={`/product/${product.id}`}
              className="block font-semibold text-stone-900 hover:text-stone-600 line-clamp-1 text-sm transition"
            >
              {product.name}
            </Link>
          </div>

          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-stone-900">${product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-stone-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 shadow-sm"
              aria-label={`Add ${product.name} to cart`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}
