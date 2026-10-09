import React from "react";
import { useParams, Link } from "react-router-dom";
import { useOrders } from "../context/OrderContext";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { getOrder } = useOrders();
  const order = getOrder(orderId);

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-12 text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">
            ✓
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Payment Confirmed
          </span>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-3 mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            Your order has been received and is currently being prepared by our artisan team. A confirmation receipt has been sent to your email.
          </p>

          <div className="bg-stone-50 rounded-2xl p-4 my-6 flex flex-wrap items-center justify-around gap-4 text-xs">
            <div>
              <span className="text-stone-400 block text-[11px]">Order Number</span>
              <strong className="text-stone-900 font-mono text-sm">{order?.id || orderId}</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Date Placed</span>
              <strong className="text-stone-900">{order?.date || new Date().toISOString().split("T")[0]}</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Tracking Number</span>
              <strong className="text-stone-900 font-mono">{order?.trackingNumber || "TRK8291049281"}</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Estimated Delivery</span>
              <strong className="text-emerald-700 font-bold">3 - 5 Business Days</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/orders"
              className="bg-black text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-stone-800 transition"
            >
              View Order History
            </Link>
            <Link
              to="/products"
              className="bg-stone-100 text-stone-800 text-xs font-bold px-6 py-3 rounded-xl hover:bg-stone-200 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Details Receipt */}
        {order && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-extrabold text-stone-900 pb-3 border-b border-stone-100">
              Receipt Breakdown
            </h2>

            {/* Items */}
            <div className="divide-y divide-stone-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4 first:pt-0">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        Qty: {item.quantity} {item.selectedSize && `| Size: ${item.selectedSize}`} {item.selectedColor && `| Color: ${item.selectedColor}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Shipping & Payment summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-xs">
              <div>
                <h3 className="font-bold text-stone-900 mb-1">Delivering To:</h3>
                <p className="text-stone-600 leading-relaxed">
                  {order.shippingAddress?.fullName}<br />
                  {order.shippingAddress?.street}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
                  {order.shippingAddress?.country}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-stone-900 mb-1">Payment & Shipping:</h3>
                <p className="text-stone-600 leading-relaxed">
                  Method: {order.paymentMethod}<br />
                  Delivery: {order.shippingMethod}<br />
                  Total Charged: <strong className="text-stone-900">${order.total?.toFixed(2)}</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
