# -*- coding: utf-8 -*-
from typing import Optional


class ActivityDomainError(ValueError):
    """Base exception for Activity domain rule violations."""
    pass


class InvalidActivityNameError(ActivityDomainError):
    """Raised when activity name is empty or whitespace."""
    pass


class InvalidActivityCityError(ActivityDomainError):
    """Raised when activity city_id is invalid (<= 0)."""
    pass


class InvalidActivityCostError(ActivityDomainError):
    """Raised when activity cost is negative."""
    pass


class InvalidActivityDurationError(ActivityDomainError):
    """Raised when duration_minutes is negative."""
    pass


def validate_activity_name(name: str) -> None:
    """Enforces non-empty activity name."""
    if not name or not name.strip():
        raise InvalidActivityNameError("Activity name cannot be empty or whitespace.")


def validate_activity_city(city_id: int) -> None:
    """Enforces valid positive city_id reference."""
    if city_id <= 0:
        raise InvalidActivityCityError(f"Activity must reference a valid positive city_id, got: {city_id}")


def validate_activity_cost(cost: float) -> None:
    """Enforces base cost >= 0.0."""
    if cost < 0.0:
        raise InvalidActivityCostError(f"Activity cost cannot be negative, got: {cost}")


def validate_activity_duration(duration_minutes: int) -> None:
    """Enforces non-negative duration in minutes."""
    if duration_minutes < 0:
        raise InvalidActivityDurationError(
            f"Activity duration_minutes cannot be negative, got: {duration_minutes}"
        )
