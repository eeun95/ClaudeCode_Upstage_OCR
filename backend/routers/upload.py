from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from services.ocr_service import parse_receipt
from services.storage_service import append_expense

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "application/pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

UPLOADS_DIR = Path(__file__).parent.parent / "uploads"


@router.post("/upload", summary="영수증 업로드 및 OCR 파싱")
async def upload_receipt(file: UploadFile = File(...)):
    # 파일 형식 검증
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 파일 형식입니다: {file.content_type}. JPG, PNG, PDF만 허용됩니다.",
        )

    file_bytes = await file.read()

    # 파일 크기 검증
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="파일 크기가 10MB를 초과합니다.",
        )

    # uploads/ 디렉토리에 파일 저장
    UPLOADS_DIR.mkdir(exist_ok=True)
    save_path = UPLOADS_DIR / file.filename
    with open(save_path, "wb") as f:
        f.write(file_bytes)

    # OCR 파싱
    try:
        parsed = parse_receipt(file_bytes, file.content_type, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR 파싱에 실패했습니다. 다시 시도해 주세요. ({str(e)})",
        )

    parsed["raw_image_path"] = f"uploads/{file.filename}"

    # expenses.json에 저장 (id, created_at 자동 부여)
    saved = append_expense(parsed)
    return saved
