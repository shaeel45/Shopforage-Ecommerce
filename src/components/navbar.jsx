import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
        setCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setMenuOpen(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition py-1 px-2 rounded-md ${
      isActive
        ? "text-black font-semibold"
        : "text-stone-600 hover:text-black hover:bg-stone-50"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/95 backdrop-blur-md transition-all">
      {/* Top Banner */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <span>✨ Spring Season: Use code <strong className="text-white font-bold underline">SHOPFORGE10</strong> for 10% off</span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">Free Shipping on orders over $75</span>
      </div>

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" ref={dropdownRef}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-lg group-hover:bg-stone-800 transition">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900">
            Shop<span className="text-stone-500">Forge</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Shop
          </NavLink>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1 text-sm font-medium text-stone-600 transition hover:text-black py-1 px-2 rounded-md hover:bg-stone-50"
            >
              Categories
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
                  categoriesOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {categoriesOpen && (
              <div className="absolute left-0 top-10 w-48 rounded-xl border border-stone-100 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  to="/products/shirts"
                  className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 font-medium"
                  onClick={() => setCategoriesOpen(false)}
                >
                  👕 Shirts & Tops
                </Link>
                <Link
                  to="/products/pants"
                  className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 font-medium"
                  onClick={() => setCategoriesOpen(false)}
                >
                  👖 Pants & Chinos
                </Link>
                <Link
                  to="/products/shoes"
                  className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 font-medium"
                  onClick={() => setCategoriesOpen(false)}
                >
                  👞 Footwear & Shoes
                </Link>
                <div className="my-1 border-t border-stone-100" />
                <Link
                  to="/products"
                  className="block rounded-lg px-3 py-2 text-xs text-stone-500 hover:bg-stone-50 font-semibold"
                  onClick={() => setCategoriesOpen(false)}
                >
                  View All Collections →
                </Link>
              </div>
            )}
          </div>

          <NavLink to="/offers" className={navLinkClass}>
            Deals & Offers
          </NavLink>

          <NavLink to="/orders" className={navLinkClass}>
            Orders
          </NavLink>

          <NavLink to="/about" className={navLinkClass}>
            About Us
          </NavLink>
        </div>

        {/* Desktop Action Icons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Search Trigger / Form */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 text-xs bg-stone-100 border border-stone-300 rounded-full py-2 pl-8 pr-7 focus:outline-none focus:border-stone-500"
              />
              <svg className="w-4 h-4 text-stone-400 absolute left-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
              </svg>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-stone-600 hover:text-black hover:bg-stone-100 rounded-full transition"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
              </svg>
            </button>
          )}

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative p-2 text-stone-600 hover:text-black hover:bg-stone-100 rounded-full transition"
            aria-label={`Wishlist with ${wishlistCount} items`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="relative p-2 text-stone-600 hover:text-black hover:bg-stone-100 rounded-full transition"
            aria-label={`Cart with ${itemCount} items`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-stone-100 transition"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-stone-300 object-cover"
                />
                <span className="text-xs font-semibold text-stone-800 max-w-[100px] truncate">
                  {user.name}
                </span>
                <svg className="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-11 w-48 rounded-xl border border-stone-100 bg-white p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs font-semibold text-stone-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block rounded-lg px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Account Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block rounded-lg px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block rounded-lg px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Saved Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Header Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/search" className="p-2 text-stone-700 hover:bg-stone-100 rounded-full">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            </svg>
          </Link>

          <Link to="/wishlist" className="relative p-2 text-stone-700 hover:bg-stone-100 rounded-full">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative p-2 text-stone-700 hover:bg-stone-100 rounded-full">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-stone-700 hover:bg-stone-100 rounded-md"
            aria-label="Toggle Navigation"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="border-t border-stone-200 bg-white px-5 py-4 md:hidden animate-in slide-in-from-top-3 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-stone-100 border border-stone-300 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-stone-500"
            />
            <svg className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            </svg>
          </form>

          <div className="flex flex-col gap-1">
            <NavLink to="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-stone-100">
              Home
            </NavLink>
            <NavLink to="/products" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-stone-100">
              Shop All Products
            </NavLink>
            <div className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
              Categories
            </div>
            <NavLink to="/products/shirts" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100">
              👕 Shirts & Tops
            </NavLink>
            <NavLink to="/products/pants" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100">
              👖 Pants & Chinos
            </NavLink>
            <NavLink to="/products/shoes" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100">
              👞 Footwear & Shoes
            </NavLink>
            <NavLink to="/offers" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-stone-100">
              Deals & Offers
            </NavLink>
            <NavLink to="/orders" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-stone-100">
              Order History
            </NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-stone-100">
              About ShopForge
            </NavLink>

            <div className="pt-3 border-t border-stone-100 mt-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">{user.name}</p>
                      <p className="text-[10px] text-stone-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl bg-stone-900 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}