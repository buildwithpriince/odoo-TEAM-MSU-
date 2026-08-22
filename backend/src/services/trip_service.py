# -*- coding: utf-8 -*-
from datetime import date
from typing import Dict, List, Optional

from ..domain.models.trip import Trip
from ..domain.enums.trip_status import TripStatus
from ..domain.rules.trip_rules import check_trip_ownership


class TripService:
    """Domain service orchestrating Trip entity lifecycle, persistence abstraction, and authorization."""

    def __init__(self):
        self._store: Dict[int, Trip] = {}
        self._next_id: int = 1

    def create_trip(
        self,
        owner_id: int,
        name: str,
        description: str = "",
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        target_budget: float = 0.0,
        currency_code: str = "INR",
        cover_image: Optional[str] = None,
        travel_vibe: Optional[str] = None,
    ) -> Trip:
        """Instantiates and validates a new Trip domain model for an authenticated user."""
        trip = Trip(
            id=self._next_id,
            name=name,
            description=description,
            owner_id=owner_id,
            start_date=start_date,
            end_date=end_date,
            target_budget=target_budget,
            currency_code=currency_code,
            state=TripStatus.DRAFT,
            cover_image=cover_image,
            travel_vibe=travel_vibe,
        )
        self._store[self._next_id] = trip
        self._next_id += 1
        return trip

    def get_trip(self, trip_id: int, requesting_user_id: int) -> Trip:
        """Retrieves a trip by ID, checking canonical ownership authorization."""
        if trip_id not in self._store:
            raise KeyError(f"Trip with ID {trip_id} not found.")
        trip = self._store[trip_id]
        check_trip_ownership(trip.owner_id, requesting_user_id)
        return trip

    def list_user_trips(self, owner_id: int) -> List[Trip]:
        """Lists all trips owned by the specified user ID."""
        return [t for t in self._store.values() if t.owner_id == owner_id]

    def update_trip(
        self,
        trip_id: int,
        requesting_user_id: int,
        name: Optional[str] = None,
        description: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        target_budget: Optional[float] = None,
        state: Optional[TripStatus] = None,
        cover_image: Optional[str] = None,
        travel_vibe: Optional[str] = None,
    ) -> Trip:
        """Updates a trip's fields using domain model methods and ownership checks."""
        trip = self.get_trip(trip_id, requesting_user_id)

        if name is not None:
            if not name.strip():
                raise ValueError("Trip name cannot be empty.")
            trip.name = name

        if description is not None:
            trip.description = description

        if start_date is not None or end_date is not None:
            new_start = start_date if start_date is not None else trip.start_date
            new_end = end_date if end_date is not None else trip.end_date
            trip.update_dates(new_start, new_end)

        if target_budget is not None:
            trip.update_budget(target_budget)

        if state is not None:
            trip.state = state

        if cover_image is not None:
            trip.cover_image = cover_image

        if travel_vibe is not None:
            trip.travel_vibe = travel_vibe

        return trip

    def delete_trip(self, trip_id: int, requesting_user_id: int) -> bool:
        """Deletes a trip owned by the requesting user."""
        trip = self.get_trip(trip_id, requesting_user_id)
        del self._store[trip.id]
        return True
