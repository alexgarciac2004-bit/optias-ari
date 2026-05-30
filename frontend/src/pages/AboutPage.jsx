import React from "react";
import { Link } from "react-router-dom";
import { Heart, Target, Eye } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1200&q=80";

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      {/* Intro */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="eyebrow mb-4">Nosotros · Historia</div>
          <h1 className="font-serif text-5xl md:text-6xl text-[#701A3D] gold-rule leading-[1.05]">
            Un sueño<br /><em className="not-italic text-[#E6007E] italic">hecho con amor</em>
          </h1>
          <p className="mt-8 text-[#374151] leading-relaxed">
            Óptica Ari nace de un sueño construido con amor, esfuerzo y unión familiar. Más de 15 años de experiencia
            atendiendo a familias en Kanasín, Yucatán — con honestidad, calidez y el corazón en cada detalle.
          </p>
        </div>
        <img src={IMG} alt="Óptica Ari" className="w-full h-[560px] object-cover shadow-[0_24px_60px_rgba(112,26,61,0.15)]" />
      </section>

      {/* Historia completa */}
      <section className="bg-white py-20 md:py-28 relative overflow-hidden" data-testid="story-section">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#F9A8D4]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#E6007E]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 md:px-12 relative">
          <div className="eyebrow mb-4 text-center">Historia de Ópticas Ari 🦋✨</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#701A3D] gold-rule center text-center mb-14">
            Un camino construido en familia
          </h2>

          <div className="space-y-6 text-[#374151] leading-[1.85] text-lg">
            <p>
              Mi camino en el ramo óptico comenzó desde el año <strong className="text-[#701A3D]">2009</strong>,
              aprendiendo cada día la importancia de ayudar a las personas a cuidar su visión y sentirse bien consigo mismas.
              Con el paso de los años nació el deseo de crear un espacio propio: un lugar cálido, agradable y donde cada
              persona pudiera sentirse atendida con confianza y cercanía.
            </p>

            <p className="font-serif italic text-2xl text-[#E6007E] text-center py-6 border-y border-[#C5A059]/30">
              Este sueño no lo construí sola.
            </p>

            <p>
              Ópticas Ari fue posible gracias al apoyo de mi <strong className="text-[#701A3D]">esposo, mis padres,
              mis hijos y toda mi familia</strong>, quienes estuvieron conmigo en cada paso. Mi papá ayudó con la plomería
              y electricidad del local, mi esposo con la pintura y cada detalle, mientras juntos pasábamos noches enteras
              trabajando para crear el lugar que imaginábamos.
            </p>

            <p>
              Cada rincón fue pensado con muchísimo cariño para que las personas se sientan cómodas y bienvenidas desde
              el momento en que entran.
            </p>

            <div className="bg-[#FCE7F3] border-l-4 border-[#E6007E] p-6 my-8">
              <p className="text-[#701A3D]">
                El nombre <strong className="font-serif text-xl">"Ari"</strong> representa una parte muy especial de mi vida:
                mi hija <strong>Ariakna</strong>, quien sigue siendo inspiración y una motivación muy importante en mi corazón.
                También representa el amor por mis hijos y mi familia, quienes son la fuerza detrás de este sueño.
              </p>
            </div>

            <p>
              Hoy, Ópticas Ari abre sus puertas con <strong className="text-[#701A3D]">gratitud, ilusión y más de 15 años
              de experiencia</strong> en el ramo óptico, buscando brindar no solo lentes, sino también una atención humana,
              cercana y hecha con el corazón. <span className="text-[#E6007E]">🦋✨</span>
            </p>
          </div>
        </div>
      </section>

      {/* Misión & Visión */}
      <section className="bg-gradient-to-br from-[#701A3D] via-[#8B2750] to-[#701A3D] text-white py-20 md:py-28" data-testid="mission-vision">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 md:p-12" data-testid="mission-card">
              <div className="flex items-center gap-3 mb-5">
                <Target className="w-7 h-7 text-[#C5A059]" strokeWidth={1.3} />
                <div className="eyebrow text-[#C5A059]">Misión</div>
              </div>
              <h3 className="font-serif text-3xl md:text-4xl mb-6 leading-tight">
                Salud visual con<br />
                <em className="italic text-[#F9A8D4]">corazón</em>
              </h3>
              <p className="text-white/85 leading-relaxed">
                Brindar salud visual con atención humana, cercana y de calidad, ofreciendo lentes accesibles,
                modernos y cómodos para toda la familia. En Ópticas Ari trabajamos con
                <strong className="text-white"> honestidad, compromiso y amor</strong>, buscando que cada persona
                se sienta atendida con confianza y calidez. <span className="text-[#F9A8D4]">🦋✨</span>
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 md:p-12" data-testid="vision-card">
              <div className="flex items-center gap-3 mb-5">
                <Eye className="w-7 h-7 text-[#C5A059]" strokeWidth={1.3} />
                <div className="eyebrow text-[#C5A059]">Visión</div>
              </div>
              <h3 className="font-serif text-3xl md:text-4xl mb-6 leading-tight">
                Crecer junto a<br />
                <em className="italic text-[#F9A8D4]">cada cliente</em>
              </h3>
              <p className="text-white/85 leading-relaxed">
                Ser una óptica reconocida en <strong className="text-white">Kanasín y Yucatán</strong> por nuestra
                calidad, confianza y atención personalizada, creciendo junto a nuestros clientes y manteniendo
                siempre la esencia familiar, el amor y la dedicación con los que nació Ópticas Ari.
                <span className="text-[#F9A8D4]"> 💖</span>
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Heart className="w-8 h-8 text-[#F9A8D4] mx-auto mb-4" strokeWidth={1.2} fill="#F9A8D4" />
            <p className="font-serif italic text-2xl text-white/90 max-w-2xl mx-auto">
              "Más que lentes, atención humana hecha con el corazón."
            </p>
          </div>
        </div>
      </section>

      {/* Servicios */}
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
              <div key={i} className="bg-white p-8 border border-[#701A3D]/10 hover:border-[#E6007E] transition-colors" data-testid={`service-${i}`}>
                <div className="font-serif text-xl text-[#701A3D] mb-3">{s.t}</div>
                <p className="text-sm text-[#374151] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/catalogo" className="btn-navy" data-testid="about-catalog-btn">Explorar catálogo</Link>
            <Link to="/citas" className="btn-pink" data-testid="about-appt-btn">Agendar cita</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
