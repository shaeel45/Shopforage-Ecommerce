import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function Profile() {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const { orders } = useOrders();
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    postalCode: user?.address?.postalCode || "",
    country: user?.address?.country || "United States"
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center max-w-md w-full shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 mb-2">Please Sign In</h2>
          <p className="text-xs text-stone-500 mb-6">
            You need to be logged in to view your account profile and saved addresses.
          </p>
          <Link
            to="/login"
            className="block w-full bg-black text-white font-bold py-3 rounded-xl text-xs hover:bg-stone-800 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveAddress = (e) => {
    e.preventDefault();
    updateProfile({ address: addressForm });
    setIsEditingAddress(false);
    addToast("Address details saved successfully!", "success");
  };

  const handleSignOut = () => {
    logout();
    addToast("Signed out successfully", "info");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Account Profile</h1>
            <p className="text-xs text-stone-500 mt-1">
              Manage your personal information, delivery addresses, and preferences.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="self-start sm:self-auto bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-600 text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            Sign Out
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Link
            to="/orders"
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-black transition"
          >
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Total Orders
            </span>
            <div className="text-3xl font-extrabold text-stone-900">{orders.length}</div>
            <span className="text-xs text-stone-500 mt-2 block font-medium">View tracking history →</span>
          </Link>

          <Link
            to="/wishlist"
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-black transition"
          >
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Wishlist Items
            </span>
            <div className="text-3xl font-extrabold text-stone-900">{wishlistCount}</div>
            <span className="text-xs text-stone-500 mt-2 block font-medium">View saved items →</span>
          </Link>

          <Link
            to="/cart"
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-black transition"
          >
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Cart Items
            </span>
            <div className="text-3xl font-extrabold text-stone-900">{itemCount}</div>
            <span className="text-xs text-stone-500 mt-2 block font-medium">Review shopping bag →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
              Personal Information
            </h2>

            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-stone-200 object-cover"
              />
              <div>
                <h3 className="font-bold text-stone-900 text-lg">{user.name}</h3>
                <p className="text-xs text-stone-500">{user.email}</p>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Member since {user.joinedDate || "2026"}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">Default Shipping Address</h2>
              {!isEditingAddress && (
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs font-bold text-black hover:underline"
                >
                  Edit Address
                </button>
              )}
            </div>

            {isEditingAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-stone-800 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="bg-stone-100 text-stone-700 text-xs font-semibold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-xs text-stone-600 leading-relaxed">
                {user.address?.street ? (
                  <>
                    <p className="font-bold text-stone-900">{user.name}</p>
                    <p>{user.address.street}</p>
                    <p>
                      {user.address.city}, {user.address.state} {user.address.postalCode}
                    </p>
                    <p>{user.address.country}</p>
                  </>
                ) : (
                  <p className="text-stone-400 italic">No address saved yet. Click "Edit Address" to add one.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
