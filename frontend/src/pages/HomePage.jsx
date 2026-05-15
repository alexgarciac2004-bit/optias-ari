import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

const HERO = "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1800&q=80";
const PORTRAIT = "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1200&q=80";

const STYLES = ["Clásico", "Moderno", "Deportivo", "Vintage", "Infantil", "Oversize"];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  useEffect(() => {
    api.get("/products", { params: { featured: true } }).then((r) => setFeatured(r.data.slice(0, 4)));
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <img src={HERO} alt="Óptica Ari" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#701A3D]/85 via-[#701A3D]/70 to-[#E6007E]/40" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-24 grid md:grid-cols-12 gap-8 items-end w-full">
          <div className="md:col-span-8 reveal">
            <div className="eyebrow text-[#C5A059] mb-6">Óptica profesional · Kanasín, Yucatán</div>
            <h1 className="font-serif text-white text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
              Claridad<br />
              <span className="italic text-[#C5A059]">que trasciende</span>
            </h1>
            <p className="text-white/80 text-lg mt-8 max-w-xl leading-relaxed">
              Diagnóstico profesional, lentes graduados, lentes de contacto y salud visual integral. Atención personalizada para toda tu familia.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link to="/catalogo" className="btn-pink inline-flex items-center gap-2" data-testid="hero-catalog-btn">
                Ver catálogo <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://web.whatsapp.com/send?phone=529999022780&text=Hola%20%C3%93ptica%20Ari%2C%20me%20gustar%C3%ADa%20una%20cotizaci%C3%B3n."
                target="_blank"
                rel="noreferrer"
                className="inline-block px-8 py-[14px] border border-white text-white hover:bg-white hover:text-[#701A3D] transition-colors font-medium tracking-wide"
                data-testid="hero-whatsapp-btn"
              >
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
          <div className="md:col-span-4 hidden md:flex justify-end reveal" style={{ animationDelay: "0.2s" }}>
            <div className="text-right text-white/80 text-sm border-l border-[#C5A059]/60 pl-6">
              <div className="eyebrow text-[#C5A059] mb-2">Desde 2015</div>
              <div className="font-serif text-3xl text-white">10+ años</div>
              <div className="mt-1">cuidando tu visión</div>
            </div>
          </div>
        </div>
      </section>

      {/* STYLES */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-6">
            <div className="eyebrow mb-4">Encuentra tu estilo</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#701A3D] gold-rule">Selecciona por personalidad</h2>
          </div>
          <p className="md:col-span-6 text-[#374151] text-base md:self-end">
            Desde lo clásico atemporal hasta lo contemporáneo audaz. Filtra por estilo y encuentra el marco que cuenta tu historia.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STYLES.map((s) => (
            <Link
              key={s}
              to={`/catalogo?style=${encodeURIComponent(s)}`}
              className="border border-[#701A3D]/15 hover:border-[#C5A059] hover:bg-[#701A3D] hover:text-white px-6 py-8 text-center transition-all group"
              data-testid={`style-chip-${s}`}
            >
              <div className="font-serif text-xl group-hover:text-[#C5A059] transition-colors">{s}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pb-20 md:pb-28">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="eyebrow mb-4">Destacados</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#701A3D] gold-rule">Piezas seleccionadas</h2>
          </div>
          <Link to="/catalogo" className="text-sm uppercase tracking-widest text-[#701A3D] hover:text-[#C5A059] border-b border-[#C5A059] pb-1" data-testid="view-all-products">
            Ver todo el catálogo
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-[#701A3D] text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Eye, title: "Examen visual profesional", desc: "Diagnóstico completo con equipo de última generación." },
              { icon: ShieldCheck, title: "Garantía 1 año", desc: "Todos nuestros marcos cuentan con garantía de fabricación." },
              { icon: Sparkles, title: "Asesoría personalizada", desc: "Te ayudamos a elegir el marco ideal para tu rostro y estilo." },
            ].map((v, i) => (
              <div key={i} className="border-l border-[#C5A059]/40 pl-6" data-testid={`value-${i}`}>
                <v.icon className="w-8 h-8 text-[#C5A059] mb-4" strokeWidth={1.2} />
                <h3 className="font-serif text-2xl mb-3">{v.title}</h3>
                <p className="text-white/70 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
        <img src={PORTRAIT} alt="Atención personalizada" className="w-full h-[520px] object-cover" />
        <div>
          <div className="eyebrow mb-4">Atención personalizada</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#701A3D] gold-rule leading-tight">
            Cada mirada merece<br />una pieza única.
          </h2>
          <p className="text-[#374151] mt-6 leading-relaxed">
            Agenda tu examen visual o pregunta por nuestro catálogo completo. Nuestro equipo te acompaña desde la primera visita hasta la entrega final.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link to="/citas" className="btn-navy" data-testid="split-contact">Agendar cita</Link>
            <Link to="/catalogo" className="btn-outline-navy" data-testid="split-catalog">Ver catálogo</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
