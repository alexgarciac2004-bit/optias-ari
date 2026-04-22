import React from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="glass sticky top-0 z-40" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-5 flex items-center justify-between">
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
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors ${isActive ? "text-[#C5A059]" : "text-[#0B1B3D] hover:text-[#C5A059]"}`
              }
              data-testid={`nav-${n.label.toLowerCase()}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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

      {mobileOpen && (
        <div className="md:hidden border-t border-[#0B1B3D]/10 bg-white" data-testid="mobile-menu">
          <div className="px-6 py-4 flex flex-col gap-4">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `text-sm font-medium ${isActive ? "text-[#C5A059]" : "text-[#0B1B3D]"}`}
                data-testid={`mobile-nav-${n.label.toLowerCase()}`}
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
