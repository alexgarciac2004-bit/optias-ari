import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { waLink, WHATSAPP_NUMBER } from "../lib/api";

export default function TopBar() {
  return (
    <div className="bg-[#0B1B3D] text-white text-xs hidden md:block" data-testid="topbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a
            href={waLink("Hola Óptica Ari")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-[#C5A059] transition-colors"
            data-testid="topbar-whatsapp"
          >
            <Phone className="w-3.5 h-3.5 text-[#C5A059]" strokeWidth={1.5} />
            <span className="tracking-wide">WhatsApp · {WHATSAPP_NUMBER.slice(0,3)} {WHATSAPP_NUMBER.slice(3,6)} {WHATSAPP_NUMBER.slice(6)}</span>
          </a>
          <a href="mailto:contacto@opticaari.mx" className="flex items-center gap-2 hover:text-[#C5A059] transition-colors" data-testid="topbar-email">
            <Mail className="w-3.5 h-3.5 text-[#C5A059]" strokeWidth={1.5} />
            <span>contacto@opticaari.mx</span>
          </a>
          <span className="hidden lg:flex items-center gap-2 text-white/70">
            <MapPin className="w-3.5 h-3.5 text-[#C5A059]" strokeWidth={1.5} />
            Mérida, Yucatán
          </span>
        </div>
        <div className="flex items-center gap-4 text-white/80">
          <span className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#C5A059]" strokeWidth={1.5} />
            Lun – Sáb · 9:00 – 19:00
          </span>
          <span className="text-[#C5A059] hidden lg:inline">|</span>
          <span className="hidden lg:inline tracking-wider uppercase text-[10px] text-[#C5A059] font-semibold">Envíos a todo México</span>
        </div>
      </div>
    </div>
  );
}
