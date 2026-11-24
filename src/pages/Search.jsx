import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { searchProducts, fetchProducts } from "../api";

const SEARCH_LIMIT = 48;
const FEATURED_LIMIT = 4;

const EMPTY_SUGGESTIONS = { products: [], categories: [], keywords: [] };
const EMPTY_PAYLOAD = { term: "", items: [], total: 0, suggestions: EMPTY_SUGGESTIONS };

const TRENDING_TERMS = ["Oxford", "Selvedge", "Sneakers", "Flannel", "Derby", "Chino"];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  // Input state follows the URL, but without an effect: when the URL changes
  // (for example the header search submits a new term) the input is adjusted
  // during render, which is the pattern React recommends for derived state.
  const [lastQueryParam, setLastQueryParam] = useState(queryParam);
  const [searchTerm, setSearchTerm] = useState(queryParam);
  if (lastQueryParam !== queryParam) {
    setLastQueryParam(queryParam);
    setSearchTerm(queryParam);
  }

  const term = searchTerm.trim();
  const hasQuery = term.length > 0;

  const [payload, setPayload] = useState(EMPTY_PAYLOAD);
  const [featured, setFeatured] = useState([]);

  // Debounced ranked search against GET /products/search. Each response is
  // stored with the term it belongs to, so a slow response for an old term is
  // never rendered under the current one.
  useEffect(() => {
    if (!term) return undefined;

    let active = true;
    const timer = setTimeout(() => {
      searchProducts({ q: term, limit: SEARCH_LIMIT, suggestionLimit: 6 })
        .then((res) => {
          if (!active) return;
          setPayload({
            term,
            items: res.data || [],
            total: Number(res.total) || 0,
            suggestions: res.suggestions || EMPTY_SUGGESTIONS,
          });
        })
        .catch((err) => {
          if (!active) return;
          console.error("Search error:", err);
          setPayload({ term, items: [], total: 0, suggestions: EMPTY_SUGGESTIONS });
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [term]);

  // Featured fallback shown before a query is typed.
  useEffect(() => {
    let active = true;

    fetchProducts({ limit: FEATURED_LIMIT, sortBy: "featured" })
      .then((res) => {
        if (active) setFeatured(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load featured products:", err);
      });

    return () => {
      active = false;
    };
  }, []);

  const current = payload.term === term ? payload : null;
  const results = current?.items || [];
  const total = current?.total || 0;
  const suggestions = current?.suggestions || EMPTY_SUGGESTIONS;
  const loading = hasQuery && !current;

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Keep the URL in sync with what was typed (spaces included) so typing
    // "oxford " does not get rewritten mid-keystroke; the request itself uses
    // the trimmed term.
    if (value.trim()) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const quickTerms = suggestions.keywords.length > 0 ? suggestions.keywords.slice(0, 6) : TRENDING_TERMS;

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
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-stone-500">
            <span>{suggestions.keywords.length > 0 ? "Related:" : "Trending searches:"}</span>
            {quickTerms.map((quickTerm) => (
              <button
                key={quickTerm}
                onClick={() => handleSearchChange(quickTerm)}
                className="bg-white px-3 py-1 rounded-full border border-stone-200 hover:border-stone-400 font-medium transition"
              >
                {quickTerm}
              </button>
            ))}
          </div>

          {suggestions.categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-xs text-stone-500">
              <span>Categories:</span>
              {suggestions.categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="bg-stone-900 text-white px-3 py-1 rounded-full hover:bg-black font-medium transition capitalize"
                >
                  {category.name} <span className="text-stone-400">({category.count})</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {hasQuery ? (
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-6 pb-3 border-b border-stone-200">
              <span>
                {loading ? (
                  "Searching…"
                ) : (
                  <>
                    Found <strong>{total}</strong> results for "<strong>{term}</strong>"
                  </>
                )}
              </span>
              {results.length > 0 && (
                <Link to="/products" className="text-black font-semibold hover:underline">
                  View full catalog →
                </Link>
              )}
            </div>

            {!loading && results.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto my-6 shadow-sm">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">No matches found</h3>
                <p className="text-xs text-stone-500 mb-6">
                  We couldn't find any products matching "{term}". Try another search term or browse our categories.
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
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
