# -*- coding: utf-8 -*-
from dataclasses import dataclass, field
from datetime import date
from typing import Optional

from ..enums.expense_category import ExpenseCategory
from ..rules.expense_rules import validate_expense_amount


@dataclass
class Expense:
    """Pure Python Domain Model representing non-activity cost items (transport, lodging, meals, misc).

    Fields:
        id: Unique expense identifier
        trip_id: Parent Trip ID
        category: ExpenseCategory (transport, accommodation, meals, misc)
        description: Description/note of expense (e.g. 'Flight Jaipur to Jodhpur')
        amount: Cost amount (>= 0.0)
        expense_date: Date expense occurred or is scheduled for
    """
    id: Optional[int] = None
    trip_id: int = 0
    category: ExpenseCategory = field(default_factory=ExpenseCategory.default)
    description: str = ""
    amount: float = 0.0
    expense_date: Optional[date] = None

    def __post_init__(self):
        self.validate()

    def validate(self) -> None:
        """Validates Expense domain invariants."""
        if self.trip_id <= 0:
            raise ValueError("Expense must reference a valid positive trip_id.")
        validate_expense_amount(self.amount)
