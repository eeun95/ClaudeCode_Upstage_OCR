import json
import os
import re
from html.parser import HTMLParser

import requests
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage

UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY")
DOC_PARSE_URL = "https://api.upstage.ai/v1/document-digitization"

SYSTEM_PROMPT = """당신은 영수증 OCR 전문가입니다.
아래에 제공된 영수증 텍스트를 분석하여 정확히 아래 JSON 형식으로만 응답하세요.
다른 텍스트나 설명은 절대 포함하지 마세요. 순수한 JSON만 출력하세요.

{{
  "store_name": "가게(상호) 이름 문자열",
  "receipt_date": "YYYY-MM-DD 형식 날짜",
  "receipt_time": "HH:MM 형식 시각 또는 null",
  "category": "식료품|외식|교통|쇼핑|의료|기타 중 하나",
  "items": [
    {{"name": "품목명", "quantity": 수량_정수, "unit_price": 단가_정수, "total_price": 합계_정수}}
  ],
  "subtotal": 소계_정수,
  "discount": 할인금액_정수_없으면_0,
  "tax": 세금_정수_없으면_0,
  "total_amount": 최종결제금액_정수,
  "payment_method": "결제수단 문자열 또는 null"
}}

카테고리 분류 기준:
- 식료품: 마트, 편의점, 슈퍼마켓
- 외식: 레스토랑, 카페, 패스트푸드, 음식점
- 교통: 택시, 버스, 지하철, 주유소
- 쇼핑: 의류, 전자제품, 백화점, 잡화
- 의료: 병원, 약국, 의원
- 기타: 위에 해당하지 않는 경우"""


class _HTMLTextExtractor(HTMLParser):
    """HTML 태그를 제거하고 순수 텍스트만 추출하는 파서"""

    def __init__(self):
        super().__init__()
        self._parts: list[str] = []

    def handle_data(self, data: str):
        stripped = data.strip()
        if stripped:
            self._parts.append(stripped)

    def get_text(self) -> str:
        return "\n".join(self._parts)


def _html_to_text(html: str) -> str:
    parser = _HTMLTextExtractor()
    parser.feed(html)
    return parser.get_text()


def _extract_text_from_document(file_bytes: bytes, filename: str) -> str:
    """Upstage Document Parse API로 이미지/PDF에서 텍스트 추출"""
    headers = {"Authorization": f"Bearer {UPSTAGE_API_KEY}"}
    files = {"document": (filename, file_bytes)}
    data = {"model": "document-parse", "ocr": "force"}

    response = requests.post(
        DOC_PARSE_URL, headers=headers, files=files, data=data, timeout=30
    )
    response.raise_for_status()

    result = response.json()
    content = result.get("content", {})

    # text → markdown → html(태그 제거) 순서로 시도
    text = (
        content.get("text", "").strip()
        or content.get("markdown", "").strip()
        or _html_to_text(content.get("html", ""))
    )
    return text


def _structure_with_llm(raw_text: str) -> dict:
    """ChatUpstage Solar LLM으로 추출 텍스트를 구조화 JSON으로 변환"""
    llm = ChatUpstage(api_key=UPSTAGE_API_KEY, model="solar-pro")

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            ("human", "다음 영수증 텍스트를 분석해주세요:\n\n{text}"),
        ]
    )

    chain = prompt | llm | StrOutputParser()
    content = chain.invoke({"text": raw_text})

    # ```json ... ``` 마크다운 블록 제거
    content = re.sub(r"^```(?:json)?\s*\n?", "", content.strip(), flags=re.IGNORECASE)
    content = re.sub(r"\n?```$", "", content.strip())

    return json.loads(content.strip())


def parse_receipt(file_bytes: bytes, content_type: str, filename: str) -> dict:
    """
    영수증 파싱 메인 함수
    Step 1: Upstage Document Parse API → 텍스트 추출
    Step 2: ChatUpstage Solar → 구조화 JSON 반환
    """
    raw_text = _extract_text_from_document(file_bytes, filename)

    if not raw_text:
        raise ValueError("영수증에서 텍스트를 추출할 수 없습니다.")

    return _structure_with_llm(raw_text)
