import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function About() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How long does domestic and international delivery take?",
      a: "Domestic US orders are processed within 24 hours and delivered in 3-5 business days via Standard shipping (or 1-2 days with Priority Express). International shipping usually arrives within 6-10 business days."
    },
    {
      q: "What is your return & exchange policy?",
      a: "We offer a 30-day, no-questions-asked return and exchange policy on all unworn items in their original packaging. We provide prepaid return labels for domestic returns."
    },
    {
      q: "How are ShopForge garments and shoes produced?",
      a: "Our clothing is crafted in ethical partner workshops in Portugal, Japan, and Italy. We specialize in certified organic Supima cotton, Okayama selvedge denim, and vegetable-tanned Italian leathers that age gracefully."
    },
    {
      q: "How can I apply a discount or coupon code?",
      a: "You can apply any valid promo code (such as SHOPFORGE10) directly inside your Shopping Bag or on the Checkout page before submitting payment."
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
            Our Purpose & Heritage
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight mt-2 mb-4">
            Crafting Essentials Built for Longevity
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            ShopForge was founded on a simple principle: clothing should be timeless, rigorously built, and priced honestly without exorbitant fashion-house markups.
          </p>
        </div>

        {/* Story Grid */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
              The ShopForge Standard
            </span>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-4">
              Slow Fashion Over Fast Trends
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-3">
              We reject the planned obsolescence of disposable fast fashion. Every seam, button, rivet, and lining is chosen for durability and refined drape.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-3">
              By working directly with master mills in Okayama and artisan tanneries in Tuscany, we ensure living wages, environmentally certified tanning, and fabrics that look better with age.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"
              alt="Artisan fabric work"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-base mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Pure Natural Fibers</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We prioritize certified long-staple Supima cotton, unblended European linen, and pure merino wool over synthetic polyesters.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-base mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Artisan Heritage</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our footwear utilizes Goodyear-welted construction, allowing our shoes to be resoled for decades of reliable wear.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-base mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Direct & Transparent</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              No middle distributors or retail markups. We bring craftsman-grade garments directly to your doorstep.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Everything you need to know about purchasing, sizing, and delivery.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto divide-y divide-stone-100">
            {faqs.map((faq, idx) => (
              <div key={idx} className="pt-4 first:pt-0">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm text-stone-900 py-2 hover:text-stone-600 transition"
                >
                  <span>{faq.q}</span>
                  <span className="text-stone-400 text-base">{openFaq === idx ? "−" : "+"}</span>
                </button>
                {openFaq === idx && (
                  <p className="text-xs text-stone-600 leading-relaxed pb-3 pt-1 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-black text-white font-bold px-8 py-3.5 rounded-xl text-xs hover:bg-stone-800 transition shadow-md"
          >
            Explore the Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
