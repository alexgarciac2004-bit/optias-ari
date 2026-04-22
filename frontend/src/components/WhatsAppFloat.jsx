import React from "react";
import { waLink } from "../lib/api";

export default function WhatsAppFloat() {
  return (
    <a
      href={waLink("Hola Óptica Ari, me interesa conocer más sobre sus lentes.")}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 wa-pulse bg-[#25D366] hover:scale-110 transition-transform w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
      data-testid="whatsapp-float"
      aria-label="Chatea por WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 text-white" fill="currentColor" aria-hidden="true">
        <path d="M19.11 17.21c-.29-.15-1.7-.84-1.96-.93-.26-.1-.45-.15-.64.15-.19.29-.73.93-.9 1.12-.17.19-.33.22-.62.07-.29-.15-1.23-.45-2.34-1.45-.87-.77-1.45-1.73-1.62-2.02-.17-.29-.02-.45.13-.6.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49l-.55-.01c-.19 0-.5.07-.76.36s-1 .98-1 2.39 1.03 2.78 1.17 2.97c.15.19 2.03 3.1 4.92 4.35.69.3 1.23.47 1.65.6.69.22 1.32.19 1.82.12.56-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34zM16 3C9.38 3 4 8.38 4 15c0 2.31.66 4.47 1.8 6.3L4 29l7.9-1.76A11.95 11.95 0 0016 27c6.62 0 12-5.38 12-12S22.62 3 16 3z"/>
      </svg>
    </a>
  );
}
