from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import os, logging, uuid, bcrypt, jwt, httpx

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Stay Coral Collection API")
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
OWNER_EMAIL = os.environ["OWNER_EMAIL"]


# ---------- Auth helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_token(email: str) -> str:
    payload = {"sub": email, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def require_admin(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.admins.find_one({"email": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------- Models ----------
class LoginInput(BaseModel):
    email: EmailStr
    password: str

class Property(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    category: str          # "historic" | "manga"
    location: str
    tagline: str
    short_desc: str
    description: str
    guests: int
    bedrooms: int
    bathrooms: int
    amenities: List[str] = []
    images: List[str] = []
    airbnb_url: Optional[str] = None
    booking_url: Optional[str] = None
    featured: bool = False
    order: int = 0
    lat: Optional[float] = None
    lng: Optional[float] = None

class InquiryInput(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    checkin: Optional[str] = ""
    checkout: Optional[str] = ""
    guests: Optional[str] = ""
    property_name: Optional[str] = ""
    message: Optional[str] = ""


# ---------- Public routes ----------
@api_router.get("/")
async def root():
    return {"message": "Stay Coral Collection API"}

@api_router.get("/properties", response_model=List[Property])
async def list_properties(category: Optional[str] = None):
    q = {"category": category} if category else {}
    docs = await db.properties.find(q, {"_id": 0}).sort("order", 1).to_list(100)
    return docs

@api_router.get("/properties/{slug}", response_model=Property)
async def get_property(slug: str):
    doc = await db.properties.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Property not found")
    return doc

@api_router.post("/inquiries")
async def create_inquiry(inp: InquiryInput):
    doc = inp.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.inquiries.insert_one({**doc})
    await send_owner_email(doc)
    return {"status": "success", "message": "Inquiry received"}

async def send_owner_email(d: dict):
    rows = "".join(
        f"<tr><td style='padding:6px 12px;color:#3A2C25;font-weight:600'>{k}</td>"
        f"<td style='padding:6px 12px;color:#252525'>{v or '—'}</td></tr>"
        for k, v in [
            ("Name", d.get("name")), ("Email", d.get("email")), ("Phone/WhatsApp", d.get("phone")),
            ("Property", d.get("property_name")), ("Check-in", d.get("checkin")),
            ("Check-out", d.get("checkout")), ("Guests", d.get("guests")), ("Message", d.get("message")),
        ]
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;background:#F7F3EC;padding:24px">
      <table style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#3A2C25;color:#F7F3EC;padding:20px 24px;font-size:20px">
          Stay Coral Collection — New Inquiry</td></tr>
        <tr><td style="padding:16px 12px"><table style="width:100%">{rows}</table></td></tr>
      </table>
    </div>"""
    payload = {"to": [OWNER_EMAIL], "subject": f"New inquiry from {d.get('name')}",
               "html": html, "from_name": EMAIL_FROM_NAME}
    if d.get("email"):
        payload["contact_email"] = d["email"]
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                             headers={"X-Email-Key": EMAIL_KEY}, json=payload)
        r.raise_for_status()
    except Exception as e:
        logger.error(f"Email send failed: {e}")


# ---------- Auth routes ----------
@api_router.post("/auth/login")
async def login(inp: LoginInput):
    email = inp.email.lower()
    user = await db.admins.find_one({"email": email})
    if not user or not verify_password(inp.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": create_token(email), "email": email}

@api_router.get("/auth/me")
async def me(admin: dict = Depends(require_admin)):
    return {"email": admin["email"]}


# ---------- Admin property CRUD ----------
@api_router.post("/admin/properties", response_model=Property)
async def create_prop(prop: Property, admin: dict = Depends(require_admin)):
    exists = await db.properties.find_one({"slug": prop.slug})
    if exists:
        raise HTTPException(status_code=400, detail="Slug already exists")
    await db.properties.insert_one(prop.model_dump())
    return prop

@api_router.put("/admin/properties/{slug}", response_model=Property)
async def update_prop(slug: str, prop: Property, admin: dict = Depends(require_admin)):
    current = await db.properties.find_one({"slug": slug})
    if not current:
        raise HTTPException(status_code=404, detail="Property not found")
    data = prop.model_dump()
    data["slug"] = slug                     # slug is immutable
    data["id"] = current.get("id", data["id"])
    await db.properties.update_one({"slug": slug}, {"$set": data})
    return Property(**data)

@api_router.delete("/admin/properties/{slug}")
async def delete_prop(slug: str, admin: dict = Depends(require_admin)):
    res = await db.properties.delete_one({"slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"status": "deleted"}

@api_router.get("/admin/inquiries")
async def list_inquiries(admin: dict = Depends(require_admin)):
    return await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# ---------- Seed ----------
SEED_PROPERTIES = [
    {
        "slug": "joya-de-cartagena", "name": "Joya de Cartagena",
        "category": "historic", "location": "Historic Center · Cartagena",
        "tagline": "Clock Tower & Sea Balcony",
        "short_desc": "An elegant Historic Center residence with unmatched Caribbean sea and city-wall views.",
        "description": "Vive Cartagena desde un elegante apartamento en el Centro Histórico con una vista inigualable del mar Caribe, las murallas y los más espectaculares atardeceres de la ciudad. Su moderna decoración combina estilo y comodidad para una estancia inolvidable. Ideal para 4 personas, cuenta con cama doble, sofá cama, cocina equipada y una ubicación privilegiada a pocos pasos de restaurantes, plazas y los principales atractivos turísticos de Cartagena.",
        "guests": 4, "bedrooms": 1, "bathrooms": 1,
        "amenities": ["Wi-Fi", "Air conditioning", "Equipped kitchen", "Sea-view balcony", "Smart TV", "Workspace", "Historic Center location"],
        "images": ["https://images.unsplash.com/photo-1643376452350-97eadd2c417f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
                   "https://images.unsplash.com/photo-1715503485452-89d50b42ff5d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
                   "https://images.unsplash.com/photo-1723257133428-fc8f16185cf0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "airbnb_url": "https://www.airbnb.com/rooms/1714620022302650838",
        "featured": True, "order": 1, "lat": 10.4236, "lng": -75.5518,
    },
    {
        "slug": "mirador-del-caribe", "name": "Mirador del Caribe",
        "category": "historic", "location": "Historic Center · Cartagena",
        "tagline": "Clock Tower & Sea Balcony",
        "short_desc": "A refined stay with the best views of the city — sea, walls and sunsets from your balcony.",
        "description": "Disfruta de Cartagena desde un exclusivo apartamento en el Centro Histórico, con la mejor vista de la ciudad. Admira el mar Caribe, las murallas y espectaculares atardeceres desde un espacio diseñado para tu comodidad. Ideal para 4 personas, cuenta con una habitación con cama doble, un sofá cama, una cocina equipada y una ubicación privilegiada a pocos pasos de los principales atractivos, restaurantes y plazas históricas.",
        "guests": 4, "bedrooms": 1, "bathrooms": 1,
        "amenities": ["Wi-Fi", "Air conditioning", "Equipped kitchen", "Sea-view balcony", "Smart TV", "Historic Center location"],
        "images": ["https://images.unsplash.com/photo-1723257133428-fc8f16185cf0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
                   "https://images.unsplash.com/photo-1633627397446-04c7fca71c74?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
                   "https://images.unsplash.com/photo-1643376452350-97eadd2c417f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "airbnb_url": "https://www.airbnb.com/rooms/1713732640738452692",
        "featured": True, "order": 2, "lat": 10.4238, "lng": -75.5515,
    },
    {
        "slug": "entre-mar-y-reloj", "name": "Entre Mar y Reloj",
        "category": "historic", "location": "Historic Center · Cartagena",
        "tagline": "Clock Tower & Sea View for 8",
        "short_desc": "Two adjoining residences for larger groups, with sweeping sea and Walled City views.",
        "description": "Vive Cartagena desde dos elegantes apartamentos aledaños en el Centro Histórico con una vista inigualable del mar Caribe, las murallas y los más espectaculares atardeceres de la ciudad. Su moderna decoración combina estilo y comodidad para una estancia inolvidable. Ideal para 8 personas, cuenta con 2 camas dobles, 2 sofás cama, cocinas equipadas y una ubicación privilegiada a pocos pasos de los principales atractivos turísticos de Cartagena.",
        "guests": 8, "bedrooms": 2, "bathrooms": 2,
        "amenities": ["Wi-Fi", "Air conditioning", "Two equipped kitchens", "Sea-view balconies", "Smart TV", "Ideal for groups", "Historic Center location"],
        "images": ["https://images.unsplash.com/photo-1535528775514-4b2e1ce44dda?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
                   "https://images.unsplash.com/photo-1643376452350-97eadd2c417f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
                   "https://images.unsplash.com/photo-1723257133428-fc8f16185cf0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "airbnb_url": "https://www.airbnb.com/rooms/1716142986698860368",
        "featured": False, "order": 3, "lat": 10.4240, "lng": -75.5512,
    },
    {
        "slug": "brisa-de-manga-i", "name": "Brisa de Manga I",
        "category": "manga", "location": "Manga · Cartagena",
        "tagline": "Balcony & near Centro Histórico",
        "short_desc": "A cozy, comfortable apartment in the vibrant Manga neighborhood, steps from the bay.",
        "description": "Descubre el encanto de Manga en este acogedor apartamento ideal para 4 personas. Ubicado en un barrio vibrante lleno de restaurantes y a pasos de la bahía de Manga, ofrece una habitación con una cama doble y en su sala un sofá cama, cocina totalmente equipada y un ambiente cálido. Perfecto para descansar y disfrutar de la ciudad, ya sea que viajes por trabajo o placer.",
        "guests": 4, "bedrooms": 1, "bathrooms": 1,
        "amenities": ["Wi-Fi", "Air conditioning", "Equipped kitchen", "Balcony", "Workspace", "Near bay & restaurants"],
        "images": ["https://images.unsplash.com/photo-1737898401256-be74592ec8b2?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
                   "https://images.unsplash.com/photo-1701789575035-e55a9ef971c6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "airbnb_url": "https://www.airbnb.com/rooms/1261012844367200342",
        "featured": False, "order": 4, "lat": 10.4092, "lng": -75.5390,
    },
    {
        "slug": "brisas-de-manga-ii", "name": "Brisas de Manga II",
        "category": "manga", "location": "Manga · Cartagena",
        "tagline": "Patio & near Centro Histórico",
        "short_desc": "A warm apartment with patio in Manga — authentic local living with excellent value.",
        "description": "Descubre la magia de Manga en este acogedor apartamento ideal para 4 personas. Ubicado en un barrio vibrante lleno de restaurantes y a pasos de la bahía de Manga, ofrece una habitación con una cama doble y en su sala un sofá cama, cocina totalmente equipada y un ambiente cálido. Perfecto para descansar y disfrutar de la ciudad, ya sea que viajes por trabajo o placer.",
        "guests": 4, "bedrooms": 1, "bathrooms": 1,
        "amenities": ["Wi-Fi", "Air conditioning", "Equipped kitchen", "Private patio", "Workspace", "Near bay & restaurants"],
        "images": ["https://images.unsplash.com/photo-1701789575035-e55a9ef971c6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
                   "https://images.unsplash.com/photo-1737898401256-be74592ec8b2?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"],
        "airbnb_url": "https://www.airbnb.com/rooms/1715661205992425045",
        "featured": False, "order": 5, "lat": 10.4088, "lng": -75.5395,
    },
]

@app.on_event("startup")
async def startup():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    existing = await db.admins.find_one({"email": admin_email})
    if not existing:
        await db.admins.insert_one({"email": admin_email, "password_hash": hash_password(admin_pw)})
    elif not verify_password(admin_pw, existing["password_hash"]):
        await db.admins.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})
    for p in SEED_PROPERTIES:
        found = await db.properties.find_one({"slug": p["slug"]})
        doc = Property(**p).model_dump()
        if not found:
            await db.properties.insert_one(doc)

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware, allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"], allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
