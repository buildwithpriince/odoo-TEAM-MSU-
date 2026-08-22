# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any, List

from ...domain.models.trip import Trip


@dataclass
class TripCreateRequest:
    name: str
    description: Optional[str] = None
    start_date: Optional[str] = None  # ISO Format "YYYY-MM-DD"
    end_date: Optional[str] = None    # ISO Format "YYYY-MM-DD"
    target_budget: float = 0.0
    currency: str = "INR"
    cover_image: Optional[str] = None
    travel_vibe: Optional[str] = None


@dataclass
class TripUpdateRequest:
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    target_budget: Optional[float] = None
    currency: Optional[str] = None
    state: Optional[str] = None
    cover_image: Optional[str] = None
    travel_vibe: Optional[str] = None


@dataclass
class TripResponse:
    id: int
    name: str
    description: str
    owner_id: int
    start_date: Optional[str]
    end_date: Optional[str]
    duration_days: int
    target_budget: float
    currency: str
    state: str
    cover_image: Optional[str] = None
    travel_vibe: Optional[str] = None

    @classmethod
    def from_domain(cls, trip: Trip) -> "TripResponse":
        """Translates pure domain Trip model into external API Response DTO."""
        return cls(
            id=trip.id or 0,
            name=trip.name,
            description=trip.description,
            owner_id=trip.owner_id,
            start_date=trip.start_date.isoformat() if trip.start_date else None,
            end_date=trip.end_date.isoformat() if trip.end_date else None,
            duration_days=trip.duration_days,
            target_budget=trip.target_budget,
            currency=trip.currency_code,
            state=trip.state.value if hasattr(trip.state, 'value') else str(trip.state),
            cover_image=trip.cover_image,
            travel_vibe=trip.travel_vibe,
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


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
