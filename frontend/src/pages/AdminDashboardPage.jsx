import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, LogOut, X } from "lucide-react";

const STYLES = ["Clásico", "Moderno", "Deportivo", "Vintage", "Infantil", "Oversize"];
const TYPES = ["Sol", "Graduados", "Lectura", "Contacto"];
const GENDERS = ["Unisex", "Hombre", "Mujer", "Niño", "Niña"];

const empty = { name: "", brand: "", description: "", price: 0, image: "", style: "Clásico", type: "Sol", gender: "Unisex", stock: 10, featured: false };

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState("products");
  const [modal, setModal] = useState(null); // null | product obj | "new"
  const [form, setForm] = useState(empty);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/auth/me").catch(() => { localStorage.removeItem("optica_token"); nav("/admin/login"); });
    load();
  }, [nav]);

  const load = async () => {
    try {
      const [p, q, t, a] = await Promise.all([
        api.get("/products"),
        api.get("/admin/quotes"),
        api.get("/admin/transactions"),
        api.get("/admin/appointments"),
      ]);
      setProducts(p.data);
      setQuotes(q.data);
      setTransactions(t.data);
      setAppointments(a.data);
    } catch {
      toast.error("Error cargando datos");
    }
  };

  const logout = () => { localStorage.removeItem("optica_token"); nav("/admin/login"); };

  const openNew = () => { setForm(empty); setModal("new"); };
  const openEdit = (p) => { setForm({ ...p }); setModal(p); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (modal === "new") {
        await api.post("/admin/products", { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) });
        toast.success("Producto creado");
      } else {
        await api.put(`/admin/products/${modal.id}`, { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) });
        toast.success("Producto actualizado");
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al guardar");
    }
  };

  const del = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success("Eliminado");
      load();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-12" data-testid="admin-dashboard">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="eyebrow mb-2">Panel Admin</div>
          <h1 className="font-serif text-4xl text-[#701A3D]">Óptica Ari</h1>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-2 text-sm text-[#374151] hover:text-[#701A3D]" data-testid="logout-btn">
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>

      <div className="flex gap-1 mb-8 border-b border-[#701A3D]/10">
        {[
          { k: "products", l: `Productos (${products.length})` },
          { k: "appointments", l: `Citas (${appointments.length})` },
          { k: "quotes", l: `Cotizaciones (${quotes.length})` },
          { k: "transactions", l: `Transacciones (${transactions.length})` },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`px-6 py-3 text-sm border-b-2 -mb-px transition-colors ${tab === t.k ? "border-[#C5A059] text-[#701A3D]" : "border-transparent text-[#374151] hover:text-[#701A3D]"}`}
            data-testid={`tab-${t.k}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openNew} className="btn-gold inline-flex items-center gap-2 text-sm" data-testid="new-product-btn">
              <Plus className="w-4 h-4" /> Nuevo producto
            </button>
          </div>
          <div className="overflow-x-auto border border-[#701A3D]/10">
            <table className="w-full text-sm" data-testid="products-table">
              <thead className="bg-[#701A3D] text-white">
                <tr>
                  <th className="text-left p-3">Imagen</th>
                  <th className="text-left p-3">Nombre</th>
                  <th className="text-left p-3">Estilo</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-right p-3">Precio</th>
                  <th className="text-center p-3">Stock</th>
                  <th className="text-center p-3">Destacado</th>
                  <th className="text-right p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-[#701A3D]/10 hover:bg-[#FCE7F3]" data-testid={`admin-row-${p.id}`}>
                    <td className="p-3"><img src={p.image} alt="" className="w-14 h-14 object-cover bg-[#FCE7F3]" /></td>
                    <td className="p-3 font-medium text-[#701A3D]">{p.name}</td>
                    <td className="p-3">{p.style}</td>
                    <td className="p-3">{p.type}</td>
                    <td className="p-3 text-right">${p.price.toLocaleString("es-MX")}</td>
                    <td className="p-3 text-center">{p.stock}</td>
                    <td className="p-3 text-center">{p.featured ? "⭐" : "—"}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => openEdit(p)} className="p-2 text-[#701A3D] hover:text-[#C5A059]" data-testid={`edit-${p.id}`}><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => del(p.id)} className="p-2 text-[#701A3D] hover:text-red-500" data-testid={`delete-${p.id}`}><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "quotes" && (
        <div className="space-y-4" data-testid="quotes-list">
          {quotes.length === 0 && <p className="text-[#374151] py-8 text-center">Sin cotizaciones todavía.</p>}
          {quotes.map((q) => (
            <div key={q.id} className="border border-[#701A3D]/10 p-5 bg-white">
              <div className="flex justify-between mb-2">
                <div className="font-serif text-lg text-[#701A3D]">{q.name}</div>
                <div className="text-xs text-[#374151]">{new Date(q.created_at).toLocaleString("es-MX")}</div>
              </div>
              <div className="text-sm text-[#374151]">{q.phone} · {q.email}</div>
              <p className="text-sm mt-2">{q.message}</p>
              {q.items?.length > 0 && (
                <ul className="mt-2 text-xs text-[#374151]">
                  {q.items.map((i, idx) => <li key={idx}>• {i.product_id} x{i.quantity}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "appointments" && (
        <div className="overflow-x-auto border border-[#701A3D]/10" data-testid="appointments-table">
          <table className="w-full text-sm">
            <thead className="bg-[#701A3D] text-white">
              <tr>
                <th className="text-left p-3">Fecha · Hora</th>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Servicio</th>
                <th className="text-left p-3">Contacto</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-[#374151]">Sin citas registradas.</td></tr>}
              {appointments.map((a) => (
                <tr key={a.id} className="border-t border-[#701A3D]/10" data-testid={`appt-row-${a.id}`}>
                  <td className="p-3 font-medium text-[#701A3D]">{a.date} · {a.time}</td>
                  <td className="p-3">{a.customer_name}</td>
                  <td className="p-3">{a.service}</td>
                  <td className="p-3 text-xs">
                    <div>{a.customer_phone}</div>
                    {a.customer_email && <div className="text-[#374151]">{a.customer_email}</div>}
                  </td>
                  <td className="p-3">
                    <select
                      value={a.status}
                      onChange={async (e) => {
                        try {
                          await api.put(`/admin/appointments/${a.id}`, { status: e.target.value });
                          toast.success("Estado actualizado");
                          load();
                        } catch { toast.error("Error"); }
                      }}
                      className={`px-2 py-1 text-xs border ${a.status === "confirmed" ? "bg-green-50 text-green-700 border-green-300" : a.status === "completed" ? "bg-blue-50 text-blue-700 border-blue-300" : a.status === "cancelled" ? "bg-red-50 text-red-700 border-red-300" : "bg-amber-50 text-amber-700 border-amber-300"}`}
                      data-testid={`appt-status-${a.id}`}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={async () => {
                        if (!window.confirm("¿Eliminar esta cita?")) return;
                        try { await api.delete(`/admin/appointments/${a.id}`); toast.success("Eliminada"); load(); }
                        catch { toast.error("Error"); }
                      }}
                      className="p-2 text-[#701A3D] hover:text-red-500"
                      data-testid={`appt-delete-${a.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {tab === "transactions" && (
        <div className="overflow-x-auto border border-[#701A3D]/10" data-testid="transactions-table">
          <table className="w-full text-sm">
            <thead className="bg-[#701A3D] text-white">
              <tr><th className="text-left p-3">Fecha</th><th className="text-left p-3">Sesión</th><th className="text-left p-3">Cliente</th><th className="text-right p-3">Monto</th><th className="text-left p-3">Estado</th></tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-[#701A3D]/10">
                  <td className="p-3">{new Date(t.created_at).toLocaleString("es-MX")}</td>
                  <td className="p-3 text-xs font-mono">{t.session_id?.slice(0, 24)}…</td>
                  <td className="p-3">{t.customer_name || "—"}</td>
                  <td className="p-3 text-right">${t.amount?.toLocaleString("es-MX")} {t.currency?.toUpperCase()}</td>
                  <td className="p-3"><span className={`px-2 py-1 text-xs ${t.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{t.payment_status}</span></td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-[#374151]">Sin transacciones todavía.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-[#701A3D]/60 z-50 flex items-center justify-center p-4" data-testid="product-modal">
          <form onSubmit={save} className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between mb-6">
              <h3 className="font-serif text-2xl text-[#701A3D]">{modal === "new" ? "Nuevo producto" : "Editar producto"}</h3>
              <button type="button" onClick={() => setModal(null)} data-testid="modal-close"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="col-span-2"><span className="eyebrow block mb-1">Nombre</span>
                <input required className="w-full border border-[#701A3D]/20 px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="form-name" />
              </label>
              <label><span className="eyebrow block mb-1">Marca</span>
                <input className="w-full border border-[#701A3D]/20 px-3 py-2" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </label>
              <label><span className="eyebrow block mb-1">Precio MXN</span>
                <input required type="number" step="0.01" className="w-full border border-[#701A3D]/20 px-3 py-2" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="form-price" />
              </label>
              <label className="col-span-2"><span className="eyebrow block mb-1">URL Imagen</span>
                <input required className="w-full border border-[#701A3D]/20 px-3 py-2" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} data-testid="form-image" />
              </label>
              <label className="col-span-2"><span className="eyebrow block mb-1">Descripción</span>
                <textarea rows={3} className="w-full border border-[#701A3D]/20 px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label><span className="eyebrow block mb-1">Estilo</span>
                <select className="w-full border border-[#701A3D]/20 px-3 py-2" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} data-testid="form-style">
                  {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label><span className="eyebrow block mb-1">Tipo</span>
                <select className="w-full border border-[#701A3D]/20 px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} data-testid="form-type">
                  {TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label><span className="eyebrow block mb-1">Género</span>
                <select className="w-full border border-[#701A3D]/20 px-3 py-2" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  {GENDERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label><span className="eyebrow block mb-1">Stock</span>
                <input type="number" className="w-full border border-[#701A3D]/20 px-3 py-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </label>
              <label className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} data-testid="form-featured" />
                <span className="text-sm">Producto destacado (visible en inicio)</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="btn-outline-navy text-sm">Cancelar</button>
              <button type="submit" className="btn-navy text-sm" data-testid="form-submit">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
