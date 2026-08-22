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

from backend.src.infrastructure.database.connection import init_db, Base, engine
from backend.src.services.trip_service import TripService
from backend.src.services.city_service import CityService
from backend.src.services.trip_stop_service import TripStopService
from backend.src.services.activity_service import ActivityService
from backend.src.services.trip_activity_service import TripActivityService
from backend.src.services.budget_service import BudgetService

from backend.src.api.schemas.trip_schemas import TripResponse
from backend.src.api.schemas.trip_stop_schemas import TripStopResponse
from backend.src.api.schemas.activity_schemas import ActivityResponse
from backend.src.api.schemas.trip_activity_schemas import TripActivityResponse


class TestApiSchemaContractMappings(unittest.TestCase):
    """Test suite ensuring API DTO schemas match frontend TypeScript interfaces."""

    def setUp(self):
        init_db()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        self.jaipur = City(id=1, name="Jaipur", country="India", cost_index=2, popularity=4.5)
        self.stop = TripStop(
            id=10,
            trip_id=1,
            city_id=1,
            sequence=1,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 3),
            city=self.jaipur,
            notes="Stay in Pink City"
        )
        self.act_catalog = Activity(
            id=100,
            name="Amber Fort",
            city_id=1,
            category=ActivityCategory.SIGHTSEEING,
            cost=500.0,
            duration_minutes=180
        )
        self.trip_activity = TripActivity(
            id=50,
            trip_id=1,
            stop_id=10,
            activity_id=100,
            scheduled_date=date(2026, 9, 2),
            start_time="09:00",
            end_time="12:00",
            cost=500.0,
            notes="Booked online",
            activity=self.act_catalog
        )

    def test_trip_dto_json_keys(self):
        trip = Trip(
            id=1,
            name="Rajasthan Tour",
            description="Cultural circuit",
            owner_id=5,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 10),
            target_budget=25000.0,
            currency_code="INR",
            state=TripStatus.PLANNED
        )
        dto = TripResponse.from_domain(trip)

        self.assertEqual(dto.title, "Rajasthan Tour")
        self.assertEqual(dto.startDate, "2026-09-01")
        self.assertEqual(dto.endDate, "2026-09-10")
        self.assertEqual(dto.totalBudget, 25000.0)
        self.assertEqual(dto.currency, "INR")
        self.assertEqual(dto.status, "upcoming")

    def test_trip_stop_dto_json_keys(self):
        dto = TripStopResponse.from_domain(self.stop)

        self.assertEqual(dto.cityName, "Jaipur")
        self.assertEqual(dto.country, "India")
        self.assertEqual(dto.arrivalDate, "2026-09-01")
        self.assertEqual(dto.departureDate, "2026-09-03")

    def test_activity_dto_json_keys(self):
        dto = ActivityResponse.from_domain(self.act_catalog)

        self.assertEqual(dto.title, "Amber Fort")
        self.assertEqual(dto.duration, "180 mins")
        self.assertEqual(dto.category, "sightseeing")

    def test_trip_activity_dto_json_keys(self):
        dto = TripActivityResponse.from_domain(self.trip_activity)

        self.assertEqual(dto.title, "Amber Fort")
        self.assertEqual(dto.time, "09:00")
        self.assertEqual(dto.cost, 500.0)

    def test_budget_summary_dto_presentation_labels(self):
        trip_service = TripService()
        city_service = CityService()
        stop_service = TripStopService(trip_service, city_service)
        act_service = ActivityService(city_service)
        trip_act_service = TripActivityService(trip_service, city_service, stop_service, act_service)
        budget_service = BudgetService(trip_service)

        city = city_service.create_city("Jaipur", "India")
        act = act_service.create_activity("Fort Visit", city.id, cost=500.0)

        trip = trip_service.create_trip(owner_id=1, name="Budget Trip", start_date=date(2026, 9, 1), end_date=date(2026, 9, 5), target_budget=20000.0)
        stop = stop_service.add_stop(trip.id, city.id, 1, start_date=date(2026, 9, 1), end_date=date(2026, 9, 5))
        trip_act_service.add_activity_to_stop(trip.id, stop.id, act.id, 1, cost_override=500.0)

        t = trip_service.get_trip(trip.id, 1)
        t.add_expense(Expense(id=None, trip_id=trip.id, category=ExpenseCategory.TRANSPORT, amount=10000.0))
        trip_service.trip_repository.save(t)

        dto = budget_service.get_budget_summary(trip.id, requesting_user_id=1)

        self.assertEqual(dto.totalBudget, 20000.0)
        self.assertEqual(dto.estimatedTotal, 10500.0)
        self.assertEqual(dto.remaining, 9500.0)
        self.assertFalse(dto.isOverBudget)

        b_dict = dto.to_dict()["breakdown"]
        self.assertEqual(b_dict.get("Flights"), 10000.0)
        self.assertEqual(b_dict.get("Activities"), 500.0)


if __name__ == '__main__':
    unittest.main()
