# -*- coding: utf-8 -*-
from datetime import date
import unittest

from backend.src.domain.models.expense import Expense
from backend.src.domain.enums.expense_category import ExpenseCategory
from backend.src.domain.enums.activity_category import ActivityCategory
from backend.src.domain.rules.trip_rules import TripOwnershipError

from backend.src.infrastructure.database.connection import init_db, Base, engine, SessionLocal
from backend.src.infrastructure.repositories.sqlalchemy_repositories import (
    SqlAlchemyTripRepository,
    SqlAlchemyCityRepository,
    SqlAlchemyActivityRepository,
)
from backend.src.services.trip_service import TripService
from backend.src.services.city_service import CityService
from backend.src.services.trip_stop_service import TripStopService
from backend.src.services.activity_service import ActivityService
from backend.src.services.trip_activity_service import TripActivityService
from backend.src.services.itinerary_service import ItineraryService
from backend.src.services.budget_service import BudgetService


class TestDatabasePersistenceAndSecurity(unittest.TestCase):
    """Integration test suite proving persistent database storage and multi-tenant security."""

    def setUp(self):
        init_db()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        self.trip_repo = SqlAlchemyTripRepository(SessionLocal)
        self.city_repo = SqlAlchemyCityRepository(SessionLocal)
        self.act_repo = SqlAlchemyActivityRepository(SessionLocal)

        self.trip_service = TripService(self.trip_repo)
        self.city_service = CityService(self.city_repo)
        self.stop_service = TripStopService(self.trip_service, self.city_service)
        self.act_service = ActivityService(self.city_service, self.act_repo)
        self.trip_act_service = TripActivityService(
            self.trip_service, self.city_service, self.stop_service, self.act_service
        )
        self.itinerary_service = ItineraryService(self.trip_service)
        self.budget_service = BudgetService(self.trip_service)

    def test_full_p0_persistent_flow_and_server_restart(self):
        # 1. Create Trip
        trip = self.trip_service.create_trip(
            owner_id=1,
            name="Persistent Rajasthan Circuit",
            description="Full persistence test",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 5),
            target_budget=25000.0
        )
        trip_id = trip.id

        # 2. Add City & Stop
        jaipur = self.city_service.create_city(name="Jaipur", country="India")
        stop = self.stop_service.add_stop(
            trip_id, jaipur.id, requesting_user_id=1, start_date=date(2026, 9, 1), end_date=date(2026, 9, 3)
        )

        # 3. Add Activity & Schedule onto Stop
        act = self.act_service.create_activity(
            name="Amber Fort", city_id=jaipur.id, category=ActivityCategory.SIGHTSEEING, cost=500.0
        )
        ta = self.trip_act_service.add_activity_to_stop(
            trip_id, stop.id, act.id, requesting_user_id=1, scheduled_date=date(2026, 9, 2), cost_override=600.0
        )

        # 4. Add Expense
        saved_trip = self.trip_service.get_trip(trip_id, 1)
        saved_trip.add_expense(Expense(id=None, trip_id=trip_id, category=ExpenseCategory.TRANSPORT, amount=4000.0))
        self.trip_service.trip_repository.save(saved_trip)

        # Verify initial budget calculation before restart
        b1 = self.budget_service.get_budget_summary(trip_id, requesting_user_id=1)
        self.assertEqual(b1.estimatedTotal, 4600.0)

        # --- SIMULATE SERVER RESTART ---
        # Clear Python memory references and instantiate fresh service instances
        new_trip_repo = SqlAlchemyTripRepository(SessionLocal)
        new_city_repo = SqlAlchemyCityRepository(SessionLocal)
        new_act_repo = SqlAlchemyActivityRepository(SessionLocal)

        new_trip_service = TripService(new_trip_repo)
        new_city_service = CityService(new_city_repo)
        new_stop_service = TripStopService(new_trip_service, new_city_service)
        new_act_service = ActivityService(new_city_service, new_act_repo)
        new_trip_act_service = TripActivityService(
            new_trip_service, new_city_service, new_stop_service, new_act_service
        )
        new_itin_service = ItineraryService(new_trip_service)
        new_budget_service = BudgetService(new_trip_service)

        # 5. Retrieve Trip after restart -> Data survives!
        recreated_trip = new_trip_service.get_trip(trip_id, requesting_user_id=1)
        self.assertEqual(recreated_trip.name, "Persistent Rajasthan Circuit")
        self.assertEqual(len(recreated_trip.stops), 1)
        self.assertEqual(recreated_trip.stops[0].city.name, "Jaipur")
        self.assertEqual(len(recreated_trip.stops[0].activities), 1)
        self.assertEqual(recreated_trip.stops[0].activities[0].activity.name, "Amber Fort")
        self.assertEqual(recreated_trip.stops[0].activities[0].cost, 600.0)

        # 6. Retrieve Itinerary after restart -> Survives!
        itin = new_itin_service.get_itinerary(trip_id, requesting_user_id=1)
        self.assertEqual(len(itin.days), 5)
        self.assertEqual(itin.days[1].activities[0].title, "Amber Fort")

        # 7. Retrieve Budget after restart -> Recalculates accurately!
        b2 = new_budget_service.get_budget_summary(trip_id, requesting_user_id=1)
        self.assertEqual(b2.estimatedTotal, 4600.0)
        self.assertEqual(b2.remaining, 20400.0)

    def test_multi_user_tenant_security(self):
        # User 1 creates Trip A
        trip_a = self.trip_service.create_trip(owner_id=101, name="User 1 Private Trip")
        # User 2 creates Trip B
        trip_b = self.trip_service.create_trip(owner_id=202, name="User 2 Private Trip")

        # User 1 can access Trip A, but CANNOT access Trip B
        self.assertEqual(self.trip_service.get_trip(trip_a.id, 101).name, "User 1 Private Trip")
        with self.assertRaises(TripOwnershipError):
            self.trip_service.get_trip(trip_b.id, requesting_user_id=101)

        # User 2 can access Trip B, but CANNOT access Trip A
        self.assertEqual(self.trip_service.get_trip(trip_b.id, 202).name, "User 2 Private Trip")
        with self.assertRaises(TripOwnershipError):
            self.trip_service.get_trip(trip_a.id, requesting_user_id=202)


if __name__ == '__main__':
    unittest.main()
