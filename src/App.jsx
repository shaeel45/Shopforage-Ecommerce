import React from "react";
import { Routes, Route } from "react-router-dom";

// Context Providers
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";

// Components
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import Homepage from "./pages/homepage";
import Products from "./pages/products";
import Shirts from "./pages/shirts";
import Pants from "./pages/pants";
import Shoes from "./pages/shoes";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import Search from "./pages/Search";
import Offers from "./pages/Offers";
import About from "./pages/about";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <OrderProvider>
              <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white font-sans antialiased">
                <ScrollToTop />
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/home" element={<Homepage />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/shirts" element={<Shirts />} />
                    <Route path="/products/pants" element={<Pants />} />
                    <Route path="/products/shoes" element={<Shoes />} />
                    <Route path="/shirts" element={<Shirts />} />
                    <Route path="/pants" element={<Pants />} />
                    <Route path="/shoes" element={<Shoes />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </OrderProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
