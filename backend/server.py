from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
STRIPE_API_KEY = os.environ["STRIPE_API_KEY"]

app = FastAPI(title="Óptica Ari API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ---------- Models ----------
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    brand: Optional[str] = ""
    description: str = ""
    price: float
    image: str
    style: str  # Clásico, Moderno, Deportivo, Vintage, Infantil, Oversize
    type: str  # Sol, Graduados, Lectura, Contacto
    gender: str = "Unisex"
    stock: int = 10
    featured: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProductCreate(BaseModel):
    name: str
    brand: Optional[str] = ""
    description: str = ""
    price: float
    image: str
    style: str
    type: str
    gender: str = "Unisex"
    stock: int = 10
    featured: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    style: Optional[str] = None
    type: Optional[str] = None
    gender: Optional[str] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    email: str


class CartItem(BaseModel):
    product_id: str
    quantity: int


class QuoteRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    message: Optional[str] = ""
    items: List[CartItem] = []


class CheckoutRequest(BaseModel):
    items: List[CartItem]
    origin_url: str
    customer_name: Optional[str] = ""
    customer_email: Optional[str] = ""


# ---------- Auth helpers ----------
def create_token(email: str) -> str:
    payload = {
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("email") != ADMIN_EMAIL:
            raise HTTPException(status_code=401, detail="No autorizado")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesión expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


# ---------- Routes: Public ----------
@api_router.get("/")
async def root():
    return {"message": "Óptica Ari API"}


@api_router.get("/products", response_model=List[Product])
async def list_products(style: Optional[str] = None, type: Optional[str] = None, featured: Optional[bool] = None):
    query: Dict = {}
    if style:
        query["style"] = style
    if type:
        query["type"] = type
    if featured is not None:
        query["featured"] = featured
    items = await db.products.find(query, {"_id": 0}).to_list(500)
    return items


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@api_router.post("/quotes")
async def create_quote(q: QuoteRequest):
    doc = {
        "id": str(uuid.uuid4()),
        "name": q.name,
        "phone": q.phone,
        "email": q.email,
        "message": q.message,
        "items": [i.model_dump() for i in q.items],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
    }
    await db.quotes.insert_one(doc.copy())
    return {"ok": True, "id": doc["id"]}


# ---------- Routes: Appointments ----------
SERVICES = {
    "Examen visual completo": 30,
    "Adaptación lentes de contacto": 45,
    "Ajuste y mantenimiento": 15,
    "Asesoría de marcos": 30,
}
# Hours: Mon-Sat 9:00-19:00, lunch 14:00-15:00. Sunday closed.
WORK_HOURS = [(9, 14), (15, 19)]


def _generate_slots() -> List[str]:
    slots = []
    for start_h, end_h in WORK_HOURS:
        h = start_h
        m = 0
        while h < end_h or (h == end_h and m == 0):
            if h == end_h and m > 0:
                break
            slots.append(f"{h:02d}:{m:02d}")
            m += 30
            if m >= 60:
                m = 0
                h += 1
    return slots


class AppointmentCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = ""
    service: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    notes: Optional[str] = ""


class AppointmentStatusUpdate(BaseModel):
    status: str  # pending | confirmed | completed | cancelled


@api_router.get("/appointments/services")
async def list_services():
    return [{"name": k, "duration_min": v} for k, v in SERVICES.items()]


@api_router.get("/appointments/availability")
async def get_availability(date: str):
    try:
        d = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Fecha inválida (use YYYY-MM-DD)")
    if d.weekday() == 6:  # Sunday
        return {"date": date, "slots": [], "closed": True, "reason": "Domingo cerrado"}
    all_slots = _generate_slots()
    taken = await db.appointments.find(
        {"date": date, "status": {"$in": ["pending", "confirmed"]}},
        {"_id": 0, "time": 1},
    ).to_list(200)
    taken_set = {t["time"] for t in taken}
    available = [s for s in all_slots if s not in taken_set]
    return {"date": date, "slots": available, "taken": list(taken_set), "closed": False}


@api_router.post("/appointments")
async def create_appointment(a: AppointmentCreate):
    if a.service not in SERVICES:
        raise HTTPException(status_code=400, detail="Servicio no válido")
    try:
        d = datetime.strptime(a.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Fecha inválida")
    if d.weekday() == 6:
        raise HTTPException(status_code=400, detail="No hay servicio los domingos")
    if a.time not in _generate_slots():
        raise HTTPException(status_code=400, detail="Horario fuera de servicio")
    # Check no other active appointment for that date+time
    conflict = await db.appointments.find_one(
        {"date": a.date, "time": a.time, "status": {"$in": ["pending", "confirmed"]}},
        {"_id": 0},
    )
    if conflict:
        raise HTTPException(status_code=409, detail="Ese horario ya fue reservado")
    doc = {
        "id": str(uuid.uuid4()),
        "customer_name": a.customer_name,
        "customer_phone": a.customer_phone,
        "customer_email": a.customer_email or "",
        "service": a.service,
        "date": a.date,
        "time": a.time,
        "notes": a.notes or "",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.appointments.insert_one(doc.copy())
    return {"ok": True, "id": doc["id"], "appointment": doc}


@api_router.get("/admin/appointments")
async def list_appointments(_: dict = Depends(verify_admin), status_filter: Optional[str] = None):
    q = {}
    if status_filter:
        q["status"] = status_filter
    items = await db.appointments.find(q, {"_id": 0}).sort([("date", 1), ("time", 1)]).to_list(1000)
    return items


@api_router.put("/admin/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, body: AppointmentStatusUpdate, _: dict = Depends(verify_admin)):
    if body.status not in ("pending", "confirmed", "completed", "cancelled"):
        raise HTTPException(status_code=400, detail="Estado inválido")
    res = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": body.status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    appt = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    return appt


@api_router.delete("/admin/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, _: dict = Depends(verify_admin)):
    res = await db.appointments.delete_one({"id": appointment_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return {"ok": True}


# ---------- Routes: Admin Auth ----------
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    if req.email.lower() != ADMIN_EMAIL.lower() or req.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = create_token(ADMIN_EMAIL)
    return LoginResponse(token=token, email=ADMIN_EMAIL)


@api_router.get("/auth/me")
async def me(_: dict = Depends(verify_admin)):
    return {"email": ADMIN_EMAIL}


# ---------- Routes: Admin Product CRUD ----------
@api_router.post("/admin/products", response_model=Product)
async def create_product(p: ProductCreate, _: dict = Depends(verify_admin)):
    product = Product(**p.model_dump())
    await db.products.insert_one(product.model_dump().copy())
    return product


@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, p: ProductUpdate, _: dict = Depends(verify_admin)):
    update_data = {k: v for k, v in p.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Sin cambios")
    res = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product


@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, _: dict = Depends(verify_admin)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"ok": True}


@api_router.get("/admin/quotes")
async def list_quotes(_: dict = Depends(verify_admin)):
    quotes = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return quotes


@api_router.get("/admin/transactions")
async def list_transactions(_: dict = Depends(verify_admin)):
    txs = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return txs


@api_router.post("/checkout/session")
async def create_checkout(req: CheckoutRequest, http_request: Request):
    if not req.items:
        raise HTTPException(status_code=400, detail="Carrito vacío")

    # Compute total from backend (never trust frontend)
    total_cents = 0
    total_amount = 0.0
    line_summary = []
    for item in req.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto {item.product_id} no encontrado")
        qty = max(1, int(item.quantity))
        subtotal = float(product["price"]) * qty
        total_amount += subtotal
        total_cents += int(round(subtotal * 100))
        line_summary.append({"product_id": product["id"], "name": product["name"], "qty": qty, "price": product["price"]})

    total_amount = round(total_amount, 2)

    webhook_url = f"{str(http_request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    origin = req.origin_url.rstrip("/")
    success_url = f"{origin}/pago/exito?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/carrito"

    metadata = {
        "customer_name": req.customer_name or "",
        "customer_email": req.customer_email or "",
        "source": "optica_ari_checkout",
    }
    checkout_req = CheckoutSessionRequest(
        amount=total_amount,
        currency="mxn",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_req)

    tx_doc = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "amount": total_amount,
        "currency": "mxn",
        "metadata": metadata,
        "items": line_summary,
        "customer_name": req.customer_name or "",
        "customer_email": req.customer_email or "",
        "payment_status": "initiated",
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(tx_doc.copy())

    return {"url": session.url, "session_id": session.session_id}


@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, http_request: Request):
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    if tx.get("payment_status") == "paid":
        return {
            "session_id": session_id,
            "status": tx.get("status"),
            "payment_status": tx.get("payment_status"),
            "amount_total": int(round(tx.get("amount", 0) * 100)),
            "currency": tx.get("currency"),
        }

    webhook_url = f"{str(http_request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        status_resp: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    except Exception as e:
        logging.error(f"Stripe get_checkout_status error: {e}")
        # Return current stored status if Stripe is unreachable/unknown
        return {
            "session_id": session_id,
            "status": tx.get("status", "open"),
            "payment_status": tx.get("payment_status", "initiated"),
            "amount_total": int(round(tx.get("amount", 0) * 100)),
            "currency": tx.get("currency", "mxn"),
            "note": "stripe_unavailable",
        }

    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "status": status_resp.status,
                "payment_status": status_resp.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    return {
        "session_id": session_id,
        "status": status_resp.status,
        "payment_status": status_resp.payment_status,
        "amount_total": status_resp.amount_total,
        "currency": status_resp.currency,
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        resp = await stripe_checkout.handle_webhook(body, signature)
        if resp.session_id:
            await db.payment_transactions.update_one(
                {"session_id": resp.session_id},
                {
                    "$set": {
                        "payment_status": resp.payment_status,
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }
                },
            )
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True}


# ---------- Seed demo data ----------
DEMO_PRODUCTS = [
    {
        "name": "Dignity DG-65003 · Acetate Black",
        "brand": "Dignity Eyewear",
        "description": "Marco cuadrado en acetato hecho a mano. Frente negro con base cristal transparente, varillas tono jade. Estilo contemporáneo y elegante.",
        "price": 1300.0,
        "image": "https://customer-assets.emergentagent.com/job_optica-ari/artifacts/2vjuhd3z_1%2C300%20modelo%202.jpeg",
        "style": "Moderno", "type": "Graduados", "gender": "Unisex", "stock": 5, "featured": True,
    },
    {
        "name": "Eternal Glamour 0378 · Aviador Doble Puente",
        "brand": "Eternal Glamour",
        "description": "Aviador cuadrado con doble puente metálico plata y frente acetato negro. Diseño de carácter inspirado en la elegancia italiana.",
        "price": 1600.0,
        "image": "https://customer-assets.emergentagent.com/job_optica-ari/artifacts/o44kjd12_1%2C600%20modelo%203.jpeg",
        "style": "Vintage", "type": "Graduados", "gender": "Hombre", "stock": 4, "featured": True,
    },
    {
        "name": "St. Bar STB-19001 · Stainless Steel",
        "brand": "St. Bar Eyewear",
        "description": "Marco aviador cuadrado en acero inoxidable plateado. Ligero, resistente y atemporal — un clásico que nunca pasa de moda.",
        "price": 1300.0,
        "image": "https://customer-assets.emergentagent.com/job_optica-ari/artifacts/20p3kj7h_1%2C300%20modelo%204.jpeg",
        "style": "Clásico", "type": "Graduados", "gender": "Hombre", "stock": 5, "featured": True,
    },
]


@app.on_event("startup")
async def seed_data():
    count = await db.products.count_documents({})
    if count == 0:
        docs = [Product(**p).model_dump() for p in DEMO_PRODUCTS]
        await db.products.insert_many([d.copy() for d in docs])
        logging.info(f"Seeded {len(docs)} demo products")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
