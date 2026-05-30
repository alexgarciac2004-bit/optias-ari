import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, waLink } from "../lib/api";
import { useCart } from "../context/CartContext";
import { ShoppingBag, MessageCircle, ArrowLeft } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => setProduct(r.data));
  }, [id]);

  if (!product) return <div className="max-w-7xl mx-auto py-24 px-6 text-center text-[#374151]">Cargando…</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-20" data-testid="product-detail">
      <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-[#374151] hover:text-[#701A3D] mb-8" data-testid="back-to-catalog">
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </Link>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-[#FCE7F3]">
          <img src={product.image} alt={product.name} className="w-full h-[560px] object-cover" data-testid="product-image" />
        </div>
        <div>
          <div className="eyebrow mb-4">{product.brand || "Óptica Ari"}</div>
          <h1 className="font-serif text-4xl md:text-5xl text-[#701A3D] leading-tight" data-testid="product-name">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-[#374151]">
            <span className="px-3 py-1 bg-[#701A3D] text-white">{product.style}</span>
            <span className="px-3 py-1 border border-[#701A3D]/20">{product.type}</span>
            <span>{product.gender}</span>
          </div>
          <p className="mt-6 text-[#374151] leading-relaxed">{product.description}</p>
          <div className="mt-8 font-serif text-4xl text-[#701A3D]" data-testid="product-detail-price">
            ${product.price.toLocaleString("es-MX")} <span className="text-sm text-[#374151]">MXN</span>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-[#701A3D]/20">
              <button className="px-4 py-3 text-[#701A3D]" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="px-4 py-3 min-w-[40px] text-center" data-testid="qty-display">{qty}</span>
              <button className="px-4 py-3 text-[#701A3D]" onClick={() => setQty(qty + 1)}>+</button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <button onClick={() => add(product, qty)} className="btn-navy inline-flex items-center gap-2" data-testid="detail-add-cart">
              <ShoppingBag className="w-4 h-4" /> Añadir al carrito
            </button>
            <a
              href={waLink(`Hola Óptica Ari, me interesa: ${product.name} ($${product.price.toLocaleString("es-MX")} MXN). ¿Podemos cotizar?`)}
              target="_blank"
              rel="noreferrer"
              className="btn-gold inline-flex items-center gap-2"
              data-testid="detail-whatsapp"
            >
              <MessageCircle className="w-4 h-4" /> Cotizar por WhatsApp
            </a>
          </div>

          <div className="mt-10 pt-8 border-t border-[#701A3D]/10 grid grid-cols-2 gap-4 text-sm text-[#374151]">
            <div><strong className="text-[#701A3D]">Disponibilidad:</strong> {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}</div>
            <div><strong className="text-[#701A3D]">Envío:</strong> Nacional 3-5 días</div>
            <div><strong className="text-[#701A3D]">Garantía:</strong> 10 meses</div>
            <div><strong className="text-[#701A3D]">Soporte:</strong> WhatsApp directo</div>
          </div>
        </div>
      </div>
    </div>
  );
}
