# -*- coding: utf-8 -*-
from dataclasses import dataclass
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
    """Adds a non-activity expense to a trip and persists it."""
    trip = trip_service.get_trip(trip_id, user_id)
    exp_d = date.fromisoformat(req.expense_date) if req.expense_date else None
    cat_enum = ExpenseCategory(req.category.lower()) if req.category else ExpenseCategory.MISC

    expense = Expense(
        id=None,
        trip_id=trip.id or trip_id,
        category=cat_enum,
        description=req.description,
        amount=req.amount,
        expense_date=exp_d,
    )
    trip.add_expense(expense)
    trip_service.trip_repository.save(trip)

    saved_exp = trip.expenses[-1]
    return {
        "id": str(saved_exp.id),
        "trip_id": saved_exp.trip_id,
        "category": saved_exp.category.value,
        "description": saved_exp.description,
        "amount": saved_exp.amount,
        "expense_date": saved_exp.expense_date.isoformat() if saved_exp.expense_date else None,
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

    trip_service.trip_repository.save(trip)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
