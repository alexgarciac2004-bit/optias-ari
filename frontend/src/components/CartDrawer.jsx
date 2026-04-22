import React, { useState } from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api, waLink } from "../lib/api";
import { toast } from "sonner";

export default function CartDrawer() {
  const { items, remove, update, total, open, setOpen, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await api.post("/checkout/session", {
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        origin_url: window.location.origin,
      });
      window.location.href = res.data.url;
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error al crear sesión de pago");
      setLoading(false);
    }
  };

  const handleQuote = () => {
    const lines = items.map((i) => `• ${i.name} x${i.quantity} — $${(i.price * i.quantity).toLocaleString("es-MX")}`).join("%0A");
    const msg = `Hola Óptica Ari, me interesa cotizar:%0A${lines}%0A%0ATotal aprox: $${total.toLocaleString("es-MX")} MXN`;
    window.open(`https://wa.me/529995108699?text=${msg}`, "_blank");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" data-testid="cart-drawer">
      <div className="absolute inset-0 bg-[#0B1B3D]/50" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white flex flex-col">
        <header className="px-6 py-5 border-b border-[#0B1B3D]/10 flex items-center justify-between">
          <div>
            <div className="eyebrow text-[#C5A059]">Carrito</div>
            <h2 className="font-serif text-2xl text-[#0B1B3D]">Tu selección</h2>
          </div>
          <button onClick={() => setOpen(false)} data-testid="cart-close" aria-label="Cerrar">
            <X className="w-5 h-5 text-[#0B1B3D]" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[#64748B] mb-6">Tu carrito está vacío.</p>
              <button className="btn-outline-navy text-sm" onClick={() => { setOpen(false); nav("/catalogo"); }} data-testid="cart-empty-browse">
                Explorar catálogo
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#0B1B3D]/10">
              {items.map((i) => (
                <li key={i.id} className="p-6 flex gap-4" data-testid={`cart-item-${i.id}`}>
                  <img src={i.image} alt={i.name} className="w-20 h-20 object-cover bg-[#F1F5F9]" />
                  <div className="flex-1">
                    <h4 className="font-serif text-[#0B1B3D] leading-tight">{i.name}</h4>
                    <div className="text-xs text-[#64748B] mb-2">{i.style} · {i.type}</div>
                    <div className="flex items-center gap-2">
                      <button className="w-7 h-7 border border-[#0B1B3D]/20 text-[#0B1B3D]" onClick={() => update(i.id, i.quantity - 1)}>−</button>
                      <span className="text-sm w-6 text-center" data-testid={`cart-qty-${i.id}`}>{i.quantity}</span>
                      <button className="w-7 h-7 border border-[#0B1B3D]/20 text-[#0B1B3D]" onClick={() => update(i.id, i.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between">
                    <div className="font-serif text-[#0B1B3D]">${(i.price * i.quantity).toLocaleString("es-MX")}</div>
                    <button onClick={() => remove(i.id)} className="text-[#64748B] hover:text-red-500" data-testid={`cart-remove-${i.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#0B1B3D]/10 p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-[#64748B]">Total</span>
              <span className="font-serif text-2xl text-[#0B1B3D]" data-testid="cart-total">${total.toLocaleString("es-MX")} MXN</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-navy w-full disabled:opacity-60 flex items-center justify-center gap-2"
              data-testid="checkout-btn"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Pagar ahora
            </button>
            <button onClick={handleQuote} className="btn-gold w-full" data-testid="quote-whatsapp-btn">
              Cotizar por WhatsApp
            </button>
            <button onClick={clear} className="w-full text-xs text-[#64748B] hover:text-[#0B1B3D]" data-testid="cart-clear">
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
