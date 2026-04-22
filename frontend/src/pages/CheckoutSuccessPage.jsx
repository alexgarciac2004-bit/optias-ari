import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("checking"); // checking | paid | failed | expired
  const [info, setInfo] = useState(null);
  const { clear } = useCart();
  const attemptsRef = useRef(0);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) { setStatus("failed"); return; }
    let timer;
    const poll = async () => {
      try {
        const r = await api.get(`/checkout/status/${sessionId}`);
        setInfo(r.data);
        if (r.data.payment_status === "paid") {
          setStatus("paid");
          if (!clearedRef.current) { clear(); clearedRef.current = true; }
          return;
        }
        if (r.data.status === "expired") { setStatus("expired"); return; }
        attemptsRef.current += 1;
        if (attemptsRef.current >= 8) { setStatus("failed"); return; }
        timer = setTimeout(poll, 2200);
      } catch {
        setStatus("failed");
      }
    };
    poll();
    return () => timer && clearTimeout(timer);
  }, [sessionId, clear]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center" data-testid="checkout-success">
      {status === "checking" && (
        <>
          <Loader2 className="w-14 h-14 text-[#C5A059] animate-spin mx-auto mb-6" />
          <h1 className="font-serif text-4xl text-[#0B1B3D]">Procesando tu pago…</h1>
          <p className="text-[#64748B] mt-4">No cierres esta ventana.</p>
        </>
      )}
      {status === "paid" && (
        <>
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" strokeWidth={1.2} />
          <div className="eyebrow mb-2">Compra confirmada</div>
          <h1 className="font-serif text-5xl text-[#0B1B3D]">¡Gracias por tu compra!</h1>
          <p className="text-[#64748B] mt-6 max-w-xl mx-auto">
            Hemos recibido tu pago{info?.amount_total ? ` por $${(info.amount_total / 100).toLocaleString("es-MX")} ${info?.currency?.toUpperCase() || "MXN"}` : ""}. Te contactaremos por WhatsApp para coordinar la entrega.
          </p>
          <Link to="/catalogo" className="btn-navy mt-10 inline-block" data-testid="success-continue">Seguir comprando</Link>
        </>
      )}
      {(status === "failed" || status === "expired") && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" strokeWidth={1.2} />
          <h1 className="font-serif text-4xl text-[#0B1B3D]">Hubo un problema</h1>
          <p className="text-[#64748B] mt-4">No pudimos confirmar tu pago. Intenta de nuevo o contáctanos por WhatsApp.</p>
          <Link to="/catalogo" className="btn-outline-navy mt-8 inline-block">Volver al catálogo</Link>
        </>
      )}
    </div>
  );
}
