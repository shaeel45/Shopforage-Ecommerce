import React from "react";
import { Link } from "react-router-dom";
import { products, promoCodes } from "../data/products";
import ProductCard from "../components/ProductCard";
import { useToast } from "../context/ToastContext";

export default function Offers() {
  const { addToast } = useToast();

  const discountedProducts = products.filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  );

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    addToast(`Coupon code "${code}" copied to clipboard!`, "success");
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="rounded-3xl bg-stone-900 text-white p-8 sm:p-12 mb-12 text-center max-w-4xl mx-auto shadow-xl">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400 text-stone-950 inline-block mb-3">
            Exclusive Promotions
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Curated Seasonal Offers
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed mb-6">
            Take advantage of limited-time discounts across our handcrafted collections. Apply verified promotional codes directly at checkout.
          </p>
        </div>

        {/* Promo Codes Grid */}
        <div className="mb-14">
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight mb-6">
            Active Coupon Codes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promoCodes.map((promo) => (
              <div
                key={promo.code}
                className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-6 shadow-sm flex flex-col justify-between hover:border-black transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-extrabold text-stone-900">
                      {promo.discountPercent}% OFF
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-4">{promo.description}</p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-stone-100 px-3 py-1.5 rounded-lg text-stone-800">
                    {promo.code}
                  </span>
                  <button
                    onClick={() => copyCode(promo.code)}
                    className="text-xs font-bold text-black hover:text-stone-600 underline"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discounted Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Sale Items ({discountedProducts.length})
            </h2>
            <Link to="/products" className="text-xs font-bold text-stone-900 hover:underline">
              View All Products →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {discountedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
