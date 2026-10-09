import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { categories } from "../data/products";
import { fetchProducts } from "../api";

export default function Products({ defaultCategory = "all" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || defaultCategory;

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(250);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination State
  const [productsList, setProductsList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state if categoryParam changes
  useEffect(() => {
    if (defaultCategory !== "all") {
      setSelectedCategory(defaultCategory);
      setPage(1);
    } else if (categoryParam) {
      setSelectedCategory(categoryParam);
      setPage(1);
    }
  }, [categoryParam, defaultCategory]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchProducts({
      page,
      limit,
      category: selectedCategory,
      search: searchQuery,
      sortBy,
      maxPrice,
      inStock: inStockOnly,
    })
      .then((res) => {
        if (!active) return;
        setProductsList(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.total || 0);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, sortBy, maxPrice, inStockOnly, searchQuery, page, limit]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
    if (defaultCategory === "all") {
      if (catId === "all") {
        searchParams.delete("category");
        setSearchParams(searchParams);
      } else {
        setSearchParams({ category: catId });
      }
    }
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSortBy("featured");
    setMaxPrice(250);
    setInStockOnly(false);
    setSearchQuery("");
    setPage(1);
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  const currentCategoryInfo = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title & Breadcrumb */}
        <div className="mb-8">
          <div className="text-xs text-stone-500 mb-2">
            <span>Home</span> / <span className="text-stone-900 font-medium">Catalog</span>
            {selectedCategory !== "all" && (
              <> / <span className="capitalize font-semibold text-black">{selectedCategory}</span></>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight capitalize">
            {currentCategoryInfo ? currentCategoryInfo.name : "All Products"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            {currentCategoryInfo?.description || "Browse our complete catalog of precision-crafted apparel and footwear."}
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search within catalog */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-8 focus:outline-none focus:border-stone-400"
            />
            <svg className="w-4 h-4 text-stone-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition ${
                  selectedCategory === cat.id
                    ? "bg-black text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-stone-200 text-stone-700 bg-stone-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:border-stone-400"
              >
                <option value="featured">Featured / Best Match</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Drops</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Layout (Sidebar Filters + Products Grid) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className={`lg:w-64 shrink-0 space-y-6 ${mobileFilterOpen ? "block" : "hidden lg:block"}`}>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Filter Products
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-stone-500 hover:text-black font-semibold underline"
                >
                  Reset All
                </button>
              </div>

              {/* Category Radio/List */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 mb-2">Category</h4>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 text-xs text-stone-600 hover:text-black cursor-pointer py-1"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.id}
                        onChange={() => handleCategoryChange(cat.id)}
                        className="text-black focus:ring-0"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-stone-800">Max Price</h4>
                  <span className="text-xs font-bold text-stone-900">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="250"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>$30</span>
                  <span>$250</span>
                </div>
              </div>

              {/* In Stock Only */}
              <div className="pt-3 border-t border-stone-100">
                <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-black focus:ring-0"
                  />
                  <span>In-stock items only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-4 px-1">
              <span>
                {totalItems > 0 ? (
                  <>
                    Showing <strong>{(page - 1) * limit + 1}</strong>–<strong>{Math.min(page * limit, totalItems)}</strong> of <strong>{totalItems}</strong> items
                  </>
                ) : (
                  <span>0 items found</span>
                )}
              </span>
              {(selectedCategory !== "all" || maxPrice < 250 || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-stone-700 hover:text-black underline font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 py-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse space-y-4">
                    <div className="aspect-square bg-stone-200 rounded-xl" />
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : productsList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto my-10">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4 text-xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">No products found</h3>
                <p className="text-xs text-stone-500 mb-6">
                  We couldn't find any products matching your selected filters. Try broadening your criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-stone-800 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {productsList.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
                    <span className="text-xs text-stone-500">
                      Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={page <= 1}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        ← Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => {
                        // Show first, last, and current +- 1
                        if (
                          num === 1 ||
                          num === totalPages ||
                          (num >= page - 1 && num <= page + 1)
                        ) {
                          return (
                            <button
                              key={num}
                              onClick={() => {
                                setPage(num);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`w-9 h-9 text-xs font-bold rounded-xl transition ${
                                page === num
                                  ? "bg-stone-900 text-white shadow-sm"
                                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        }
                        if (num === page - 2 || num === page + 2) {
                          return (
                            <span key={num} className="px-1 text-xs text-stone-400">
                              …
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() => {
                          setPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={page >= totalPages}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
