# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any

from ...domain.models.trip_activity import TripActivity
from .activity_schemas import ActivityResponse


@dataclass
class TripActivityCreateRequest:
    activity_id: int
    scheduled_date: Optional[str] = None  # ISO format "YYYY-MM-DD"
    time: Optional[str] = None            # "10:00"
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    cost_override: Optional[float] = None
    notes: Optional[str] = None

    def get_start_time(self) -> Optional[str]:
        return self.time or self.start_time


@dataclass
class TripActivityUpdateRequest:
    scheduled_date: Optional[str] = None
    time: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    cost: Optional[float] = None
    notes: Optional[str] = None


@dataclass
class TripActivityResponse:
    id: str
    trip_id: int
    stop_id: int
    activity_id: int
    title: str
    time: Optional[str]
    endTime: Optional[str]
    duration: str
    category: str
    cost: float
    location: str
    notes: str
    scheduled_date: Optional[str]
    activity: Optional[ActivityResponse] = None

    @property
    def start_time(self) -> Optional[str]:
        return self.time

    @property
    def end_time(self) -> Optional[str]:
        return self.endTime

    @classmethod
    def from_domain(cls, trip_activity: TripActivity) -> "TripActivityResponse":
        act = trip_activity.activity
        act_title = act.name if act else ""
        act_cat = (act.category.value if hasattr(act.category, 'value') else str(act.category)) if act else "sightseeing"
        dur_str = f"{act.duration_minutes} mins" if act else "60 mins"
        loc_name = ""

        return cls(
            id=str(trip_activity.id or 0),
            trip_id=trip_activity.trip_id,
            stop_id=trip_activity.stop_id,
            activity_id=trip_activity.activity_id,
            title=act_title,
            time=trip_activity.start_time or "",
            endTime=trip_activity.end_time or "",
            duration=dur_str,
            category=act_cat,
            cost=trip_activity.cost,
            location=loc_name,
            notes=trip_activity.notes or "",
            scheduled_date=trip_activity.scheduled_date.isoformat() if trip_activity.scheduled_date else None,
            activity=ActivityResponse.from_domain(act) if act else None,
        )

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["start_time"] = self.time
        d["end_time"] = self.endTime
        return d
