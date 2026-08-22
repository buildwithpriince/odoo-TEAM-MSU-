# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any

from ...domain.models.trip_activity import TripActivity
from .activity_schemas import ActivityResponse


@dataclass
class TripActivityCreateRequest:
    activity_id: int
    scheduled_date: Optional[str] = None  # ISO format "YYYY-MM-DD"
    start_time: Optional[str] = None      # "10:00"
    end_time: Optional[str] = None        # "12:00"
    cost_override: Optional[float] = None
    notes: Optional[str] = None


@dataclass
class TripActivityUpdateRequest:
    scheduled_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    cost: Optional[float] = None
    notes: Optional[str] = None


@dataclass
class TripActivityResponse:
    id: int
    trip_id: int
    stop_id: int
    activity_id: int
    scheduled_date: Optional[str]
    start_time: Optional[str]
    end_time: Optional[str]
    cost: float
    notes: Optional[str]
    activity: Optional[ActivityResponse] = None

    @classmethod
    def from_domain(cls, trip_activity: TripActivity) -> "TripActivityResponse":
        return cls(
            id=trip_activity.id or 0,
            trip_id=trip_activity.trip_id,
            stop_id=trip_activity.stop_id,
            activity_id=trip_activity.activity_id,
            scheduled_date=trip_activity.scheduled_date.isoformat() if trip_activity.scheduled_date else None,
            start_time=trip_activity.start_time,
            end_time=trip_activity.end_time,
            cost=trip_activity.cost,
            notes=trip_activity.notes,
            activity=ActivityResponse.from_domain(trip_activity.activity) if trip_activity.activity else None,
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
