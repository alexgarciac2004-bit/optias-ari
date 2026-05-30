import React from "react";
import { Link } from "react-router-dom";

const IMG = "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1200&q=80";

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="eyebrow mb-4">Nosotros</div>
          <h1 className="font-serif text-5xl md:text-6xl text-[#701A3D] gold-rule leading-[1.05]">
            Una mirada<br /><em className="not-italic text-[#C5A059] italic">auténtica</em> a la óptica.
          </h1>
          <p className="mt-8 text-[#374151] leading-relaxed">
            Óptica Ari nació con la convicción de ofrecer salud visual integral con un servicio cálido y profesional.
            Cada examen y cada marco es seleccionado con dedicación para que tu mirada cuente tu propia historia.
          </p>
          <p className="mt-4 text-[#374151] leading-relaxed">
            En Kanasín, Yucatán, combinamos tecnología óptica de vanguardia con atención personalizada para toda la familia — Claridad que trasciende.
          </p>
        </div>
        <img src={IMG} alt="Equipo Óptica Ari" className="w-full h-[560px] object-cover" />
      </section>

      <section className="bg-[#FCE7F3] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="eyebrow mb-4">Servicios</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#701A3D] gold-rule mb-16">Todo para tu visión</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: "Examen visual completo", d: "Diagnóstico con equipo computarizado de última generación en 30 minutos." },
              { t: "Lentes oftálmicos", d: "Monofocales, bifocales y progresivos con las mejores marcas del mundo." },
              { t: "Lentes de sol RX", d: "Protección UV400 con graduación personalizada." },
              { t: "Lentes de contacto", d: "Adaptación profesional y seguimiento continuo." },
              { t: "Ajuste y mantenimiento", d: "Limpieza ultrasónica y ajustes de por vida." },
              { t: "Garantía de 10 meses", d: "Todos los marcos cuentan con garantía de fabricación de 10 meses." },
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 border border-[#701A3D]/10 hover:border-[#C5A059] transition-colors" data-testid={`service-${i}`}>
                <div className="font-serif text-xl text-[#701A3D] mb-3">{s.t}</div>
                <p className="text-sm text-[#374151] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-14">
            <Link to="/catalogo" className="btn-navy" data-testid="about-catalog-btn">Explorar catálogo</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
