# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any, List

from ...domain.models.trip_stop import TripStop
from .city_schemas import CityResponse


@dataclass
class TripStopCreateRequest:
    city_id: int
    start_date: Optional[str] = None  # ISO format "YYYY-MM-DD"
    end_date: Optional[str] = None    # ISO format "YYYY-MM-DD"
    notes: Optional[str] = None


@dataclass
class TripStopUpdateRequest:
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None


@dataclass
class ReorderStopsRequest:
    ordered_stop_ids: List[int]


@dataclass
class TripStopResponse:
    id: int
    trip_id: int
    city_id: int
    sequence: int
    start_date: Optional[str]
    end_date: Optional[str]
    duration_days: int
    notes: Optional[str]
    city: Optional[CityResponse] = None

    @classmethod
    def from_domain(cls, stop: TripStop) -> "TripStopResponse":
        return cls(
            id=stop.id or 0,
            trip_id=stop.trip_id,
            city_id=stop.city_id,
            sequence=stop.sequence,
            start_date=stop.start_date.isoformat() if stop.start_date else None,
            end_date=stop.end_date.isoformat() if stop.end_date else None,
            duration_days=stop.duration_days,
            notes=stop.notes,
            city=CityResponse.from_domain(stop.city) if stop.city else None,
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
