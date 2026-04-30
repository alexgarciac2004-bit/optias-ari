import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import { CartProvider } from "./context/CartContext";
import PromoBar from "./components/PromoBar";
import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import CartDrawer from "./components/CartDrawer";

import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout({ children }) {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && <PromoBar />}
      {!isAdmin && <TopBar />}
      {!isAdmin && <Navbar />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppFloat />}
      <CartDrawer />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <CartProvider>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/nosotros" element={<AboutPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/pago/exito" element={<CheckoutSuccessPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" richColors />
        </CartProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
