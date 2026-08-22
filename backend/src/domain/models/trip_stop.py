# -*- coding: utf-8 -*-
from dataclasses import dataclass, field
from datetime import date
from typing import Optional, List

from .city import City
from .trip_activity import TripActivity
from ..rules.trip_stop_rules import (
    validate_stop_sequence,
    validate_stop_dates,
)
from ..rules.trip_activity_rules import (
    validate_activity_city_matches_stop_city,
    validate_trip_stop_relationship,
    validate_activity_within_stop_dates,
)


@dataclass
class TripStop:
    """Pure Python Domain Model representing a destination stop within a Trip.

    Fields:
        id: Unique identifier
        trip_id: Associated Trip ID
        city_id: Associated City ID
        sequence: 1-based ordering sequence inside trip
        start_date: Arrival/Start date at destination
        end_date: Departure/End date at destination
        city: Optional embedded reference to City entity
        notes: Optional custom stop notes
        activities: List of scheduled TripActivity domain models on this stop
    """
    id: Optional[int] = None
    trip_id: int = 0
    city_id: int = 0
    sequence: int = 1
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    city: Optional[City] = None
    notes: Optional[str] = None
    activities: List[TripActivity] = field(default_factory=list)

    def __post_init__(self):
        self.validate()

    def validate(self) -> None:
        """Validates TripStop invariants."""
        if self.trip_id <= 0:
            raise ValueError("TripStop must reference a valid positive trip_id.")
        if self.city_id <= 0:
            raise ValueError("TripStop must reference a valid positive city_id.")
        validate_stop_sequence(self.sequence)
        validate_stop_dates(self.start_date, self.end_date)

    @property
    def duration_days(self) -> int:
        """Calculates inclusive stay duration at this stop in days."""
        if not self.start_date or not self.end_date:
            return 0
        validate_stop_dates(self.start_date, self.end_date)
        return (self.end_date - self.start_date).days + 1

    def add_activity(self, trip_activity: TripActivity) -> None:
        """Adds a TripActivity to this stop, enforcing city match, trip match, and date range rules."""
        # Rule 1: TripActivity trip_id must match TripStop trip_id
        validate_trip_stop_relationship(trip_activity.trip_id, self.trip_id)

        # Rule 2: If catalog Activity is embedded, city_id must match stop's city_id
        if trip_activity.activity:
            validate_activity_city_matches_stop_city(trip_activity.activity.city_id, self.city_id)

        # Rule 3: Scheduled date must fall within stop start_date and end_date
        validate_activity_within_stop_dates(
            activity_date=trip_activity.scheduled_date,
            stop_start=self.start_date,
            stop_end=self.end_date,
        )

        trip_activity.stop_id = self.id or 0
        self.activities.append(trip_activity)

    def remove_activity(self, trip_activity_id: int) -> bool:
        """Removes a TripActivity by ID."""
        initial_count = len(self.activities)
        self.activities = [a for a in self.activities if a.id != trip_activity_id]
        return len(self.activities) < initial_count

    def update_dates(self, new_start: Optional[date], new_end: Optional[date]) -> None:
        """Updates stop stay dates and re-validates activity schedule dates."""
        validate_stop_dates(new_start, new_end)
        for act in self.activities:
            validate_activity_within_stop_dates(
                activity_date=act.scheduled_date,
                stop_start=new_start,
                stop_end=new_end,
            )
        self.start_date = new_start
        self.end_date = new_end
