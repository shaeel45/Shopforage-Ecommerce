import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroCarousel from "../components/HeroCarousel";
import ProductCard from "../components/ProductCard";
import { products as fallbackProducts, categories, reviews } from "../data/products";
import { useToast } from "../context/ToastContext";
import { fetchProducts } from "../api";

export default function Homepage() {
  const { addToast } = useToast();
  const [productList, setProductList] = useState(fallbackProducts);

  useEffect(() => {
    fetchProducts({ all: true })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setProductList(res.data);
        }
      })
      .catch((err) => {
        console.warn("Homepage products fetch fallback:", err);
      });
  }, []);

  const trendingProducts = productList.filter((p) => p.isTrending || p.featured).slice(0, 8);
  const newArrivals = productList.filter((p) => p.isNew).slice(0, 4);

  const copyCoupon = (code) => {
    navigator.clipboard?.writeText(code);
    addToast(`Coupon code "${code}" copied to clipboard!`, "success");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Curated Wardrobe
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-stone-900 hover:text-stone-600 inline-flex items-center gap-1 mt-2 md:mt-0 transition underline underline-offset-4"
          >
            Explore all items →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories
            .filter((c) => c.id !== "all")
            .map((cat) => (
              <Link
                key={cat.id}
                to={`/products/${cat.id}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-900 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 text-white">
                  <h3 className="text-xl font-bold tracking-tight mb-1">{cat.name}</h3>
                  <p className="text-xs text-stone-300 line-clamp-2 mb-3">
                    {cat.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:translate-x-1 transition-transform">
                    Explore collection →
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* Trending / Bestsellers Section */}
      <section className="bg-white py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Customer Favorites
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
                Trending Essentials
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-stone-900 hover:text-stone-600 inline-flex items-center gap-1 mt-2 md:mt-0 transition underline underline-offset-4"
            >
              View all products ({products.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner with Coupon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4 text-center lg:text-left z-10">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400 text-stone-950">
              Limited Time Promo
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Get 10% Off Your Entire Order
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              Use promotional code at checkout to receive an extra discount on all newly curated collections. Free domestic shipping included over $75.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start items-center">
              <button
                onClick={() => copyCoupon("SHOPFORGE10")}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-mono font-bold text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
                title="Click to copy"
              >
                <span>SHOPFORGE10</span>
                <span className="text-xs text-amber-300">📋 Copy</span>
              </button>
              <Link
                to="/products"
                className="bg-white hover:bg-stone-100 text-stone-900 font-bold text-sm px-6 py-2.5 rounded-xl transition shadow-md"
              >
                Shop Now
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-96 rounded-2xl overflow-hidden shadow-lg aspect-[4/3] bg-stone-800 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80"
              alt="ShopForge Boutique"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="bg-stone-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Just Dropped
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
                  New Arrivals
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-stone-900 hover:text-stone-600 inline-flex items-center gap-1 mt-2 md:mt-0 transition underline underline-offset-4"
              >
                Explore all new items →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Testimonials */}
      <section className="bg-white py-16 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Real Experiences
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
              Loved by Discerning Shoppers
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2">
              Over 25,000 orders shipped with an average 4.9-star rating across all product lines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-stone-50 p-6 rounded-2xl border border-stone-200/70 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {"★".repeat(rev.rating)}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic mb-4">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{rev.author}</h4>
                    <p className="text-[10px] text-stone-500">{rev.role}</p>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}