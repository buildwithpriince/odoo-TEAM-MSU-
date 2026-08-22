# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any, List

from .city_schemas import CityResponse
from .trip_activity_schemas import TripActivityResponse


@dataclass
class ItineraryDayResponse:
    date: str
    city: Optional[CityResponse]
    activities: List[TripActivityResponse]
    daily_total_cost: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "date": self.date,
            "city": self.city.to_dict() if self.city else None,
            "activities": [a.to_dict() for a in self.activities],
            "daily_total_cost": self.daily_total_cost,
        }


@dataclass
class ItineraryResponse:
    trip_id: int
    trip_name: str
    days: List[ItineraryDayResponse]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "trip_id": self.trip_id,
            "trip_name": self.trip_name,
            "days": [d.to_dict() for d in self.days],
        }
