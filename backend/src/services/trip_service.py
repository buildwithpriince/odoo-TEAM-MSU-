# -*- coding: utf-8 -*-
from datetime import date
from typing import List, Optional

from ..domain.models.trip import Trip
from ..domain.enums.trip_status import TripStatus
from ..domain.rules.trip_rules import check_trip_ownership
from ..infrastructure.repositories.interfaces import ITripRepository


class TripService:
    """Domain service for managing Trip aggregate lifecycle backed by repository persistence."""

    def __init__(self, trip_repository: ITripRepository):
        self.trip_repository = trip_repository

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
        """Creates and persists a new Trip entity after validating domain rules."""
        if owner_id <= 0:
            raise ValueError(f"Trip owner_id must be a valid positive user ID, got: {owner_id}")

        trip = Trip(
            id=None,
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
        return self.trip_repository.save(trip)

    def get_trip(self, trip_id: int, requesting_user_id: int) -> Trip:
        """Retrieves a Trip by ID and enforces owner identity access authorization."""
        trip = self.trip_repository.get_by_id(trip_id)
        if not trip:
            raise KeyError(f"Trip with ID {trip_id} not found.")

        check_trip_ownership(trip, requesting_user_id)
        return trip

    def list_user_trips(self, owner_id: int) -> List[Trip]:
        """Lists all Trips belonging to a specific owner_id."""
        if owner_id <= 0:
            raise ValueError(f"Owner ID must be positive, got: {owner_id}")
        return self.trip_repository.list_by_owner(owner_id)

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

        return self.trip_repository.save(trip)

    def delete_trip(self, trip_id: int, requesting_user_id: int) -> bool:
        """Deletes a trip owned by the requesting user."""
        self.get_trip(trip_id, requesting_user_id)
        return self.trip_repository.delete(trip_id)
