import React from "react";
import { Link } from "react-router-dom";

const STYLES = ["Clásico", "Moderno", "Deportivo", "Vintage", "Infantil", "Oversize"];
const TYPES = ["Sol", "Graduados", "Lectura", "Contacto"];
const GENDERS = ["Hombre", "Mujer", "Unisex", "Niño", "Niña"];

const FEATURED_IMG = "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&q=80";

export default function MegaMenu({ onClose }) {
  return (
    <div
      className="bg-white border-t border-[#701A3D]/10 shadow-[0_24px_60px_rgba(11,27,61,0.12)]"
      data-testid="mega-menu"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-10 grid grid-cols-12 gap-10">
        <div className="col-span-3">
          <div className="eyebrow mb-5">Por estilo</div>
          <ul className="space-y-3">
            {STYLES.map((s) => (
              <li key={s}>
                <Link
                  to={`/catalogo?style=${encodeURIComponent(s)}`}
                  onClick={onClose}
                  className="text-sm text-[#701A3D] hover:text-[#C5A059] transition-colors flex items-center gap-2 group"
                  data-testid={`mega-style-${s}`}
                >
                  <span className="w-0 h-px bg-[#C5A059] group-hover:w-4 transition-all" />
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-3">
          <div className="eyebrow mb-5">Por tipo</div>
          <ul className="space-y-3">
            {TYPES.map((t) => (
              <li key={t}>
                <Link
                  to={`/catalogo?type=${encodeURIComponent(t)}`}
                  onClick={onClose}
                  className="text-sm text-[#701A3D] hover:text-[#C5A059] transition-colors flex items-center gap-2 group"
                  data-testid={`mega-type-${t}`}
                >
                  <span className="w-0 h-px bg-[#C5A059] group-hover:w-4 transition-all" />
                  {t === "Sol" ? "Lentes de Sol" : t === "Graduados" ? "Lentes Graduados" : t === "Lectura" ? "Lentes de Lectura" : "Lentes de Contacto"}
                </Link>
              </li>
            ))}
          </ul>
          <div className="eyebrow mt-8 mb-5">Por persona</div>
          <ul className="space-y-3">
            {GENDERS.map((g) => (
              <li key={g}>
                <Link
                  to="/catalogo"
                  onClick={onClose}
                  className="text-sm text-[#701A3D] hover:text-[#C5A059] transition-colors flex items-center gap-2 group"
                  data-testid={`mega-gender-${g}`}
                >
                  <span className="w-0 h-px bg-[#C5A059] group-hover:w-4 transition-all" />
                  {g}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-3">
          <div className="eyebrow mb-5">Servicios</div>
          <ul className="space-y-3">
            {[
              { l: "Examen visual", to: "/citas" },
              { l: "Lentes graduadas", to: "/catalogo?type=Graduados" },
              { l: "Adaptación contacto", to: "/citas" },
              { l: "Ajuste y mantenimiento", to: "/citas" },
              { l: "Garantía 1 año", to: "/nosotros" },
              { l: "Agendar cita", to: "/citas" },
            ].map((s) => (
              <li key={s.l}>
                <Link
                  to={s.to}
                  onClick={onClose}
                  className="text-sm text-[#701A3D] hover:text-[#C5A059] transition-colors flex items-center gap-2 group"
                  data-testid={`mega-service-${s.l}`}
                >
                  <span className="w-0 h-px bg-[#C5A059] group-hover:w-4 transition-all" />
                  {s.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link to="/catalogo" onClick={onClose} className="col-span-3 group block relative overflow-hidden h-[280px]" data-testid="mega-featured">
          <img src={FEATURED_IMG} alt="Destacados" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#701A3D]/90 via-[#701A3D]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="eyebrow text-[#C5A059] mb-2">Nueva colección</div>
            <div className="font-serif text-2xl leading-tight mb-2">Oversize Couture</div>
            <div className="text-xs uppercase tracking-widest border-b border-[#C5A059] pb-1 inline-block">Descubrir →</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
