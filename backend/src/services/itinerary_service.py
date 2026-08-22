# -*- coding: utf-8 -*-
from datetime import date, timedelta
from typing import List, Optional, Dict

from .trip_service import TripService
from ..api.schemas.city_schemas import CityResponse
from ..api.schemas.trip_activity_schemas import TripActivityResponse
from ..api.schemas.itinerary_schemas import ItineraryDayResponse, ItineraryResponse


class ItineraryService:
    """Domain service producing derived frontend-friendly day-wise itinerary projections."""

    def __init__(self, trip_service: TripService):
        self.trip_service = trip_service

    def get_itinerary(self, trip_id: int, requesting_user_id: int) -> ItineraryResponse:
        """Generates an authoritative, derived day-wise itinerary projection for a trip."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)

        dates: List[date] = []
        if trip.start_date and trip.end_date:
            curr = trip.start_date
            while curr <= trip.end_date:
                dates.append(curr)
                curr += timedelta(days=1)

        itinerary_days: List[ItineraryDayResponse] = []

        for idx, d in enumerate(dates, start=1):
            d_str = d.isoformat()

            # 1. Determine associated city from TripStops covering date d
            active_stop = next(
                (s for s in trip.stops if s.start_date and s.end_date and s.start_date <= d <= s.end_date),
                None
            )
            city_dto = CityResponse.from_domain(active_stop.city) if (active_stop and active_stop.city) else None
            city_name = active_stop.city.name if (active_stop and active_stop.city) else ""

            day_title = f"Day {idx}" + (f" - {city_name}" if city_name else "")

            # 2. Collect activities scheduled on date d across all stops
            day_activities = []
            for stop in trip.stops:
                for act in stop.activities:
                    if act.scheduled_date == d:
                        day_activities.append(act)

            # 3. Deterministically sort activities chronologically by start_time, then ID
            day_activities.sort(
                key=lambda a: (a.start_time if a.start_time else "99:99", a.id or 0)
            )

            act_dtos = [TripActivityResponse.from_domain(a) for a in day_activities]

            # 4. Calculate daily activity + expense cost
            activity_cost = sum(a.cost for a in day_activities)
            expense_cost = sum(e.amount for e in trip.expenses if e.expense_date == d)
            daily_total = activity_cost + expense_cost

            itinerary_days.append(
                ItineraryDayResponse(
                    dayNumber=idx,
                    date=d_str,
                    title=day_title,
                    city=city_dto,
                    activities=act_dtos,
                    daily_total_cost=round(daily_total, 2)
                )
            )

        return ItineraryResponse(
            trip_id=trip.id or trip_id,
            trip_name=trip.name,
            days=itinerary_days
        )
