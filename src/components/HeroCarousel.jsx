import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    id: 1,
    badge: "Spring / Summer 2026",
    title: "Refined Modern Essentials",
    subtitle: "Engineered from sustainable Supima cotton, Japanese selvedge denim, and European linen.",
    ctaText: "Shop the Collection",
    ctaLink: "/products",
    secondaryText: "View Offers",
    secondaryLink: "/offers",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: 2,
    badge: "Handcrafted Heritage",
    title: "Goodyear-Welted Footwear",
    subtitle: "Artisan calfskin derbies, suede Chelsea boots, and butter-soft Italian low-top sneakers.",
    ctaText: "Explore Shoes",
    ctaLink: "/products/shoes",
    secondaryText: "All Products",
    secondaryLink: "/products",
    image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: 3,
    badge: "Special Seasonal Deals",
    title: "Up to 20% Off Select Styles",
    subtitle: "Use coupon code SHOPFORGE10 at checkout for an extra 10% off your entire order.",
    ctaText: "Claim Your Deals",
    ctaLink: "/offers",
    secondaryText: "Shop Shirts",
    secondaryLink: "/products/shirts",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80"
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[520px] md:h-[620px] overflow-hidden bg-stone-900 select-none">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {/* Background Image with Gradient Overlay */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
              <div className="max-w-xl text-white space-y-5">
                <span className="inline-block text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                  {slide.badge}
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                  {slide.title}
                </h1>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    to={slide.ctaLink}
                    className="inline-flex items-center justify-center bg-white text-stone-900 hover:bg-stone-100 font-semibold px-6 py-3.5 rounded-xl text-sm transition transform hover:-translate-y-0.5 shadow-lg"
                  >
                    {slide.ctaText}
                  </Link>
                  <Link
                    to={slide.secondaryLink}
                    className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-semibold px-6 py-3.5 rounded-xl text-sm transition"
                  >
                    {slide.secondaryText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md transition"
        aria-label="Previous Slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md transition"
        aria-label="Next Slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
