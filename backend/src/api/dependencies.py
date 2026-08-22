# -*- coding: utf-8 -*-
from typing import Optional
from fastapi import Header

from ..services.trip_service import TripService
from ..services.city_service import CityService
from ..services.trip_stop_service import TripStopService
from ..services.activity_service import ActivityService
from ..services.trip_activity_service import TripActivityService
from ..services.itinerary_service import ItineraryService
from ..services.budget_service import BudgetService

# Singletons for domain services
trip_service = TripService()
city_service = CityService()
trip_stop_service = TripStopService(trip_service, city_service)
activity_service = ActivityService(city_service)
trip_activity_service = TripActivityService(
    trip_service, city_service, trip_stop_service, activity_service
)
itinerary_service = ItineraryService(trip_service)
budget_service = BudgetService(trip_service)


def get_requesting_user_id(x_user_id: Optional[str] = Header(None)) -> int:
    """Authentication boundary dependency. Extracts requesting user ID from X-User-Id header.

    Defaults to user ID 1 for local development testing when header is omitted.
    """
    if x_user_id is None:
        return 1
    try:
        user_id = int(x_user_id)
        if user_id <= 0:
            return 1
        return user_id
    except ValueError:
        return 1
