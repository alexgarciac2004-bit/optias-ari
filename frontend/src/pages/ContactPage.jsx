import React, { useState } from "react";
import { api, waLink } from "../lib/api";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/quotes", { ...form, items: [] });
      toast.success("¡Gracias! Te contactaremos pronto.");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      toast.error("Error al enviar. Intenta por WhatsApp.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24" data-testid="contact-page">
      <div className="eyebrow mb-4">Contacto</div>
      <h1 className="font-serif text-5xl md:text-6xl text-[#0B1B3D] gold-rule mb-16">Hablemos</h1>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-[#64748B] leading-relaxed mb-10">
            ¿Tienes dudas, quieres cotizar o agendar tu examen visual? Déjanos tus datos o escríbenos directo por WhatsApp.
          </p>
          <ul className="space-y-6">
            <li className="flex gap-4" data-testid="contact-phone">
              <Phone className="w-5 h-5 text-[#C5A059] shrink-0 mt-1" strokeWidth={1.2} />
              <div>
                <div className="eyebrow mb-1">Teléfono / WhatsApp</div>
                <a href={waLink("Hola Óptica Ari")} target="_blank" rel="noreferrer" className="font-serif text-2xl text-[#0B1B3D] hover:text-[#C5A059]">999 510 6899</a>
              </div>
            </li>
            <li className="flex gap-4">
              <Mail className="w-5 h-5 text-[#C5A059] shrink-0 mt-1" strokeWidth={1.2} />
              <div>
                <div className="eyebrow mb-1">Email</div>
                <div className="font-serif text-xl text-[#0B1B3D]">contacto@opticaari.mx</div>
              </div>
            </li>
            <li className="flex gap-4">
              <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-1" strokeWidth={1.2} />
              <div>
                <div className="eyebrow mb-1">Ubicación</div>
                <div className="font-serif text-xl text-[#0B1B3D]">Mérida, Yucatán, México</div>
              </div>
            </li>
            <li className="flex gap-4">
              <Clock className="w-5 h-5 text-[#C5A059] shrink-0 mt-1" strokeWidth={1.2} />
              <div>
                <div className="eyebrow mb-1">Horario</div>
                <div className="text-[#0B1B3D]">Lun – Sáb · 9:00 – 19:00</div>
              </div>
            </li>
          </ul>
        </div>

        <form onSubmit={submit} className="bg-white border border-[#0B1B3D]/10 p-8 space-y-5" data-testid="contact-form">
          <div>
            <label className="eyebrow block mb-2">Nombre</label>
            <input
              required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-[#0B1B3D]/20 px-4 py-3 focus:border-[#C5A059] focus:outline-none"
              data-testid="contact-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="eyebrow block mb-2">Teléfono</label>
              <input
                required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-[#0B1B3D]/20 px-4 py-3 focus:border-[#C5A059] focus:outline-none"
                data-testid="contact-phone-input"
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">Email</label>
              <input
                type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#0B1B3D]/20 px-4 py-3 focus:border-[#C5A059] focus:outline-none"
                data-testid="contact-email"
              />
            </div>
          </div>
          <div>
            <label className="eyebrow block mb-2">Mensaje</label>
            <textarea
              required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border border-[#0B1B3D]/20 px-4 py-3 focus:border-[#C5A059] focus:outline-none resize-none"
              data-testid="contact-message"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-navy w-full disabled:opacity-60" data-testid="contact-submit">
            {loading ? "Enviando…" : "Enviar mensaje"}
          </button>
        </form>
      </div>
    </div>
  );
}
