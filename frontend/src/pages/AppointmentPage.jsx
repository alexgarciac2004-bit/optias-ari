import React, { useEffect, useMemo, useState } from "react";
import { api, waLink } from "../lib/api";
import { toast } from "sonner";
import { Calendar as CalIcon, Clock, CheckCircle2, Loader2, User, Phone, Mail } from "lucide-react";

const fmtDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS = ["D","L","M","M","J","V","S"];

function Calendar({ value, onChange }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const startDow = month.getDay();
  const cells = Array.from({ length: startDow + lastDay }).map((_, i) => i < startDow ? null : i - startDow + 1);

  const isSelectable = (day) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    return d >= today && d.getDay() !== 0; // not past, not Sunday
  };

  return (
    <div className="border border-[#701A3D]/10 p-5 bg-white" data-testid="calendar">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-2 text-[#701A3D] hover:text-[#C5A059]" data-testid="cal-prev">‹</button>
        <div className="font-serif text-lg text-[#701A3D]">{MONTHS[month.getMonth()]} {month.getFullYear()}</div>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-2 text-[#701A3D] hover:text-[#C5A059]" data-testid="cal-next">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#374151] mb-2">
        {DAYS.map((d, i) => <div key={i} className="py-1 font-semibold">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = fmtDate(new Date(month.getFullYear(), month.getMonth(), day));
          const sel = isSelectable(day);
          const isSel = value === dateStr;
          return (
            <button
              key={i}
              disabled={!sel}
              onClick={() => onChange(dateStr)}
              className={`aspect-square text-sm transition-colors ${
                isSel ? "bg-[#701A3D] text-white" : sel ? "text-[#701A3D] hover:bg-[#C5A059]/20" : "text-[#701A3D]/20 cursor-not-allowed"
              }`}
              data-testid={`cal-day-${dateStr}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AppointmentPage() {
  const [services, setServices] = useState([]);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [closed, setClosed] = useState(false);
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => { api.get("/appointments/services").then((r) => setServices(r.data)); }, []);

  useEffect(() => {
    setTime("");
    if (!date) { setSlots([]); setClosed(false); return; }
    api.get(`/appointments/availability?date=${date}`).then((r) => {
      setSlots(r.data.slots || []);
      setClosed(r.data.closed);
    });
  }, [date]);

  const canSubmit = service && date && time && form.customer_name && form.customer_phone;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const r = await api.post("/appointments", { ...form, service, date, time });
      setConfirmed(r.data.appointment);
      toast.success("¡Cita reservada con éxito!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al reservar");
    }
    setLoading(false);
  };

  if (confirmed) {
    const msg = `Hola Óptica Ari, quiero confirmar mi cita: ${confirmed.service} el ${confirmed.date} a las ${confirmed.time}. Nombre: ${confirmed.customer_name}.`;
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center" data-testid="appointment-confirmed">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" strokeWidth={1.2} />
        <div className="eyebrow mb-2">Cita reservada</div>
        <h1 className="font-serif text-5xl text-[#701A3D] mb-6">¡Te esperamos!</h1>
        <div className="bg-white border border-[#701A3D]/10 p-8 text-left space-y-3 mb-8">
          <div className="flex justify-between"><span className="text-[#374151]">Servicio</span><strong className="text-[#701A3D]">{confirmed.service}</strong></div>
          <div className="flex justify-between"><span className="text-[#374151]">Fecha</span><strong className="text-[#701A3D]">{confirmed.date}</strong></div>
          <div className="flex justify-between"><span className="text-[#374151]">Hora</span><strong className="text-[#701A3D]">{confirmed.time}</strong></div>
          <div className="flex justify-between"><span className="text-[#374151]">A nombre de</span><strong className="text-[#701A3D]">{confirmed.customer_name}</strong></div>
        </div>
        <p className="text-sm text-[#374151] mb-6">Te contactaremos pronto para confirmar. También puedes confirmar por WhatsApp:</p>
        <a href={waLink(msg)} target="_blank" rel="noreferrer" className="btn-gold inline-block" data-testid="confirm-whatsapp">Confirmar por WhatsApp</a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24" data-testid="appointment-page">
      <div className="eyebrow mb-4">Agenda tu cita</div>
      <h1 className="font-serif text-5xl md:text-6xl text-[#701A3D] gold-rule mb-12">Reserva en línea</h1>

      <form onSubmit={submit} className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div>
            <div className="eyebrow mb-3">1 · Servicio</div>
            <div className="grid sm:grid-cols-2 gap-3" data-testid="service-list">
              {services.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setService(s.name)}
                  className={`p-4 border text-left transition-colors ${service === s.name ? "border-[#C5A059] bg-[#C5A059]/5" : "border-[#701A3D]/15 hover:border-[#C5A059]"}`}
                  data-testid={`service-${s.name}`}
                >
                  <div className="font-serif text-base text-[#701A3D]">{s.name}</div>
                  <div className="text-xs text-[#374151] mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {s.duration_min} min</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="eyebrow mb-3">2 · Fecha</div>
            <Calendar value={date} onChange={setDate} />
            <p className="text-xs text-[#374151] mt-2">Lunes a Sábado · 9:00 a 14:00 y 15:00 a 19:00 · Domingos cerrado.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="eyebrow mb-3">3 · Hora disponible</div>
            {!date && <p className="text-sm text-[#374151]">Selecciona primero una fecha.</p>}
            {date && closed && <p className="text-sm text-red-600" data-testid="day-closed">Domingo cerrado. Elige otro día.</p>}
            {date && !closed && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2" data-testid="time-slots">
                {slots.length === 0 ? (
                  <p className="col-span-full text-sm text-[#374151]">Sin disponibilidad ese día.</p>
                ) : slots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`py-2 text-sm border transition-colors ${time === t ? "bg-[#701A3D] text-white border-[#701A3D]" : "border-[#701A3D]/15 text-[#701A3D] hover:border-[#C5A059]"}`}
                    data-testid={`slot-${t}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="eyebrow mb-3">4 · Tus datos</div>
            <div className="space-y-3">
              <input required placeholder="Nombre completo" className="w-full border border-[#701A3D]/20 px-4 py-3 focus:border-[#C5A059] focus:outline-none"
                value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} data-testid="appt-name" />
              <input required placeholder="Teléfono / WhatsApp" className="w-full border border-[#701A3D]/20 px-4 py-3 focus:border-[#C5A059] focus:outline-none"
                value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} data-testid="appt-phone" />
              <input type="email" placeholder="Email (opcional)" className="w-full border border-[#701A3D]/20 px-4 py-3 focus:border-[#C5A059] focus:outline-none"
                value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} data-testid="appt-email" />
              <textarea rows={3} placeholder="Notas adicionales (opcional)" className="w-full border border-[#701A3D]/20 px-4 py-3 focus:border-[#C5A059] focus:outline-none resize-none"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="appt-notes" />
            </div>
          </div>

          <div className="bg-[#701A3D] text-white p-6">
            <div className="eyebrow text-[#C5A059] mb-3">Resumen</div>
            <div className="space-y-1 text-sm">
              <div>Servicio: <span className="text-white/70">{service || "—"}</span></div>
              <div>Fecha: <span className="text-white/70">{date || "—"}</span></div>
              <div>Hora: <span className="text-white/70">{time || "—"}</span></div>
            </div>
            <button type="submit" disabled={!canSubmit || loading} className={`w-full mt-5 py-3 px-6 font-medium tracking-wide flex items-center justify-center gap-2 transition-colors ${canSubmit && !loading ? "bg-[#C5A059] hover:bg-[#B38F48] text-white" : "bg-white/10 text-white/40 cursor-not-allowed"}`} data-testid="appt-submit">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar cita
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
