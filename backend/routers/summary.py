from collections import defaultdict
from datetime import date
from typing import Optional

from fastapi import APIRouter, Query

from services.storage_service import load_expenses

router = APIRouter()


@router.get("/summary", summary="지출 합계 통계 조회")
def get_summary(
    month: Optional[str] = Query(None, description="월별 필터 YYYY-MM"),
):
    expenses = load_expenses()

    # month 파라미터 없으면 이번 달 기준
    filter_month = month or date.today().strftime("%Y-%m")

    total_amount = sum(e.get("total_amount", 0) for e in expenses)

    this_month_expenses = [
        e for e in expenses if e.get("receipt_date", "")[:7] == filter_month
    ]
    this_month_amount = sum(e.get("total_amount", 0) for e in this_month_expenses)

    category_totals: dict = defaultdict(int)
    for e in this_month_expenses:
        category = e.get("category", "기타")
        category_totals[category] += e.get("total_amount", 0)

    category_summary = [
        {"category": cat, "amount": amt}
        for cat, amt in sorted(category_totals.items(), key=lambda x: -x[1])
    ]

    return {
        "total_amount": total_amount,
        "this_month_amount": this_month_amount,
        "category_summary": category_summary,
    }
