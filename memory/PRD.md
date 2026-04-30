# Óptica Ari — PRD

## Problem Statement (original)
> crea una pagian para una optica que se llama "Optica Ari" que se a porfecional usa una paleta de colores refetenet al tema, el objetivo de la pagina es que la gente nos conosca, pueda ver todos los lentes, pueda selecionarl su tipo de lentes de pemdiendo de su estilo asi como poder realisar una cotisacion o venta idrecto en la pagian, tambien añde un boton de whats app para que nos manden mesaje directo es a este numero:9995106899

## Architecture
- **Backend**: FastAPI + MongoDB (motor) + emergentintegrations (Stripe) + JWT auth
- **Frontend**: React 19 + React Router + Tailwind + shadcn/ui + sonner
- **Design**: Playfair Display (serif) + Outfit (sans) · Navy `#0B1B3D` · Gold `#C5A059` · Ivory `#FAFAFA`
- **Payments**: Stripe Checkout (MXN) via emergentintegrations + payment_transactions collection
- **Auth**: Single admin (env-seeded), JWT (7-day expiry)

## User Personas
1. **Visitor/Customer** (Spanish-speaking, Mexico) — browses catalog, filters by style, adds to cart, pays or requests quote via WhatsApp.
2. **Admin (Ari)** — logs in with email+password to manage products/quotes/transactions.

## Core Requirements (static)
- Spanish UI
- Deep navy + white + gold professional palette
- Product catalog with filters by style (Clásico, Moderno, Deportivo, Vintage, Infantil, Oversize) and type (Sol, Graduados, Lectura, Contacto)
- Shopping cart + Stripe checkout + success page
- WhatsApp quote flow (number +52 9995106899)
- Floating WhatsApp CTA on all public pages
- Password-protected admin to CRUD products, view quotes & transactions

## Implemented (2026-02 → 2026-04)
- Public pages: Home (hero, styles grid, featured, values, split CTA), Catálogo (filters, sort), Detalle de producto, Nosotros, Contacto
- **Reserva de citas online (`/citas`)** con calendario visual, slots dinámicos, validación servidor (conflictos, domingos cerrados, horarios fuera de servicio)
- Cart drawer with WhatsApp quote and Stripe checkout
- Checkout success page with polling
- Admin login + dashboard (productos, **citas con cambio de estado**, cotizaciones, transacciones)
- 15 seeded demo products + 4 servicios de cita seedados (Examen visual, Adaptación contacto, Ajuste, Asesoría)
- Floating WhatsApp button on all public pages
- **TopBar** con datos de contacto + **PromoBar** rotatoria + **Mega-menú** Catálogo

## Backlog
- P1: Email notifications on new quote (SendGrid/Resend)
- P1: Multiple product images + zoom on detail page
- P2: Customer reviews / testimonials section
- P2: Discount codes / promotions
- P2: Blog/news section for vision-care tips
- P2: Online appointment booking calendar

## Test Credentials
See `/app/memory/test_credentials.md`
