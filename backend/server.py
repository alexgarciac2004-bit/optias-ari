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


# ---------- Routes: Stripe Checkout ----------
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
    {"name": "Aviador Clásico Dorado", "brand": "Ari Signature", "description": "Marco aviador en metal dorado con lentes polarizadas UV400.", "price": 1890.0, "image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80", "style": "Clásico", "type": "Sol", "gender": "Unisex", "stock": 15, "featured": True},
    {"name": "Wayfarer Moderno Negro", "brand": "Ari Studio", "description": "Estilo wayfarer con acetato negro mate. Ligeros y elegantes.", "price": 1450.0, "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80", "style": "Moderno", "type": "Sol", "gender": "Unisex", "stock": 20, "featured": True},
    {"name": "Cat-Eye Vintage Tortuga", "brand": "Ari Heritage", "description": "Diseño ojo de gato inspirado en los años 60. Acetato tortuga.", "price": 1750.0, "image": "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80", "style": "Vintage", "type": "Graduados", "gender": "Mujer", "stock": 12, "featured": True},
    {"name": "Sport Pro Deportivo", "brand": "Ari Active", "description": "Lente deportivo envolvente con protección máxima y agarre antideslizante.", "price": 2100.0, "image": "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80", "style": "Deportivo", "type": "Sol", "gender": "Unisex", "stock": 18, "featured": True},
    {"name": "Round Lector Oro Rosa", "brand": "Ari Read", "description": "Lentes de lectura redondos con montura oro rosa. Ligeros.", "price": 980.0, "image": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80", "style": "Clásico", "type": "Lectura", "gender": "Unisex", "stock": 30, "featured": False},
    {"name": "Oversize Square Nude", "brand": "Ari Couture", "description": "Marco cuadrado oversize en color nude con lentes degradadas.", "price": 2250.0, "image": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80", "style": "Oversize", "type": "Sol", "gender": "Mujer", "stock": 10, "featured": True},
    {"name": "Kids Flex Infantil Azul", "brand": "Ari Kids", "description": "Montura flexible para niños en azul vibrante. Resistente a golpes.", "price": 890.0, "image": "https://images.unsplash.com/photo-1577744486770-020ab432da65?w=800&q=80", "style": "Infantil", "type": "Graduados", "gender": "Niño", "stock": 25, "featured": False},
    {"name": "Pantos Moderno Transparente", "brand": "Ari Studio", "description": "Marco pantos acetato cristal transparente. Ultra minimalista.", "price": 1650.0, "image": "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80", "style": "Moderno", "type": "Graduados", "gender": "Unisex", "stock": 14, "featured": False},
    {"name": "Retro Round Vintage Oro", "brand": "Ari Heritage", "description": "Lente redondo retro con montura dorada metálica fina.", "price": 1390.0, "image": "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80", "style": "Vintage", "type": "Sol", "gender": "Unisex", "stock": 16, "featured": False},
    {"name": "Rimless Clásico Titanio", "brand": "Ari Signature", "description": "Montura al aire en titanio puro. Prácticamente invisible.", "price": 2890.0, "image": "https://images.unsplash.com/photo-1568412686359-de74a2b55cb6?w=800&q=80", "style": "Clásico", "type": "Graduados", "gender": "Hombre", "stock": 8, "featured": True},
    {"name": "Performance Ciclismo", "brand": "Ari Active", "description": "Máscara envolvente para ciclismo, ultraligera, lente espejada.", "price": 1980.0, "image": "https://images.unsplash.com/photo-1625591341337-13156be7b7d1?w=800&q=80", "style": "Deportivo", "type": "Sol", "gender": "Unisex", "stock": 12, "featured": False},
    {"name": "Butterfly Oversize Negro", "brand": "Ari Couture", "description": "Forma mariposa en negro sólido con detalles dorados en las esquinas.", "price": 2390.0, "image": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80", "style": "Oversize", "type": "Sol", "gender": "Mujer", "stock": 9, "featured": False},
    {"name": "Kids Square Rosa", "brand": "Ari Kids", "description": "Montura cuadrada rosa para niñas, cómoda y resistente.", "price": 820.0, "image": "https://images.unsplash.com/photo-1513146234495-a5a8d1c5c47c?w=800&q=80", "style": "Infantil", "type": "Graduados", "gender": "Niña", "stock": 22, "featured": False},
    {"name": "Browline Vintage Tortuga", "brand": "Ari Heritage", "description": "Estilo browline clásico de los 50. Combinación metal y acetato tortuga.", "price": 1590.0, "image": "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&q=80", "style": "Vintage", "type": "Graduados", "gender": "Hombre", "stock": 11, "featured": False},
    {"name": "Hexagonal Moderno Oro", "brand": "Ari Studio", "description": "Forma hexagonal única con marco dorado y lentes verdes.", "price": 1890.0, "image": "https://images.unsplash.com/photo-1615812214207-34e3be6812df?w=800&q=80", "style": "Moderno", "type": "Sol", "gender": "Unisex", "stock": 13, "featured": False},
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
