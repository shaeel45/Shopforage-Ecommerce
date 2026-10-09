import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
        <span className="text-5xl font-black text-stone-300 block mb-3">404</span>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mb-8 leading-relaxed">
          The page you are searching for might have been moved or removed.
        </p>
        <Link
          to="/"
          className="block w-full bg-black text-white font-bold py-3.5 px-6 rounded-xl text-xs hover:bg-stone-800 transition shadow-md"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
