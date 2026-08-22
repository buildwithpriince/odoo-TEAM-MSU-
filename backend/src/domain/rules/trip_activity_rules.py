# -*- coding: utf-8 -*-
from datetime import date
from typing import Optional


class TripActivityDomainError(ValueError):
    """Base exception for TripActivity domain rule violations."""
    pass


class ActivityCityMismatchError(TripActivityDomainError):
    """Raised when an activity's city does not match the TripStop's city."""
    pass


class TripStopMismatchError(TripActivityDomainError):
    """Raised when a TripActivity's trip_id does not match the TripStop's trip_id."""
    pass


class ActivityOutsideStopDatesError(TripActivityDomainError):
    """Raised when scheduled activity date is outside parent TripStop date range."""
    pass


class InvalidTripActivityCostError(TripActivityDomainError):
    """Raised when trip activity selected cost is negative."""
    pass


def validate_activity_city_matches_stop_city(activity_city_id: int, stop_city_id: int) -> None:
    """CRITICAL RULE: Activity city must match TripStop city."""
    if activity_city_id != stop_city_id:
        raise ActivityCityMismatchError(
            f"Activity belongs to City {activity_city_id}, which does not match TripStop City {stop_city_id}."
        )


def validate_trip_stop_relationship(trip_activity_trip_id: int, stop_trip_id: int) -> None:
    """CRITICAL RULE: TripActivity trip_id must match TripStop trip_id."""
    if trip_activity_trip_id != stop_trip_id:
        raise TripStopMismatchError(
            f"TripActivity belongs to Trip {trip_activity_trip_id}, but TripStop belongs to Trip {stop_trip_id}."
        )


def validate_activity_within_stop_dates(
    activity_date: Optional[date],
    stop_start: Optional[date],
    stop_end: Optional[date],
) -> None:
    """Enforces stop.start_date <= activity.date <= stop.end_date when scheduled date is set."""
    if not activity_date or not stop_start or not stop_end:
        return

    if activity_date < stop_start or activity_date > stop_end:
        raise ActivityOutsideStopDatesError(
            f"Activity scheduled date ({activity_date}) is outside TripStop stay range ({stop_start} to {stop_end})."
        )


def validate_trip_activity_cost(cost: float) -> None:
    """Enforces non-negative trip activity cost."""
    if cost < 0.0:
        raise InvalidTripActivityCostError(
            f"TripActivity cost cannot be negative, got: {cost}"
        )
