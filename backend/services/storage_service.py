import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "expenses.json"


def load_expenses() -> list:
    if not DATA_FILE.exists():
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        content = f.read().strip()
        if not content:
            return []
        return json.loads(content)


def save_expenses(data: list) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def append_expense(item: dict) -> dict:
    expenses = load_expenses()
    item["id"] = str(uuid.uuid4())
    item["created_at"] = datetime.now(timezone.utc).isoformat()
    expenses.append(item)
    save_expenses(expenses)
    return item
