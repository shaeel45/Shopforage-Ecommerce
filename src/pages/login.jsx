import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/products";

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast("Please provide your email and password.", "error");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(email, password);
      setLoading(false);
      addToast("Welcome back to ShopForge!", "success");
      navigate(from, { replace: true });
    }, 600);
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      demoLogin();
      setLoading(false);
      addToast("Logged in as Demo Customer (Alex Morgan)!", "success");
      navigate(from, { replace: true });
    }, 500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-xl mx-auto mb-3">
            S
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Welcome to ShopForge
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Sign in to manage your orders, bag, and saved wishlist.
          </p>
        </div>

        {/* Demo Login Quick Access Button */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center">
          <p className="text-[11px] text-stone-500 mb-2">Want to test the platform right away?</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm"
          >
            ⚡ 1-Click Demo Login (Alex Morgan)
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-stone-200"></div>
          <span className="flex-shrink mx-3 text-[11px] text-stone-400 uppercase font-semibold">
            Or sign in with email
          </span>
          <div className="flex-grow border-t border-stone-200"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-stone-700">Password</label>
              <a href="#" className="text-[11px] text-stone-400 hover:text-black underline">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 pr-10 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-stone-800 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In to Account"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500">
          Don't have an account yet?{" "}
          <Link to="/signup" state={location.state} className="text-black font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}