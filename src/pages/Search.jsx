import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../api";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    let active = true;
    setLoading(true);

    fetchProducts({ search: searchTerm.trim(), limit: 50 })
      .then((res) => {
        if (!active) return;
        setResults(res.data || []);
      })
      .catch((err) => {
        console.error("Search error:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchTerm]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const popularSearches = ["Oxford", "Selvedge", "Sneakers", "Flannel", "Derby", "Chino"];

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-3">
            Search ShopForge
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mb-6">
            Find items by keyword, fabric, category, or color.
          </p>

          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="Search by keyword, e.g. Oxford, Linen, Denim..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-sm bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-10 shadow-sm focus:outline-none focus:border-stone-400"
            />
            <svg
              className="w-5 h-5 text-stone-400 absolute left-4 top-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-4 top-4 text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-stone-500">
            <span>Trending searches:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleSearchChange(term)}
                className="bg-white px-3 py-1 rounded-full border border-stone-200 hover:border-stone-400 font-medium transition"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {searchTerm.trim() ? (
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-6 pb-3 border-b border-stone-200">
              <span>
                Found <strong>{results.length}</strong> results for "<strong>{searchTerm}</strong>"
              </span>
              {results.length > 0 && (
                <Link to="/products" className="text-black font-semibold hover:underline">
                  View full catalog →
                </Link>
              )}
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto my-6 shadow-sm">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">No matches found</h3>
                <p className="text-xs text-stone-500 mb-6">
                  We couldn't find any products matching "{searchTerm}". Try another search term or browse our categories.
                </p>
                <Link
                  to="/products"
                  className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-stone-800 transition"
                >
                  Browse All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-12">
            <h2 className="text-base font-bold text-stone-900 mb-6 text-center">
              Popular Featured Items
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
