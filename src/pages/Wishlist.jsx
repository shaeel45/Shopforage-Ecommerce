import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5 text-2xl">
            ♡
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mb-8 leading-relaxed">
            Keep track of items you love by tapping the heart icon on any product card or details page.
          </p>
          <Link
            to="/products"
            className="block w-full bg-black text-white font-bold py-3.5 px-6 rounded-xl text-xs hover:bg-stone-800 transition shadow-md"
          >
            Discover Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Saved Items</h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              You have <strong>{wishlist.length}</strong> items in your wishlist
            </p>
          </div>
          <button
            onClick={clearWishlist}
            className="text-xs font-semibold text-red-600 hover:text-red-800 underline"
          >
            Clear Wishlist
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-stone-100">
                <Link to={`/product/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-stone-600 hover:text-red-600 shadow-sm transition"
                  title="Remove from wishlist"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <Link
                    to={`/product/${item.id}`}
                    className="font-semibold text-stone-900 text-sm hover:underline line-clamp-1 mb-2"
                  >
                    {item.name}
                  </Link>
                  <div className="text-sm font-bold text-stone-900">
                    ${item.price.toFixed(2)}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="flex-1 bg-black hover:bg-stone-800 text-white text-xs font-bold py-2 rounded-xl transition"
                  >
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
