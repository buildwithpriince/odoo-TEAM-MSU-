# -*- coding: utf-8 -*-
from datetime import date
from typing import List, Optional

from ..domain.models.trip_stop import TripStop
from .trip_service import TripService
from .city_service import CityService


class TripStopService:
    """Domain service managing destination TripStops within a Trip aggregate."""

    def __init__(self, trip_service: TripService, city_service: CityService):
        self.trip_service = trip_service
        self.city_service = city_service

    def add_stop(
        self,
        trip_id: int,
        city_id: int,
        requesting_user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        notes: Optional[str] = None,
    ) -> TripStop:
        """Adds a destination stop to a trip after verifying ownership and city existence."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        city = self.city_service.get_city(city_id)

        stop = TripStop(
            id=None,
            trip_id=trip.id or trip_id,
            city_id=city.id or city_id,
            start_date=start_date,
            end_date=end_date,
            city=city,
            notes=notes,
        )

        trip.add_stop(stop)
        self.trip_service.trip_repository.save(trip)
        return stop

    def list_trip_stops(self, trip_id: int, requesting_user_id: int) -> List[TripStop]:
        """Lists all stops for a authorized trip ordered by sequence."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        return trip.stops

    def update_stop(
        self,
        trip_id: int,
        stop_id: int,
        requesting_user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        notes: Optional[str] = None,
    ) -> TripStop:
        """Updates stay dates or notes for a stop on a trip."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        stop = next((s for s in trip.stops if s.id == stop_id), None)
        if not stop:
            raise KeyError(f"TripStop with ID {stop_id} not found in Trip {trip_id}.")

        if start_date is not None or end_date is not None:
            new_start = start_date if start_date is not None else stop.start_date
            new_end = end_date if end_date is not None else stop.end_date
            stop.update_dates(new_start, new_end)

        if notes is not None:
            stop.notes = notes

        self.trip_service.trip_repository.save(trip)
        return stop

    def remove_stop(self, trip_id: int, stop_id: int, requesting_user_id: int) -> bool:
        """Removes a stop from a trip."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        removed = trip.remove_stop(stop_id)
        if not removed:
            raise KeyError(f"TripStop with ID {stop_id} not found in Trip {trip_id}.")

        self.trip_service.trip_repository.save(trip)
        return True

    def reorder_stops(
        self,
        trip_id: int,
        ordered_stop_ids: List[int],
        requesting_user_id: int,
    ) -> List[TripStop]:
        """Reorders stops deterministically."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        trip.reorder_stops(ordered_stop_ids)
        self.trip_service.trip_repository.save(trip)
        return trip.stops
