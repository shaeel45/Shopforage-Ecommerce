import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, discountAmount, shippingFee, tax, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { placeOrder } = useOrders();
  const { addToast } = useToast();

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || user?.fullname || "Alex Morgan",
    email: user?.email || "alex.morgan@shopforge.com",
    phone: "+1 (555) 234-5678",
    street: user?.address?.street || "450 Broadway Ave, Apt 4B",
    city: user?.address?.city || "New York",
    state: user?.address?.state || "NY",
    postalCode: user?.address?.postalCode || "10013",
    country: "United States",
    cardNumber: "•••• •••• •••• 4242",
    cardExp: "12/28",
    cardCvc: "888"
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || user.fullname || prev.fullName,
        email: user.email || prev.email,
        street: user?.address?.street || prev.street,
        city: user?.address?.city || prev.city,
        state: user?.address?.state || prev.state,
        postalCode: user?.address?.postalCode || prev.postalCode,
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedShippingCost = shippingMethod === "express" ? 14.99 : shippingFee;
  const finalTotal = subtotal - discountAmount + selectedShippingCost + tax;

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      addToast("Your cart is empty!", "error");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const createdOrder = placeOrder({
        items: [...cart],
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        shippingMethod: shippingMethod === "express" ? "Priority Express ($14.99)" : "Standard Shipping",
        paymentMethod:
          paymentMethod === "card"
            ? `Credit Card (${formData.cardNumber.slice(-4)})`
            : paymentMethod === "paypal"
            ? "PayPal"
            : "Cash on Delivery",
        subtotal,
        discount: discountAmount,
        shippingFee: selectedShippingCost,
        tax,
        total: finalTotal
      });

      clearCart();
      setIsSubmitting(false);
      addToast("Order placed successfully!", "success");
      navigate(`/order-success/${createdOrder.id}`);
    }, 1200);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
          <h2 className="text-2xl font-extrabold text-stone-900 mb-2">No Items to Checkout</h2>
          <p className="text-xs text-stone-500 mb-6">
            Please add at least one item to your shopping bag before proceeding.
          </p>
          <Link
            to="/products"
            className="block w-full bg-black text-white font-bold py-3 px-6 rounded-xl text-xs hover:bg-stone-800 transition"
          >
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 text-2xl">
            🔒
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 mb-2">Sign In to Complete Checkout</h2>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            Please log in to finalize your purchase. Your shopping cart ({cart.length} item{cart.length > 1 ? "s" : ""}) remains safely saved in your browser!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/login", { state: { from: { pathname: "/checkout" } } })}
              className="block w-full bg-black text-white font-bold py-3.5 px-6 rounded-xl text-xs hover:bg-stone-800 transition shadow-md"
            >
              Sign In to Continue
            </button>
            <Link
              to="/cart"
              className="block w-full bg-stone-100 text-stone-700 font-semibold py-3 px-6 rounded-xl text-xs hover:bg-stone-200 transition"
            >
              Review Shopping Bag
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Checkout</h1>
          <p className="text-xs text-stone-500 mt-1">
            Please complete your shipping address and payment details below.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-stone-900">Shipping Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit, etc."
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">State / Prov</label>
                    <input
                      type="text"
                      required
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">ZIP / Postal</label>
                    <input
                      type="text"
                      required
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Germany</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-stone-900">Delivery Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                    shippingMethod === "standard"
                      ? "border-black bg-stone-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="text-black focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Standard Delivery</p>
                      <p className="text-[11px] text-stone-500">3 - 5 business days</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                  </span>
                </label>

                <label
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                    shippingMethod === "express"
                      ? "border-black bg-stone-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={shippingMethod === "express"}
                      onChange={() => setShippingMethod("express")}
                      className="text-black focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Priority Express</p>
                      <p className="text-[11px] text-stone-500">1 - 2 business days</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-stone-900">$14.99</span>
                </label>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-base font-bold text-stone-900">Payment Option</h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === "card"
                      ? "border-black bg-stone-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="text-black focus:ring-0"
                    />
                    <span className="text-xs font-bold text-stone-900">Credit or Debit Card</span>
                  </div>
                  <span className="text-xs text-stone-400">💳 Visa, MC, Amex</span>
                </label>

                {paymentMethod === "card" && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">Expiration Date</label>
                        <input
                          type="text"
                          name="cardExp"
                          value={formData.cardExp}
                          onChange={handleInputChange}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">CVC / CVV</label>
                        <input
                          type="text"
                          name="cardCvc"
                          value={formData.cardCvc}
                          onChange={handleInputChange}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <label
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === "paypal"
                      ? "border-black bg-stone-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={() => setPaymentMethod("paypal")}
                      className="text-black focus:ring-0"
                    />
                    <span className="text-xs font-bold text-stone-900">PayPal Checkout</span>
                  </div>
                  <span className="text-xs text-blue-600 font-bold">PayPal</span>
                </label>

                <label
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === "cod"
                      ? "border-black bg-stone-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="text-black focus:ring-0"
                    />
                    <span className="text-xs font-bold text-stone-900">Cash on Delivery (COD)</span>
                  </div>
                  <span className="text-xs text-stone-400">💵 Pay upon receipt</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6 sticky top-24">
              <h2 className="text-base font-extrabold text-stone-900 tracking-tight pb-3 border-b border-stone-100">
                Order Review ({cart.length} items)
              </h2>

              {/* Items preview list */}
              <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-stone-500">
                        Qty: {item.quantity} | {item.selectedSize}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-stone-900">
                    {selectedShippingCost === 0 ? "FREE" : `$${selectedShippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-stone-900">${tax.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline font-extrabold text-stone-900">
                  <span className="text-sm">Total Due</span>
                  <span className="text-2xl">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-900 hover:bg-black text-white font-bold py-4 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <span>→</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-stone-400 text-center leading-relaxed">
                By placing your order, you agree to ShopForge's Terms of Sale and Privacy Policy. All payments are encrypted.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
