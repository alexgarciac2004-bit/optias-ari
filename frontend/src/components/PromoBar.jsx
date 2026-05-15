import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MESSAGES = [
  { text: "Envío GRATIS en compras superiores a $2,000 MXN", cta: "Comprar ahora", to: "/catalogo" },
  { text: "20% de descuento en lentes de sol seleccionados", cta: "Ver oferta", to: "/catalogo?type=Sol" },
  { text: "Examen visual sin costo al adquirir tus lentes", cta: "Agendar cita", to: "/contacto" },
  { text: "Garantía de 1 año en todos nuestros marcos", cta: "Conoce más", to: "/nosotros" },
  { text: "Nueva colección Oversize Couture · Mujer", cta: "Descubrir", to: "/catalogo?style=Oversize" },
];

export default function PromoBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const m = MESSAGES[i];
  const prev = () => setI((v) => (v - 1 + MESSAGES.length) % MESSAGES.length);
  const next = () => setI((v) => (v + 1) % MESSAGES.length);

  return (
    <div className="bg-[#E6007E] text-white text-xs" data-testid="promo-bar">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-2.5 flex items-center justify-between gap-4">
        <button onClick={prev} className="p-1 hover:bg-white/10 transition-colors hidden sm:flex" aria-label="Anterior" data-testid="promo-prev">
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
        <Link
          to={m.to}
          className="flex-1 text-center tracking-wider uppercase text-[11px] font-semibold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
          data-testid={`promo-msg-${i}`}
          key={i}
        >
          <span className="reveal">{m.text}</span>
          <span className="hidden md:inline border-b border-white/70 pb-0.5">{m.cta} →</span>
        </Link>
        <button onClick={next} className="p-1 hover:bg-white/10 transition-colors hidden sm:flex" aria-label="Siguiente" data-testid="promo-next">
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
