from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

# File upload directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== Models ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    hashed_password: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reserve_name: str
    title: str
    description: str
    requirements: str
    location: str
    employment_type: str
    salary_range: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobCreate(BaseModel):
    reserve_name: str
    title: str
    description: str
    requirements: str
    location: str
    employment_type: str
    salary_range: Optional[str] = None

class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    full_name: str
    email: EmailStr
    phone: str
    address: str
    cover_letter: str
    resume_path: str
    status: str = "pending"
    applied_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ApplicationCreate(BaseModel):
    job_id: str
    full_name: str
    email: EmailStr
    phone: str
    address: str
    cover_letter: str

# ==================== Helper Functions ====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"username": username}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized. Admin access required.")
    return current_user

# ==================== Routes ====================

@api_router.get("/")
async def root():
    return {"message": "Wildlife Reserve Jobs API"}

# Auth Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if username exists
    existing_user = await db.users.find_one({"username": user_data.username}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email exists
    existing_email = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        is_admin=False
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user.username})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={"username": user.username, "email": user.email, "is_admin": user.is_admin}
    )

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if not verify_password(credentials.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": user['username']})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={"username": user['username'], "email": user['email'], "is_admin": user['is_admin']}
    )

# Job Routes
@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(reserve: Optional[str] = None):
    query = {}
    if reserve:
        query['reserve_name'] = reserve
    
    jobs = await db.jobs.find(query, {"_id": 0}).to_list(1000)
    
    for job in jobs:
        if isinstance(job['created_at'], str):
            job['created_at'] = datetime.fromisoformat(job['created_at'])
    
    return jobs

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if isinstance(job['created_at'], str):
        job['created_at'] = datetime.fromisoformat(job['created_at'])
    
    return Job(**job)

@api_router.post("/jobs", response_model=Job)
async def create_job(job_data: JobCreate, current_user: User = Depends(get_current_admin)):
    job = Job(**job_data.model_dump())
    
    doc = job.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.jobs.insert_one(doc)
    
    return job

# Application Routes
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"filename": unique_filename, "path": str(file_path)}

@api_router.post("/applications", response_model=Application)
async def create_application(application_data: ApplicationCreate, resume_filename: str):
    application = Application(
        **application_data.model_dump(),
        resume_path=resume_filename
    )
    
    doc = application.model_dump()
    doc['applied_at'] = doc['applied_at'].isoformat()
    await db.applications.insert_one(doc)
    
    return application

@api_router.get("/applications", response_model=List[Application])
async def get_applications(current_user: User = Depends(get_current_admin)):
    applications = await db.applications.find({}, {"_id": 0}).to_list(1000)
    
    for app in applications:
        if isinstance(app['applied_at'], str):
            app['applied_at'] = datetime.fromisoformat(app['applied_at'])
    
    return applications

# Source Code Route (Admin Only)
@api_router.get("/source-code")
async def get_source_code(current_user: User = Depends(get_current_admin)):
    source_files = {}
    
    # Backend files
    backend_files = [
        '/app/backend/server.py',
        '/app/backend/requirements.txt',
        '/app/backend/.env'
    ]
    
    for file_path in backend_files:
        try:
            with open(file_path, 'r') as f:
                source_files[file_path] = f.read()
        except Exception as e:
            source_files[file_path] = f"Error reading file: {str(e)}"
    
    # Frontend files
    frontend_files = [
        '/app/frontend/src/App.js',
        '/app/frontend/src/App.css',
        '/app/frontend/src/index.css',
        '/app/frontend/package.json'
    ]
    
    for file_path in frontend_files:
        try:
            with open(file_path, 'r') as f:
                source_files[file_path] = f.read()
        except Exception as e:
            source_files[file_path] = f"Error reading file: {str(e)}"
    
    # Get all component files
    components_dir = Path('/app/frontend/src/components')
    if components_dir.exists():
        for comp_file in components_dir.rglob('*.js'):
            try:
                with open(comp_file, 'r') as f:
                    source_files[str(comp_file)] = f.read()
            except Exception as e:
                source_files[str(comp_file)] = f"Error reading file: {str(e)}"
    
    return {"source_files": source_files}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()