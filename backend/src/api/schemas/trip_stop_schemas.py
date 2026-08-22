# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any, List

from ...domain.models.trip_stop import TripStop
from .city_schemas import CityResponse


@dataclass
class TripStopCreateRequest:
    city_id: int
    arrivalDate: Optional[str] = None      # ISO format "YYYY-MM-DD"
    departureDate: Optional[str] = None    # ISO format "YYYY-MM-DD"
    notes: Optional[str] = None

    # Alias getters
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    def get_start_date(self) -> Optional[str]:
        return self.arrivalDate or self.start_date

    def get_end_date(self) -> Optional[str]:
        return self.departureDate or self.end_date


@dataclass
class TripStopUpdateRequest:
    arrivalDate: Optional[str] = None
    departureDate: Optional[str] = None
    notes: Optional[str] = None


@dataclass
class ReorderStopsRequest:
    ordered_stop_ids: List[int]


@dataclass
class TripStopResponse:
    id: str
    trip_id: int
    city_id: int
    sequence: int
    cityName: str
    country: str
    arrivalDate: Optional[str]
    departureDate: Optional[str]
    duration_days: int
    coverImage: Optional[str]
    notes: Optional[str]
    city: Optional[CityResponse] = None

    @property
    def start_date(self) -> Optional[str]:
        return self.arrivalDate

    @property
    def end_date(self) -> Optional[str]:
        return self.departureDate

    @classmethod
    def from_domain(cls, stop: TripStop) -> "TripStopResponse":
        """Translates TripStop domain model into API DTO matching frontend CityStop contract."""
        city_name = stop.city.name if stop.city else ""
        country_name = stop.city.country if stop.city else ""
        cover = stop.city.image_url if stop.city else ""

        return cls(
            id=str(stop.id or 0),
            trip_id=stop.trip_id,
            city_id=stop.city_id,
            sequence=stop.sequence,
            cityName=city_name,
            country=country_name,
            arrivalDate=stop.start_date.isoformat() if stop.start_date else None,
            departureDate=stop.end_date.isoformat() if stop.end_date else None,
            duration_days=stop.duration_days,
            coverImage=cover,
            notes=stop.notes or "",
            city=CityResponse.from_domain(stop.city) if stop.city else None,
        )

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["start_date"] = self.arrivalDate
        d["end_date"] = self.departureDate
        return d
