import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, ChevronDown, Search, Phone } from "lucide-react";
import { useCart } from "../context/CartContext";
import MegaMenu from "./MegaMenu";
import { waLink, WHATSAPP_NUMBER } from "../lib/api";

const STYLES = ["Clásico", "Moderno", "Deportivo", "Vintage", "Infantil", "Oversize"];
const TYPES = ["Sol", "Graduados", "Lectura", "Contacto"];

export default function Navbar() {
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const closeTimer = useRef(null);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname + location.search);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleCloseMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 180);
  };

  // Close menus when route actually changes
  useEffect(() => {
    const cur = location.pathname + location.search;
    if (cur !== prevPathRef.current) {
      prevPathRef.current = cur;
      setMegaOpen(false);
      setMobileOpen(false);
    }
  }, [location.pathname, location.search]);

  return (
    <header className="glass sticky top-0 z-40" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-5 flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
          <div className="w-10 h-10 rounded-full border border-[#0B1B3D] flex items-center justify-center">
            <span className="font-serif text-xl text-[#0B1B3D]">A</span>
          </div>
          <div className="leading-tight">
            <div className="font-serif text-xl text-[#0B1B3D]">Óptica Ari</div>
            <div className="eyebrow text-[10px]">Visión · Estilo</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <NavLink to="/" end className={({ isActive }) => `text-sm font-medium tracking-wide transition-colors ${isActive ? "text-[#C5A059]" : "text-[#0B1B3D] hover:text-[#C5A059]"}`} data-testid="nav-inicio">
            Inicio
          </NavLink>

          <div
            onMouseEnter={openMega}
            onMouseLeave={scheduleCloseMega}
            className="relative"
          >
            <button
              className={`text-sm font-medium tracking-wide transition-colors flex items-center gap-1 ${megaOpen ? "text-[#C5A059]" : "text-[#0B1B3D] hover:text-[#C5A059]"}`}
              data-testid="nav-catalogo-trigger"
              onClick={() => setMegaOpen(true)}
              aria-expanded={megaOpen}
            >
              Catálogo <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} strokeWidth={2} />
            </button>
          </div>

          <NavLink to="/nosotros" className={({ isActive }) => `text-sm font-medium tracking-wide transition-colors ${isActive ? "text-[#C5A059]" : "text-[#0B1B3D] hover:text-[#C5A059]"}`} data-testid="nav-nosotros">
            Nosotros
          </NavLink>
          <NavLink to="/citas" className={({ isActive }) => `text-sm font-medium tracking-wide transition-colors ${isActive ? "text-[#C5A059]" : "text-[#0B1B3D] hover:text-[#C5A059]"}`} data-testid="nav-citas">
            Agendar cita
          </NavLink>
          <NavLink to="/contacto" className={({ isActive }) => `text-sm font-medium tracking-wide transition-colors ${isActive ? "text-[#C5A059]" : "text-[#0B1B3D] hover:text-[#C5A059]"}`} data-testid="nav-contacto">
            Contacto
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/catalogo" className="hidden md:flex p-2 text-[#0B1B3D] hover:text-[#C5A059] transition-colors" data-testid="nav-search" aria-label="Buscar">
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <a href={waLink("Hola Óptica Ari")} target="_blank" rel="noreferrer" className="hidden md:flex p-2 text-[#0B1B3D] hover:text-[#C5A059] transition-colors" data-testid="nav-call" aria-label="WhatsApp">
            <Phone className="w-5 h-5" strokeWidth={1.5} />
          </a>
          <button
            onClick={() => setOpen(true)}
            className="relative p-2 text-[#0B1B3D] hover:text-[#C5A059] transition-colors"
            data-testid="cart-button"
            aria-label="Carrito"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C5A059] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full" data-testid="cart-count">
                {count}
              </span>
            )}
          </button>
          <button
            className="md:hidden p-2 text-[#0B1B3D]"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="mobile-menu-toggle"
            aria-label="Menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {megaOpen && (
        <>
          <div className="fixed inset-0 bg-[#0B1B3D]/30 z-30" onClick={() => setMegaOpen(false)} data-testid="mega-backdrop" />
          <div onMouseEnter={openMega} onMouseLeave={scheduleCloseMega} className="absolute left-0 right-0 top-full z-40">
            <MegaMenu onClose={() => setMegaOpen(false)} />
          </div>
        </>
      )}

      {mobileOpen && (
        <div className="md:hidden border-t border-[#0B1B3D]/10 bg-white max-h-[calc(100vh-80px)] overflow-y-auto" data-testid="mobile-menu">
          <div className="px-6 py-5 flex flex-col">
            <Link to="/" onClick={() => setMobileOpen(false)} className="py-3 text-[#0B1B3D] font-medium" data-testid="mobile-nav-inicio">Inicio</Link>

            <button
              onClick={() => setMobileSection(mobileSection === "catalog" ? null : "catalog")}
              className="py-3 text-[#0B1B3D] font-medium flex items-center justify-between"
              data-testid="mobile-nav-catalogo"
            >
              Catálogo <ChevronDown className={`w-4 h-4 transition-transform ${mobileSection === "catalog" ? "rotate-180" : ""}`} />
            </button>
            {mobileSection === "catalog" && (
              <div className="pl-4 pb-3 space-y-4 border-l border-[#C5A059]/40 ml-1">
                <div>
                  <div className="eyebrow mb-2">Por estilo</div>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((s) => (
                      <Link key={s} to={`/catalogo?style=${encodeURIComponent(s)}`} onClick={() => setMobileOpen(false)} className="text-xs px-3 py-1 border border-[#0B1B3D]/20 text-[#0B1B3D]" data-testid={`mobile-style-${s}`}>{s}</Link>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="eyebrow mb-2">Por tipo</div>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((t) => (
                      <Link key={t} to={`/catalogo?type=${encodeURIComponent(t)}`} onClick={() => setMobileOpen(false)} className="text-xs px-3 py-1 border border-[#0B1B3D]/20 text-[#0B1B3D]" data-testid={`mobile-type-${t}`}>{t}</Link>
                    ))}
                  </div>
                </div>
                <Link to="/catalogo" onClick={() => setMobileOpen(false)} className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">Ver catálogo completo →</Link>
              </div>
            )}

            <Link to="/nosotros" onClick={() => setMobileOpen(false)} className="py-3 text-[#0B1B3D] font-medium" data-testid="mobile-nav-nosotros">Nosotros</Link>
            <Link to="/citas" onClick={() => setMobileOpen(false)} className="py-3 text-[#0B1B3D] font-medium" data-testid="mobile-nav-citas">Agendar cita</Link>
            <Link to="/contacto" onClick={() => setMobileOpen(false)} className="py-3 text-[#0B1B3D] font-medium" data-testid="mobile-nav-contacto">Contacto</Link>

            <div className="mt-4 pt-4 border-t border-[#0B1B3D]/10 space-y-3">
              <a href={waLink("Hola Óptica Ari")} target="_blank" rel="noreferrer" className="btn-gold w-full block text-center text-sm" data-testid="mobile-whatsapp">
                WhatsApp · {WHATSAPP_NUMBER}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
