"""
Rafli Life Tracker - Backend Health Stub

Semua data & API produksi ditangani oleh Next.js (App Router route handlers)
di `/app/frontend/src/app/api/*`. Backend FastAPI ini hanya sebagai
health-check agar supervisor tetap hidup.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Rafli Life Tracker Health API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "rafli-life-tracker", "layer": "health-stub"}


@app.get("/api/")
def root():
    return {"message": "Rafli Life Tracker API. Data layer runs on the Next.js frontend."}
