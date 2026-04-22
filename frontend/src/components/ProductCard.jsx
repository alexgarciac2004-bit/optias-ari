import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { add } = useCart();
  return (
    <article
      className="prod-card bg-white border border-[#0B1B3D]/10 group"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/producto/${product.id}`} className="block overflow-hidden bg-[#F1F5F9]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
      </Link>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="eyebrow text-[#C5A059]">{product.style}</span>
          <span className="text-xs text-[#64748B]">· {product.type}</span>
        </div>
        <Link to={`/producto/${product.id}`}>
          <h3 className="font-serif text-xl text-[#0B1B3D] leading-tight mb-2 hover:text-[#C5A059] transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-[#64748B] mb-5 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="font-serif text-2xl text-[#0B1B3D]" data-testid={`product-price-${product.id}`}>
            ${product.price.toLocaleString("es-MX", { minimumFractionDigits: 0 })} <span className="text-xs text-[#64748B]">MXN</span>
          </div>
          <button
            onClick={() => add(product)}
            className="text-xs font-semibold uppercase tracking-widest text-[#0B1B3D] hover:text-[#C5A059] border-b border-transparent hover:border-[#C5A059] transition-colors pb-1"
            data-testid={`add-to-cart-${product.id}`}
          >
            Añadir
          </button>
        </div>
      </div>
    </article>
  );
}
