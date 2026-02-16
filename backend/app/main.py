from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
import hashlib

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Simple password hashing for demonstration (replace with bcrypt/argon2 in production)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/login")
def login_user(login: LoginRequest):
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
            SELECT id, prenom, nom, email, ville, pays, category, password FROM inscription WHERE email = %s
            """,
            (login.email,)
        )
        user = cur.fetchone()
        cur.close()
        conn.close()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        # Password check (plain for demo, hash in production)
        db_password = user[7]
        if login.password != db_password:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return {
            "id": user[0],
            "prenom": user[1],
            "nom": user[2],
            "email": user[3],
            "ville": user[4],
            "pays": user[5],
            "category": user[6]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
