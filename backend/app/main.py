import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles

from app.routers import auth, reports
from app.core.db import mongodb_client

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await mongodb_client.start_client(os.getenv("MONGODB_URL"), os.getenv("DB_NAME"))
    print("Connected to MongoDB!")

@app.on_event("shutdown")
async def shutdown_event():
    await mongodb_client.close_client()
    print("MongoDB connection closed!")

# Set a high-level API prefix
app.include_router(auth.router, prefix="/auth")
app.include_router(reports.router, prefix="/api/v1") # <-- All reports endpoints are now under this
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")