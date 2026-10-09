import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      addToast("Thanks for subscribing to ShopForge Insider!", "success");
      setEmail("");
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Complimentary Delivery</h4>
              <p className="text-xs text-stone-400">Free domestic shipping on orders over $75</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">30-Day Hassle-Free Returns</h4>
              <p className="text-xs text-stone-400">No questions asked return guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">End-to-End Secure Payment</h4>
              <p className="text-xs text-stone-400">256-bit encrypted checkout protection</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Dedicated Concierge</h4>
              <p className="text-xs text-stone-400">24/7 client care and styling advice</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-stone-900 flex items-center justify-center font-black text-lg">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Shop<span className="text-stone-400">Forge</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-400 max-w-sm">
              ShopForge crafts modern wardrobe essentials using responsibly sourced organic fibers, Japanese selvedge denim, and European leatherwork. Built for durability, tailored for life.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="pt-2">
              <label className="text-xs font-semibold text-white block mb-2">
                Join our newsletter for exclusive releases & 15% off
              </label>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white placeholder-stone-500 focus:outline-none focus:border-stone-400"
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-stone-200 text-stone-900 text-xs font-bold px-4 py-2.5 rounded-xl transition shrink-0"
                >
                  Join
                </button>
              </div>
            </form>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Shop</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/products" className="hover:text-white transition">All Products</Link>
              </li>
              <li>
                <Link to="/products/shirts" className="hover:text-white transition">Shirts & Tops</Link>
              </li>
              <li>
                <Link to="/products/pants" className="hover:text-white transition">Pants & Chinos</Link>
              </li>
              <li>
                <Link to="/products/shoes" className="hover:text-white transition">Shoes & Boots</Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition">Special Offers</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Client Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/orders" className="hover:text-white transition">Track Order</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition">Shopping Bag</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition">My Wishlist</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">Shipping & Returns</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">FAQ & Help</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition">Our Heritage</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">Sustainability</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">Artisan Workshops</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">Customer Account</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} ShopForge Studio, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Visa</span>
            <span>•</span>
            <span>Mastercard</span>
            <span>•</span>
            <span>American Express</span>
            <span>•</span>
            <span>PayPal</span>
            <span>•</span>
            <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}