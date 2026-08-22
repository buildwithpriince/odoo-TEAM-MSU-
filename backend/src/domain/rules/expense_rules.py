# -*- coding: utf-8 -*-


class ExpenseDomainError(ValueError):
    """Base exception for Expense domain rule violations."""
    pass


class InvalidExpenseAmountError(ExpenseDomainError):
    """Raised when expense amount is negative."""
    pass


def validate_expense_amount(amount: float) -> None:
    """Enforces non-negative expense amount."""
    if amount < 0.0:
        raise InvalidExpenseAmountError(
            f"Expense amount cannot be negative, got: {amount}"
        )
