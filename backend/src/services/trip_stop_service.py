# -*- coding: utf-8 -*-
from datetime import date
from typing import List, Optional

from ..domain.models.trip_stop import TripStop
from ..domain.rules.trip_stop_rules import validate_stop_within_trip_dates
from .trip_service import TripService
from .city_service import CityService


class TripStopService:
    """Domain service for managing TripStop lifecycle, ordering, and date boundary validation."""

    def __init__(self, trip_service: TripService, city_service: CityService):
        self.trip_service = trip_service
        self.city_service = city_service
        self._next_stop_id: int = 1

    def add_stop(
        self,
        trip_id: int,
        city_id: int,
        requesting_user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        notes: Optional[str] = None,
    ) -> TripStop:
        """Adds a new destination stop to a trip, checking ownership, city reference, and trip dates."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        city = self.city_service.get_city(city_id)

        stop = TripStop(
            id=self._next_stop_id,
            trip_id=trip.id or trip_id,
            city_id=city.id or city_id,
            sequence=len(trip.stops) + 1,
            start_date=start_date,
            end_date=end_date,
            city=city,
            notes=notes,
        )
        self._next_stop_id += 1

        trip.add_stop(stop)
        return stop

    def update_stop(
        self,
        trip_id: int,
        stop_id: int,
        requesting_user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        notes: Optional[str] = None,
    ) -> TripStop:
        """Updates stop stay dates and notes, validating boundaries against parent trip."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        stop = next((s for s in trip.stops if s.id == stop_id), None)
        if not stop:
            raise KeyError(f"TripStop with ID {stop_id} not found in Trip {trip_id}.")

        new_start = start_date if start_date is not None else stop.start_date
        new_end = end_date if end_date is not None else stop.end_date

        validate_stop_within_trip_dates(
            stop_start=new_start,
            stop_end=new_end,
            trip_start=trip.start_date,
            trip_end=trip.end_date,
        )

        stop.update_dates(new_start, new_end)
        if notes is not None:
            stop.notes = notes

        return stop

    def remove_stop(self, trip_id: int, stop_id: int, requesting_user_id: int) -> bool:
        """Removes a stop from trip and re-sequences remaining stops deterministically."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        removed = trip.remove_stop(stop_id)
        if not removed:
            raise KeyError(f"TripStop with ID {stop_id} not found in Trip {trip_id}.")
        return True

    def reorder_stops(
        self,
        trip_id: int,
        requesting_user_id: int,
        ordered_stop_ids: List[int],
    ) -> List[TripStop]:
        """Reorders stops deterministically based on provided list of stop IDs."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        trip.reorder_stops(ordered_stop_ids)
        return trip.stops
