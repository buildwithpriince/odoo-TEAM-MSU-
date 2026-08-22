# -*- coding: utf-8 -*-
from datetime import date
from typing import List, Optional

from ..domain.models.trip_activity import TripActivity
from ..domain.rules.trip_activity_rules import (
    validate_activity_city_matches_stop_city,
    validate_activity_within_stop_dates,
)
from .trip_service import TripService
from .city_service import CityService
from .trip_stop_service import TripStopService
from .activity_service import ActivityService


class TripActivityService:
    """Domain service managing scheduled TripActivity selections backed by aggregate persistence."""

    def __init__(
        self,
        trip_service: TripService,
        city_service: CityService,
        trip_stop_service: TripStopService,
        activity_service: ActivityService,
    ):
        self.trip_service = trip_service
        self.city_service = city_service
        self.trip_stop_service = trip_stop_service
        self.activity_service = activity_service

    def add_activity_to_stop(
        self,
        trip_id: int,
        stop_id: int,
        activity_id: int,
        requesting_user_id: int,
        scheduled_date: Optional[date] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        cost_override: Optional[float] = None,
        notes: Optional[str] = None,
    ) -> TripActivity:
        """Schedules a catalog activity onto a trip stop, enforcing city match and date bounds."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        stop = next((s for s in trip.stops if s.id == stop_id), None)
        if not stop:
            raise KeyError(f"TripStop with ID {stop_id} not found in Trip {trip_id}.")

        activity = self.activity_service.get_activity(activity_id)

        # Enforce Critical Rule 1: Activity city must match TripStop city
        validate_activity_city_matches_stop_city(activity.city_id, stop.city_id)

        # Enforce Critical Rule 2: Scheduled date must fall within stop start_date and end_date
        validate_activity_within_stop_dates(
            activity_date=scheduled_date,
            stop_start=stop.start_date,
            stop_end=stop.end_date,
        )

        selected_cost = cost_override if cost_override is not None else activity.cost

        trip_activity = TripActivity(
            id=None,
            trip_id=trip.id or trip_id,
            stop_id=stop.id or stop_id,
            activity_id=activity.id or activity_id,
            scheduled_date=scheduled_date,
            start_time=start_time,
            end_time=end_time,
            cost=selected_cost,
            notes=notes,
            activity=activity,
        )

        stop.add_activity(trip_activity)
        self.trip_service.trip_repository.save(trip)
        return trip_activity

    def update_trip_activity(
        self,
        trip_id: int,
        stop_id: int,
        trip_activity_id: int,
        requesting_user_id: int,
        scheduled_date: Optional[date] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        cost: Optional[float] = None,
        notes: Optional[str] = None,
    ) -> TripActivity:
        """Updates a scheduled activity's date, time, cost, or notes."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        stop = next((s for s in trip.stops if s.id == stop_id), None)
        if not stop:
            raise KeyError(f"TripStop with ID {stop_id} not found in Trip {trip_id}.")

        act = next((a for a in stop.activities if a.id == trip_activity_id), None)
        if not act:
            raise KeyError(f"TripActivity with ID {trip_activity_id} not found in Stop {stop_id}.")

        new_date = scheduled_date if scheduled_date is not None else act.scheduled_date
        validate_activity_within_stop_dates(
            activity_date=new_date,
            stop_start=stop.start_date,
            stop_end=stop.end_date,
        )

        act.update_schedule(
            scheduled_date=new_date,
            start_time=start_time if start_time is not None else act.start_time,
            end_time=end_time if end_time is not None else act.end_time,
        )

        if cost is not None:
            act.update_cost(cost)

        if notes is not None:
            act.notes = notes

        self.trip_service.trip_repository.save(trip)
        return act

    def remove_activity_from_stop(
        self,
        trip_id: int,
        stop_id: int,
        trip_activity_id: int,
        requesting_user_id: int,
    ) -> bool:
        """Removes a scheduled activity from a trip stop."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)
        stop = next((s for s in trip.stops if s.id == stop_id), None)
        if not stop:
            raise KeyError(f"TripStop with ID {stop_id} not found in Trip {trip_id}.")

        removed = stop.remove_activity(trip_activity_id)
        if not removed:
            raise KeyError(f"TripActivity with ID {trip_activity_id} not found in Stop {stop_id}.")

        self.trip_service.trip_repository.save(trip)
        return True
