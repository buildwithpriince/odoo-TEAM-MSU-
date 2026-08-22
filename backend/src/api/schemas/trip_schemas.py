# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any, List

from ...domain.models.trip import Trip
from ...domain.enums.trip_status import TripStatus
from .trip_stop_schemas import TripStopResponse


def map_status_to_frontend(status: TripStatus) -> str:
    """Maps domain TripStatus to frontend contract status ('planning', 'upcoming', 'completed')."""
    if status == TripStatus.DRAFT:
        return "planning"
    elif status in (TripStatus.PLANNED, TripStatus.ONGOING):
        return "upcoming"
    elif status in (TripStatus.COMPLETED, TripStatus.CANCELLED):
        return "completed"
    return "planning"


@dataclass
class TripCreateRequest:
    title: str
    description: Optional[str] = None
    startDate: Optional[str] = None  # ISO Format "YYYY-MM-DD"
    endDate: Optional[str] = None    # ISO Format "YYYY-MM-DD"
    totalBudget: float = 0.0
    currency: str = "INR"
    coverImage: Optional[str] = None
    travelVibe: Optional[str] = None

    # Optional alias getters for snake_case inputs
    name: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    target_budget: Optional[float] = None
    cover_image: Optional[str] = None
    travel_vibe: Optional[str] = None

    def get_title(self) -> str:
        return self.title or self.name or ""

    def get_start_date(self) -> Optional[str]:
        return self.startDate or self.start_date

    def get_end_date(self) -> Optional[str]:
        return self.endDate or self.end_date

    def get_budget(self) -> float:
        return self.totalBudget if self.totalBudget != 0.0 else (self.target_budget or 0.0)

    def get_cover_image(self) -> Optional[str]:
        return self.coverImage or self.cover_image

    def get_travel_vibe(self) -> Optional[str]:
        return self.travelVibe or self.travel_vibe


@dataclass
class TripUpdateRequest:
    title: Optional[str] = None
    description: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    totalBudget: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    coverImage: Optional[str] = None
    travelVibe: Optional[str] = None


@dataclass
class TripResponse:
    id: str
    title: str
    description: str
    owner_id: int
    startDate: Optional[str]
    endDate: Optional[str]
    duration_days: int
    totalBudget: float
    currency: str
    status: str
    coverImage: Optional[str] = None
    travelVibe: Optional[str] = None
    stops: Optional[List[TripStopResponse]] = None

    @property
    def name(self) -> str:
        return self.title

    @property
    def start_date(self) -> Optional[str]:
        return self.startDate

    @property
    def end_date(self) -> Optional[str]:
        return self.endDate

    @property
    def target_budget(self) -> float:
        return self.totalBudget

    @property
    def state(self) -> str:
        return self.status

    @classmethod
    def from_domain(cls, trip: Trip) -> "TripResponse":
        """Translates domain Trip entity to API DTO with frontend camelCase contract alignment."""
        return cls(
            id=str(trip.id or 0),
            title=trip.name,
            description=trip.description,
            owner_id=trip.owner_id,
            startDate=trip.start_date.isoformat() if trip.start_date else None,
            endDate=trip.end_date.isoformat() if trip.end_date else None,
            duration_days=trip.duration_days,
            totalBudget=trip.target_budget,
            currency=trip.currency_code,
            status=map_status_to_frontend(trip.state),
            coverImage=trip.cover_image or "",
            travelVibe=trip.travel_vibe or "",
            stops=[TripStopResponse.from_domain(s) for s in trip.stops] if trip.stops else [],
        )

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["name"] = self.title
        d["start_date"] = self.startDate
        d["end_date"] = self.endDate
        d["target_budget"] = self.totalBudget
        d["state"] = self.status
        return d


@dataclass
class ApiErrorResponse:
    error_code: str
    message: str
    field_errors: Optional[Dict[str, str]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "error": {
                "code": self.error_code,
                "message": self.message,
                "details": self.field_errors or {}
            }
        }
