
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import psycopg2
import os



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when using '*'
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/api/v1")

DB_NAME = os.getenv("DB_NAME", "eternelles")
DB_USER = os.getenv("DB_USER", "explorer")
DB_PASSWORD = os.getenv("DB_PASSWORD", "eoex_password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

class Registration(BaseModel):
    prenom: str
    nom: str
    email: EmailStr
    ville: str
    pays: str
    category: str

@router.post("/users")
def register_user(reg: Registration):
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO inscription (prenom, nom, email, ville, pays, category, password)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (reg.prenom, reg.nom, reg.email, reg.ville, reg.pays, reg.category, 'Password123')
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"id": user_id, "message": "Registration successful"}

    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(router)
