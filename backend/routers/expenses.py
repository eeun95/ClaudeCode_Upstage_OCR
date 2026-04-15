from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Query

from services.storage_service import load_expenses, save_expenses

router = APIRouter()

# `from`이 Python 예약어라 alias 사용
@router.get("/expenses", summary="지출 내역 목록 조회")
def get_expenses(
    from_date: Optional[str] = Query(None, alias="from", description="시작일 YYYY-MM-DD"),
    to_date: Optional[str] = Query(None, alias="to", description="종료일 YYYY-MM-DD"),
):
    expenses = load_expenses()

    if from_date:
        expenses = [e for e in expenses if e.get("receipt_date", "") >= from_date]
    if to_date:
        expenses = [e for e in expenses if e.get("receipt_date", "") <= to_date]

    return expenses


@router.delete("/expenses/{expense_id}", summary="지출 항목 삭제")
def delete_expense(expense_id: str):
    expenses = load_expenses()
    filtered = [e for e in expenses if e.get("id") != expense_id]

    if len(filtered) == len(expenses):
        raise HTTPException(
            status_code=404,
            detail=f"ID '{expense_id}'에 해당하는 항목을 찾을 수 없습니다.",
        )

    save_expenses(filtered)
    return {"message": "삭제되었습니다.", "id": expense_id}


@router.put("/expenses/{expense_id}", summary="지출 항목 수정")
def update_expense(expense_id: str, updates: Dict[str, Any]):
    expenses = load_expenses()

    IMMUTABLE = {"id", "created_at", "raw_image_path"}

    for i, expense in enumerate(expenses):
        if expense.get("id") == expense_id:
            for key, value in updates.items():
                if key not in IMMUTABLE:
                    expenses[i][key] = value
            save_expenses(expenses)
            return expenses[i]

    raise HTTPException(
        status_code=404,
        detail=f"ID '{expense_id}'에 해당하는 항목을 찾을 수 없습니다.",
    )
