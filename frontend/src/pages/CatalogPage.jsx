import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

const STYLES = ["Todos", "Clásico", "Moderno", "Deportivo", "Vintage", "Infantil", "Oversize"];
const TYPES = ["Todos", "Sol", "Graduados", "Lectura", "Contacto"];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [style, setStyle] = useState(searchParams.get("style") || "Todos");
  const [type, setType] = useState(searchParams.get("type") || "Todos");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    setLoading(true);
    api.get("/products").then((r) => {
      setProducts(r.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const p = {};
    if (style !== "Todos") p.style = style;
    if (type !== "Todos") p.type = type;
    setSearchParams(p);
  }, [style, type, setSearchParams]);

  const filtered = useMemo(() => {
    let arr = products.filter(
      (p) => (style === "Todos" || p.style === style) && (type === "Todos" || p.type === type)
    );
    if (sort === "low") arr = [...arr].sort((a, b) => a.price - b.price);
    if (sort === "high") arr = [...arr].sort((a, b) => b.price - a.price);
    if (sort === "featured") arr = [...arr].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return arr;
  }, [products, style, type, sort]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24" data-testid="catalog-page">
      <div className="mb-12">
        <div className="eyebrow mb-4">Catálogo completo</div>
        <h1 className="font-serif text-5xl md:text-6xl text-[#701A3D] gold-rule">Todos los lentes</h1>
      </div>

      <div className="mb-10 space-y-6">
        <div>
          <div className="eyebrow mb-3">Estilo</div>
          <div className="flex flex-wrap gap-2" data-testid="style-filters">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-5 py-2 text-sm border transition-colors ${style === s ? "bg-[#701A3D] text-white border-[#701A3D]" : "border-[#701A3D]/20 text-[#701A3D] hover:border-[#C5A059]"}`}
                data-testid={`filter-style-${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="eyebrow mb-3">Tipo</div>
            <div className="flex flex-wrap gap-2" data-testid="type-filters">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-5 py-2 text-sm border transition-colors ${type === t ? "bg-[#C5A059] text-white border-[#C5A059]" : "border-[#701A3D]/20 text-[#701A3D] hover:border-[#C5A059]"}`}
                  data-testid={`filter-type-${t}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-3">Ordenar</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 border border-[#701A3D]/20 text-[#701A3D] bg-white text-sm"
              data-testid="sort-select"
            >
              <option value="featured">Destacados</option>
              <option value="low">Precio: menor a mayor</option>
              <option value="high">Precio: mayor a menor</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-sm text-[#374151] mb-6" data-testid="results-count">{filtered.length} modelos</div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[420px] bg-[#FCE7F3] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-[#374151]" data-testid="empty-results">Sin resultados para estos filtros.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
