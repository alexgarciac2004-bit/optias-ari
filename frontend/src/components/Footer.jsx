import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { waLink, WHATSAPP_NUMBER } from "../lib/api";

export default function Footer() {
  return (
    <footer className="bg-[#701A3D] text-white/90 mt-24" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="font-serif text-2xl text-white mb-2">Óptica Ari</div>
          <p className="text-sm text-white/60 leading-relaxed">
            Visión profesional con estilo único. Claridad que trasciende — lentes y atención personalizada en Kanasín, Yucatán.
          </p>
        </div>
        <div>
          <div className="eyebrow text-[#C5A059] mb-4">Navegación</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-[#C5A059]">Inicio</Link></li>
            <li><Link to="/catalogo" className="hover:text-[#C5A059]">Catálogo</Link></li>
            <li><Link to="/nosotros" className="hover:text-[#C5A059]">Nosotros</Link></li>
            <li><Link to="/contacto" className="hover:text-[#C5A059]">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow text-[#C5A059] mb-4">Contacto</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#C5A059]" /> 999 902 2780</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#C5A059]" /> contacto@opticaari.mx</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#C5A059]" /> Kanasín, Yucatán</li>
          </ul>
        </div>
        <div>
          <div className="eyebrow text-[#C5A059] mb-4">Directo</div>
          <a
            href={waLink("Hola Óptica Ari, me gustaría más información.")}
            target="_blank"
            rel="noreferrer"
            className="inline-block btn-gold text-sm"
            data-testid="footer-whatsapp-btn"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-5 text-xs text-white/50 flex justify-between">
          <div>© {new Date().getFullYear()} Óptica Ari. Todos los derechos reservados.</div>
          <Link to="/admin/login" className="hover:text-[#C5A059]" data-testid="admin-link">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
