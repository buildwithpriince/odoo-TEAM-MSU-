# -*- coding: utf-8 -*-
from dataclasses import dataclass
from datetime import date
from typing import Optional

from .activity import Activity
from ..rules.trip_activity_rules import validate_trip_activity_cost


@dataclass
class TripActivity:
    """Pure Python Domain Model representing a scheduled activity instance within a TripStop.

    Fields:
        id: Unique instance identifier
        trip_id: Parent Trip ID
        stop_id: Parent TripStop ID
        activity_id: Selected catalog Activity ID
        scheduled_date: Date activity is scheduled for
        start_time: Scheduled start time (e.g. '10:00')
        end_time: Scheduled end time (e.g. '12:00')
        cost: Actual / selected cost for this trip instance (>= 0.0)
        notes: Trip-specific custom activity notes (e.g. 'Pre-booked online ticket')
        activity: Optional embedded reference to catalog Activity model
    """
    id: Optional[int] = None
    trip_id: int = 0
    stop_id: int = 0
    activity_id: int = 0
    scheduled_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    cost: float = 0.0
    notes: Optional[str] = None
    activity: Optional[Activity] = None

    def __post_init__(self):
        self.validate()

    def validate(self) -> None:
        """Validates TripActivity invariants."""
        if self.trip_id <= 0:
            raise ValueError("TripActivity must reference a valid positive trip_id.")
        if self.stop_id <= 0:
            raise ValueError("TripActivity must reference a valid positive stop_id.")
        if self.activity_id <= 0:
            raise ValueError("TripActivity must reference a valid positive activity_id.")
        validate_trip_activity_cost(self.cost)

    def update_schedule(
        self,
        scheduled_date: Optional[date] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
    ) -> None:
        """Updates scheduling date and time."""
        self.scheduled_date = scheduled_date
        self.start_time = start_time
        self.end_time = end_time

    def update_cost(self, new_cost: float) -> None:
        """Updates instance cost with non-negative validation."""
        validate_trip_activity_cost(new_cost)
        self.cost = new_cost
