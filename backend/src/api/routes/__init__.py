# -*- coding: utf-8 -*-
from .trips import router as trips_router
from .stops import router as stops_router
from .activities import router as activities_router
from .trip_activities import router as trip_activities_router
from .itinerary import router as itinerary_router
from .budget import router as budget_router
from .expenses import router as expenses_router

__all__ = [
    "trips_router",
    "stops_router",
    "activities_router",
    "trip_activities_router",
    "itinerary_router",
    "budget_router",
    "expenses_router",
]
