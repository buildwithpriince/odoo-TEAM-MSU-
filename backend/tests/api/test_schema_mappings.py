# -*- coding: utf-8 -*-
from datetime import date
import unittest

from backend.src.domain.models.trip import Trip
from backend.src.domain.models.city import City
from backend.src.domain.models.trip_stop import TripStop
from backend.src.domain.models.activity import Activity
from backend.src.domain.models.trip_activity import TripActivity
from backend.src.domain.models.expense import Expense
from backend.src.domain.enums.trip_status import TripStatus
from backend.src.domain.enums.activity_category import ActivityCategory
from backend.src.domain.enums.expense_category import ExpenseCategory

from backend.src.api.schemas.trip_schemas import TripResponse, map_status_to_frontend
from backend.src.api.schemas.trip_stop_schemas import TripStopResponse
from backend.src.api.schemas.activity_schemas import ActivityResponse
from backend.src.api.schemas.trip_activity_schemas import TripActivityResponse
from backend.src.api.schemas.itinerary_schemas import ItineraryDayResponse, ItineraryResponse
from backend.src.api.schemas.budget_schemas import BudgetBreakdownResponse, BudgetSummaryResponse
from backend.src.services.trip_service import TripService
from backend.src.services.city_service import CityService
from backend.src.services.trip_stop_service import TripStopService
from backend.src.services.activity_service import ActivityService
from backend.src.services.trip_activity_service import TripActivityService
from backend.src.services.itinerary_service import ItineraryService
from backend.src.services.budget_service import BudgetService


class TestApiSchemaContractMappings(unittest.TestCase):
    """Test suite verifying API DTO serialization and frontend TypeScript contract alignment."""

    def test_trip_status_mapping(self):
        self.assertEqual(map_status_to_frontend(TripStatus.DRAFT), "planning")
        self.assertEqual(map_status_to_frontend(TripStatus.PLANNED), "upcoming")
        self.assertEqual(map_status_to_frontend(TripStatus.ONGOING), "upcoming")
        self.assertEqual(map_status_to_frontend(TripStatus.COMPLETED), "completed")
        self.assertEqual(map_status_to_frontend(TripStatus.CANCELLED), "completed")

    def test_trip_dto_mapping(self):
        trip = Trip(
            id=10,
            name="Rajasthan Tour",
            description="Cultural circuit",
            owner_id=5,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 10),
            target_budget=50000.0,
            currency_code="INR",
            state=TripStatus.DRAFT,
            cover_image="https://example.com/cover.jpg",
            travel_vibe="Culture"
        )
        dto = TripResponse.from_domain(trip)
        d = dto.to_dict()

        self.assertEqual(d["id"], "10")
        self.assertEqual(d["title"], "Rajasthan Tour")
        self.assertEqual(d["startDate"], "2026-09-01")
        self.assertEqual(d["endDate"], "2026-09-10")
        self.assertEqual(d["totalBudget"], 50000.0)
        self.assertEqual(d["currency"], "INR")
        self.assertEqual(d["status"], "planning")
        self.assertEqual(d["coverImage"], "https://example.com/cover.jpg")
        self.assertEqual(d["travelVibe"], "Culture")

    def test_trip_stop_dto_mapping(self):
        city = City(id=1, name="Jaipur", country="India", image_url="https://example.com/jaipur.jpg")
        stop = TripStop(
            id=100,
            trip_id=10,
            city_id=1,
            sequence=1,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 4),
            city=city,
            notes="Stay at heritage hotel"
        )
        dto = TripStopResponse.from_domain(stop)
        d = dto.to_dict()

        self.assertEqual(d["id"], "100")
        self.assertEqual(d["cityName"], "Jaipur")
        self.assertEqual(d["country"], "India")
        self.assertEqual(d["arrivalDate"], "2026-09-01")
        self.assertEqual(d["departureDate"], "2026-09-04")
        self.assertEqual(d["coverImage"], "https://example.com/jaipur.jpg")
        self.assertEqual(d["notes"], "Stay at heritage hotel")

    def test_trip_activity_dto_mapping(self):
        act = Activity(id=5, name="Amer Fort Tour", city_id=1, category=ActivityCategory.SIGHTSEEING, duration_minutes=180)
        ta = TripActivity(
            id=50,
            trip_id=10,
            stop_id=100,
            activity_id=5,
            scheduled_date=date(2026, 9, 2),
            start_time="09:00",
            end_time="12:00",
            cost=500.0,
            notes="Camera guide",
            activity=act
        )
        dto = TripActivityResponse.from_domain(ta)
        d = dto.to_dict()

        self.assertEqual(d["id"], "50")
        self.assertEqual(d["title"], "Amer Fort Tour")
        self.assertEqual(d["time"], "09:00")
        self.assertEqual(d["duration"], "180 mins")
        self.assertEqual(d["category"], "sightseeing")
        self.assertEqual(d["cost"], 500.0)
        self.assertEqual(d["notes"], "Camera guide")

    def test_itinerary_dto_day_number(self):
        trip_service = TripService()
        city_service = CityService()
        stop_service = TripStopService(trip_service, city_service)
        itinerary_service = ItineraryService(trip_service)

        jaipur = city_service.create_city(name="Jaipur", country="India")
        trip = trip_service.create_trip(
            owner_id=1, name="Jaipur Trip", start_date=date(2026, 9, 1), end_date=date(2026, 9, 3)
        )
        stop_service.add_stop(trip.id, jaipur.id, 1, start_date=date(2026, 9, 1), end_date=date(2026, 9, 3))

        itinerary = itinerary_service.get_itinerary(trip.id, requesting_user_id=1)
        d_json = itinerary.to_dict()

        self.assertEqual(len(d_json["days"]), 3)
        self.assertEqual(d_json["days"][0]["dayNumber"], 1)
        self.assertEqual(d_json["days"][0]["title"], "Day 1 - Jaipur")
        self.assertEqual(d_json["days"][2]["dayNumber"], 3)

    def test_budget_summary_dto_presentation_labels(self):
        trip_service = TripService()
        city_service = CityService()
        stop_service = TripStopService(trip_service, city_service)
        act_service = ActivityService(city_service)
        ta_service = TripActivityService(trip_service, city_service, stop_service, act_service)
        budget_service = BudgetService(trip_service)

        jaipur = city_service.create_city(name="Jaipur", country="India")
        act = act_service.create_activity("Fort", jaipur.id, cost=500.0)

        trip = trip_service.create_trip(owner_id=1, name="Budget Trip", start_date=date(2026, 9, 1), end_date=date(2026, 9, 3), target_budget=20000.0)
        stop = stop_service.add_stop(trip.id, jaipur.id, 1, start_date=date(2026, 9, 1), end_date=date(2026, 9, 3))
        ta_service.add_activity_to_stop(trip.id, stop.id, act.id, 1, cost_override=500.0)

        trip.add_expense(Expense(id=1, trip_id=trip.id, category=ExpenseCategory.TRANSPORT, amount=4000.0))
        trip.add_expense(Expense(id=2, trip_id=trip.id, category=ExpenseCategory.ACCOMMODATION, amount=6000.0))

        summary = budget_service.get_budget_summary(trip.id, 1)
        b_json = summary.to_dict()

        self.assertEqual(b_json["totalBudget"], 20000.0)
        self.assertEqual(b_json["estimatedTotal"], 10500.0)
        self.assertEqual(b_json["remaining"], 9500.0)
        self.assertFalse(b_json["isOverBudget"])

        # Check frontend BudgetCategory presentation labels
        bd = b_json["breakdown"]
        self.assertEqual(bd["Flights"], 4000.0)
        self.assertEqual(bd["Lodging"], 6000.0)
        self.assertEqual(bd["Activities"], 500.0)


if __name__ == '__main__':
    unittest.main()
