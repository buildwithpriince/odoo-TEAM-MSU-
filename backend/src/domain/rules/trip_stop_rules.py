# -*- coding: utf-8 -*-
from datetime import date
from typing import Optional


class TripStopDomainError(ValueError):
    """Base exception for TripStop domain rule violations."""
    pass


class InvalidStopSequenceError(TripStopDomainError):
    """Raised when stop sequence is less than 1."""
    pass


class InvalidStopDatesError(TripStopDomainError):
    """Raised when stop start_date is after end_date."""
    pass


class StopOutsideTripDatesError(TripStopDomainError):
    """Raised when stop dates fall outside parent Trip's date range."""
    pass


def validate_stop_sequence(sequence: int) -> None:
    """Enforces 1-based positive sequence integer."""
    if sequence < 1:
        raise InvalidStopSequenceError(
            f"Stop sequence position must be a positive integer (>= 1), got: {sequence}"
        )


def validate_stop_dates(start_date: Optional[date], end_date: Optional[date]) -> None:
    """Enforces stop start_date <= stop end_date."""
    if start_date and end_date and start_date > end_date:
        raise InvalidStopDatesError(
            f"Stop start date ({start_date}) cannot be after stop end date ({end_date})."
        )


def validate_stop_within_trip_dates(
    stop_start: Optional[date],
    stop_end: Optional[date],
    trip_start: Optional[date],
    trip_end: Optional[date],
) -> None:
    """Enforces trip.start_date <= stop.start_date and stop.end_date <= trip.end_date."""
    if not trip_start and not trip_end:
        return

    validate_stop_dates(stop_start, stop_end)

    if stop_start and trip_start and stop_start < trip_start:
        raise StopOutsideTripDatesError(
            f"Stop start date ({stop_start}) cannot be before Trip start date ({trip_start})."
        )

    if stop_end and trip_end and stop_end > trip_end:
        raise StopOutsideTripDatesError(
            f"Stop end date ({stop_end}) cannot be after Trip end date ({trip_end})."
        )
