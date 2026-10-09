import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const [couponInput, setCouponInput] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    cart,
    itemCount,
    subtotal,
    freeShippingThreshold,
    shippingFee,
    discountAmount,
    tax,
    total,
    appliedPromo,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyPromo,
    removePromo
  } = useCart();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyPromo(couponInput);
      setCouponInput("");
    }
  };

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5 text-2xl text-stone-400">
            🛒
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mb-8 leading-relaxed">
            Looks like you haven't added anything to your cart yet. Discover our latest wardrobe arrivals and find your essentials.
          </p>
          <Link
            to="/products"
            className="block w-full bg-black text-white font-bold py-3.5 px-6 rounded-xl text-xs hover:bg-stone-800 transition shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Shopping Bag</h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              You have <strong>{itemCount}</strong> items in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-800 underline self-start sm:self-auto"
          >
            Clear Entire Bag
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-2">
            {amountNeededForFreeShipping === 0 ? (
              <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                🎉 Congratulations! You have unlocked Free Domestic Shipping.
              </span>
            ) : (
              <span>
                Add <strong className="text-black">${amountNeededForFreeShipping.toFixed(2)}</strong> more to unlock <strong>Free Shipping</strong>!
              </span>
            )}
            <span className="text-stone-500 text-[11px]">{freeShippingPercent}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                freeShippingPercent >= 100 ? "bg-emerald-500" : "bg-black"
              }`}
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 divide-y divide-stone-100">
            {cart.map((item, idx) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      to={`/product/${item.id}`}
                      className="font-bold text-stone-900 text-sm sm:text-base hover:underline line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                      {item.selectedSize && (
                        <span>Size: <strong className="text-stone-700">{item.selectedSize}</strong></span>
                      )}
                      {item.selectedColor && (
                        <span>Color: <strong className="text-stone-700">{item.selectedColor}</strong></span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-stone-900 mt-1">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)
                      }
                      className="px-3 py-1.5 text-stone-600 hover:text-black font-bold text-xs"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)
                      }
                      className="px-3 py-1.5 text-stone-600 hover:text-black font-bold text-xs"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-20">
                    <span className="text-sm font-extrabold text-stone-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.id, item.selectedSize, item.selectedColor)
                    }
                    className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-50 transition"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-extrabold text-stone-900 tracking-tight pb-3 border-b border-stone-100">
                Order Summary
              </h2>

              {/* Promo Form */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">Promotional Coupon</label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-800">{appliedPromo.code}</span>
                      <span className="text-emerald-700">({appliedPromo.discountPercent}% OFF)</span>
                    </div>
                    <button
                      onClick={removePromo}
                      className="text-emerald-700 hover:text-emerald-900 font-bold underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Try code SHOPFORGE10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full text-xs uppercase font-mono p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                    />
                    <button
                      type="submit"
                      className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-stone-800 transition shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-3 text-xs text-stone-600 pt-3 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedPromo.discountPercent}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-stone-900">
                    {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-stone-900">${tax.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-sm font-extrabold text-stone-900">
                  <span>Estimated Total</span>
                  <span className="text-xl">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login", { state: { from: { pathname: "/checkout" } } });
                  } else {
                    navigate("/checkout");
                  }
                }}
                className="w-full bg-black hover:bg-stone-800 text-white font-bold py-4 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                <span>{isAuthenticated ? "Proceed to Checkout" : "Sign In to Checkout"}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              {!isAuthenticated && (
                <p className="text-[11px] text-center text-stone-400 mt-1">
                  Your cart items will stay safely saved in your browser.
                </p>
              )}

              <div className="text-center">
                <Link
                  to="/products"
                  className="text-xs font-semibold text-stone-500 hover:text-black underline"
                >
                  or Continue Browsing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
