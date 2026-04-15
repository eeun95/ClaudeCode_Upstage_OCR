# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 프로젝트 개요

영수증(이미지/PDF)을 업로드하면 **Upstage Vision LLM**이 자동 파싱하여 구조화된 지출 데이터로 변환하는 경량 웹 애플리케이션 (1일 스프린트 MVP).

- DB 미사용: `backend/data/expenses.json` 파일 기반 저장
- 배포 대상: Vercel (프론트엔드 정적 빌드 + 백엔드 서버리스)

---

## 기술 스택

| 계층 | 기술 |
|------|------|
| 프론트엔드 | React 18 + Vite 5 + TailwindCSS 3 + Axios |
| 백엔드 | Python FastAPI 0.111+ |
| AI/OCR | LangChain 0.2+ + Upstage Document AI (`document-digitization-vision`) |
| 이미지 처리 | Pillow, pdf2image |
| 데이터 저장 | JSON 파일 (`backend/data/expenses.json`) |
| 배포 | Vercel (GitHub 자동 배포) |

---

## 프로젝트 구조

```
receipt-tracker/
├── frontend/
│   ├── src/
│   │   ├── pages/        # Dashboard, UploadPage, ExpenseDetail
│   │   ├── components/   # Badge, Modal, Toast 등 공통 컴포넌트
│   │   └── api/          # Axios 인스턴스 및 API 호출 함수
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py           # FastAPI 앱 진입점
│   ├── routers/          # 라우터별 엔드포인트 정의
│   ├── services/         # LangChain + Upstage OCR 로직
│   ├── data/
│   │   └── expenses.json # 지출 데이터 누적 저장소
│   └── requirements.txt
├── vercel.json           # Vercel 빌드 및 라우팅 설정
└── images/               # 테스트용 영수증 샘플 이미지/PDF
```

---

## 개발 명령어

### 백엔드 (FastAPI)

```bash
# 가상환경 생성 및 의존성 설치
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 개발 서버 실행 (기본 포트: 8000)
uvicorn main:app --reload
```

### 프론트엔드 (React + Vite)

```bash
# 의존성 설치
cd frontend
npm install

# 개발 서버 실행 (기본 포트: 5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

---

## 환경 변수

`.env` 파일을 프로젝트 루트 또는 `backend/`에 생성 (절대 커밋 금지):

| 변수명 | 설명 | 위치 |
|--------|------|------|
| `UPSTAGE_API_KEY` | Upstage Document AI 인증 키 | 백엔드 |
| `VITE_API_BASE_URL` | 백엔드 API 기본 URL | 프론트엔드 빌드 시 주입 |
| `DATA_FILE_PATH` | `expenses.json` 저장 경로 | 백엔드 |

Vercel 배포 시 대시보드 **Environment Variables** 메뉴에서 등록.

---

## API 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| `POST` | `/api/upload` | 영수증 업로드 + Upstage OCR 파싱 → JSON 저장 |
| `GET` | `/api/expenses` | 전체 지출 목록 조회 (`?from=&to=` 날짜 필터) |
| `DELETE` | `/api/expenses/{id}` | 특정 지출 항목 삭제 |
| `PUT` | `/api/expenses/{id}` | 특정 지출 항목 수정 |
| `GET` | `/api/summary` | 지출 합계 통계 (`?month=` 필터) |

---

## 데이터 스키마 (`expenses.json` 항목 구조)

```json
{
  "id": "uuid-v4",
  "created_at": "ISO 8601",
  "store_name": "가게명",
  "receipt_date": "YYYY-MM-DD",
  "receipt_time": "HH:MM",
  "category": "카테고리",
  "items": [
    { "name": "품목명", "quantity": 1, "unit_price": 1000, "total_price": 1000 }
  ],
  "subtotal": 1000,
  "discount": 0,
  "tax": 0,
  "total_amount": 1000,
  "payment_method": "신용카드",
  "raw_image_path": "uploads/filename.jpg"
}
```

---

## 아키텍처 핵심 사항

### OCR 파이프라인 (백엔드)

1. `POST /api/upload` 수신 → 파일 저장
2. Pillow/pdf2image로 이미지 전처리 → Base64 인코딩
3. LangChain Chain: `ChatUpstage` Vision LLM 호출 (System Prompt: JSON 형식 응답 강제)
4. LangChain Output Parser로 구조화 JSON 추출
5. `expenses.json`에 append 저장 (UUID, `created_at` 자동 부여)

### Vercel 서버리스 주의사항

Vercel 서버리스 함수는 요청마다 컨테이너가 재생성되어 **파일 시스템이 초기화**될 수 있습니다.
MVP 단계에서는 클라이언트 `localStorage` 병행 저장 또는 Railway/Render 배포를 권장합니다.

### Vercel 라우팅 (`vercel.json`)

- `/api/*` 요청 → `backend/main.py` (Python 서버리스)
- 그 외 요청 → `frontend/dist/` (정적 파일)

---

## 지원 파일 형식 및 제약

- 지원 형식: JPG, PNG, PDF (최대 10MB)
- 언어: 한국어/영어 영수증만 지원
- 인증: 없음 (단일 사용자 개인 프로젝트)

---

## Claude Code 지침

### 언어 및 소통 원칙
- 모든 응답은 **한국어**로 작성합니다.
- IT 전문 용어는 그대로 사용하되, 필요 시 괄호 안에 영문 병기합니다.
- 명확하고 간결한 어조를 유지합니다.

### 응답 형식
- 마크다운 문법을 적극 활용합니다.
- 코드/명령어는 반드시 언어 태그 포함 코드 블록으로 제공합니다.
- 단계별 절차는 번호 목록으로 구분합니다.

### 작업 처리 지침
- 작업 전 영향 범위(수정될 파일, 실행될 명령 등)를 먼저 설명합니다.
- 파일 수정 전 현재 내용을 먼저 파악합니다.
- 변경 범위는 요청된 것에 한정하며, 불필요한 수정은 하지 않습니다.

### 위험 작업 처리 (반드시 사전 확인)
- 파일/디렉토리 삭제
- git force push / reset / rebase
- 환경 변수 또는 설정 파일 수정
- 패키지 전역 설치 또는 제거
