import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeTerms: true
  });
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/products";

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.password) {
      addToast("Please fill in all required fields.", "error");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      signup(formData);
      setLoading(false);
      addToast("Welcome to ShopForge! Your account is created.", "success");
      navigate(from, { replace: true });
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-10 space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-xl mx-auto mb-3">
            S
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Join the ShopForge community for seamless ordering and member benefits.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">First Name</label>
              <input
                type="text"
                required
                name="firstName"
                placeholder="First"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Last"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Password</label>
            <input
              type="password"
              required
              name="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer pt-1">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              className="rounded text-black focus:ring-0"
            />
            <span>I agree to the Terms of Service & Privacy Policy</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-stone-800 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500">
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="text-black font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}