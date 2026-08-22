# -*- coding: utf-8 -*-
from datetime import date
from typing import Optional


class TripDomainError(ValueError):
    """Base exception for Trip domain rule violations."""
    pass


class InvalidTripDatesError(TripDomainError):
    """Raised when start date is after end date."""
    pass


class InvalidTripBudgetError(TripDomainError):
    """Raised when target budget is negative."""
    pass


class TripOwnershipError(TripDomainError):
    """Raised when a user attempts to mutate a trip they do not own."""
    pass


def validate_trip_dates(start_date: Optional[date], end_date: Optional[date]) -> None:
    """Enforces start_date <= end_date. Same-day trips are valid."""
    if start_date and end_date and start_date > end_date:
        raise InvalidTripDatesError(
            f"Start date ({start_date}) cannot be after end date ({end_date})."
        )


def validate_target_budget(target_budget: float) -> None:
    """Enforces target_budget >= 0."""
    if target_budget < 0:
        raise InvalidTripBudgetError(
            f"Target budget cannot be negative: {target_budget}"
        )


def calculate_trip_duration_days(start_date: Optional[date], end_date: Optional[date]) -> int:
    """Calculates inclusive trip duration in days."""
    if not start_date or not end_date:
        return 0
    validate_trip_dates(start_date, end_date)
    return (end_date - start_date).days + 1


def check_trip_ownership(trip_owner_id: int, requesting_user_id: int) -> bool:
    """Validates if requesting user owns the trip using canonical owner_id."""
    if trip_owner_id != requesting_user_id:
        raise TripOwnershipError(
            f"User {requesting_user_id} does not own trip owned by User {trip_owner_id}."
        )
    return True
