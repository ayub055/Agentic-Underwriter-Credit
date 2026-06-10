"""JSON-safe conversion for foreign report objects.

Handles what a blind ``json.dumps(asdict(obj), default=str)`` cannot: enum dict
KEYS (BureauReport.feature_vectors is ``Dict[LoanType, ...]``), enum values,
Decimal, datetime/date, sets, pydantic models, and dataclasses — recursively.
"""

from __future__ import annotations

import dataclasses
import datetime as _dt
from decimal import Decimal
from enum import Enum
from typing import Any


def _key(k: Any) -> str:
    if isinstance(k, Enum):
        return str(k.value)
    if isinstance(k, (str, int, float, bool)) or k is None:
        return str(k)
    return repr(k)


def to_jsonable(obj: Any) -> Any:
    if obj is None or isinstance(obj, (str, int, float, bool)):
        return obj
    if isinstance(obj, Enum):
        return obj.value
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, (_dt.datetime, _dt.date)):
        return obj.isoformat()
    if hasattr(obj, "model_dump"):
        return to_jsonable(obj.model_dump(mode="python"))
    if dataclasses.is_dataclass(obj) and not isinstance(obj, type):
        return {f.name: to_jsonable(getattr(obj, f.name)) for f in dataclasses.fields(obj)}
    if isinstance(obj, dict):
        return {_key(k): to_jsonable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [to_jsonable(v) for v in obj]
    return str(obj)
