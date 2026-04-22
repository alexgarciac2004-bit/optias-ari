import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/auth/login", { email, password });
      localStorage.setItem("optica_token", r.data.token);
      toast.success("Bienvenido");
      nav("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Credenciales incorrectas");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16" data-testid="admin-login-page">
      <form onSubmit={submit} className="w-full max-w-md bg-white border border-[#0B1B3D]/10 p-10">
        <div className="w-14 h-14 border border-[#C5A059] flex items-center justify-center mx-auto mb-6">
          <Lock className="w-5 h-5 text-[#C5A059]" strokeWidth={1.2} />
        </div>
        <div className="eyebrow text-center mb-2">Panel administrativo</div>
        <h1 className="font-serif text-3xl text-[#0B1B3D] text-center mb-8">Óptica Ari</h1>
        <div className="space-y-4">
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#0B1B3D]/20 px-4 py-3 focus:border-[#C5A059] focus:outline-none"
              data-testid="login-email"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Contraseña</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#0B1B3D]/20 px-4 py-3 focus:border-[#C5A059] focus:outline-none"
              data-testid="login-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-navy w-full disabled:opacity-60" data-testid="login-submit">
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </div>
      </form>
    </div>
  );
}
