# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Response

from ..dependencies import get_requesting_user_id, trip_service
from ...domain.models.expense import Expense
from ...domain.enums.expense_category import ExpenseCategory

router = APIRouter(prefix="/trips/{trip_id}/expenses", tags=["Expenses"])


@dataclass
class ExpenseCreateRequest:
    category: str  # "transport", "accommodation", "meals", "misc"
    description: str
    amount: float
    expense_date: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED)
def add_expense(
    trip_id: int,
    req: ExpenseCreateRequest,
    user_id: int = Depends(get_requesting_user_id)
) -> dict:
    """Adds a non-activity expense to a trip."""
    trip = trip_service.get_trip(trip_id, user_id)
    exp_d = date.fromisoformat(req.expense_date) if req.expense_date else None
    cat_enum = ExpenseCategory(req.category.lower()) if req.category else ExpenseCategory.MISC

    new_id = (max([e.id for e in trip.expenses if e.id], default=0) + 1)
    expense = Expense(
        id=new_id,
        trip_id=trip.id or trip_id,
        category=cat_enum,
        description=req.description,
        amount=req.amount,
        expense_date=exp_d,
    )
    trip.add_expense(expense)
    return {
        "id": str(expense.id),
        "trip_id": expense.trip_id,
        "category": expense.category.value,
        "description": expense.description,
        "amount": expense.amount,
        "expense_date": expense.expense_date.isoformat() if expense.expense_date else None,
    }


@router.get("", status_code=status.HTTP_200_OK)
def list_expenses(
    trip_id: int,
    user_id: int = Depends(get_requesting_user_id)
) -> List[dict]:
    """Lists expenses for a trip."""
    trip = trip_service.get_trip(trip_id, user_id)
    return [
        {
            "id": str(e.id),
            "trip_id": e.trip_id,
            "category": e.category.value,
            "description": e.description,
            "amount": e.amount,
            "expense_date": e.expense_date.isoformat() if e.expense_date else None,
        }
        for e in trip.expenses
    ]


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_expense(
    trip_id: int,
    expense_id: int,
    user_id: int = Depends(get_requesting_user_id)
):
    """Removes an expense from a trip."""
    trip = trip_service.get_trip(trip_id, user_id)
    removed = trip.remove_expense(expense_id)
    if not removed:
        raise KeyError(f"Expense with ID {expense_id} not found in Trip {trip_id}.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
