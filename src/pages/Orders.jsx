import React from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../context/OrderContext";

export default function Orders() {
  const { orders } = useOrders();

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5 text-2xl text-stone-400">
            📦
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-2">
            No Orders Found
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mb-8 leading-relaxed">
            You haven't placed any orders with ShopForge yet. Once you do, you can track their status and history right here.
          </p>
          <Link
            to="/products"
            className="block w-full bg-black text-white font-bold py-3.5 px-6 rounded-xl text-xs hover:bg-stone-800 transition shadow-md"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Order History</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track, view receipts, and manage your recent ShopForge purchases.
          </p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-5 sm:p-6 bg-stone-50/80 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                      Order ID
                    </span>
                    <span className="font-mono font-bold text-stone-900">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                      Date Placed
                    </span>
                    <span className="font-semibold text-stone-800">{order.date}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                      Total Amount
                    </span>
                    <span className="font-bold text-stone-900">${order.total?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      order.status === "Delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "Shipped"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    ● {order.status}
                  </span>
                  <Link
                    to={`/order-success/${order.id}`}
                    className="text-stone-700 hover:text-black font-semibold underline text-xs"
                  >
                    View Receipt
                  </Link>
                </div>
              </div>

              {/* Status Visual Tracker */}
              <div className="px-6 py-4 bg-stone-50/30 border-b border-stone-100">
                <div className="flex items-center justify-between max-w-md mx-auto text-[11px] font-semibold text-stone-600">
                  <div className="flex flex-col items-center">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs mb-1">
                      ✓
                    </span>
                    <span>Confirmed</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-emerald-500 mx-2" />
                  <div className="flex flex-col items-center">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${
                        order.status === "Shipped" || order.status === "Delivered"
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-400 text-stone-950 font-bold"
                      }`}
                    >
                      {order.status === "Processing" ? "●" : "✓"}
                    </span>
                    <span>Processing</span>
                  </div>
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      order.status === "Delivered" ? "bg-emerald-500" : "bg-stone-200"
                    }`}
                  />
                  <div className="flex flex-col items-center">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${
                        order.status === "Delivered"
                          ? "bg-emerald-500 text-white"
                          : "bg-stone-200 text-stone-400"
                      }`}
                    >
                      {order.status === "Delivered" ? "✓" : "3"}
                    </span>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-stone-100">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-2xl object-cover border shrink-0"
                      />
                      <div>
                        <Link
                          to={`/product/${item.id}`}
                          className="text-xs sm:text-sm font-bold text-stone-900 hover:underline line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Qty: {item.quantity} {item.selectedSize && `| Size: ${item.selectedSize}`}{" "}
                          {item.selectedColor && `| Color: ${item.selectedColor}`}
                        </p>
                        <p className="text-xs font-bold text-stone-900 mt-1">
                          ${item.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/product/${item.id}`}
                      className="text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl transition shrink-0"
                    >
                      Buy Again
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
