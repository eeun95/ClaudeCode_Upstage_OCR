import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# 프로젝트 루트의 .env 로드 (backend/ 한 단계 위)
load_dotenv(Path(__file__).parent.parent / ".env")

app = FastAPI(
    title="영수증 지출 관리 API",
    description="Upstage Vision LLM 기반 영수증 OCR 및 지출 관리 서비스",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# uploads 디렉토리 자동 생성
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# 라우터 등록 (Phase 2에서 구현)
# from routers import upload, expenses, summary
# app.include_router(upload.router, prefix="/api")
# app.include_router(expenses.router, prefix="/api")
# app.include_router(summary.router, prefix="/api")


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "message": "영수증 지출 관리 API가 실행 중입니다."}
