# -*- coding: utf-8 -*-
from datetime import date
import unittest

from backend.src.domain.models.city import City
from backend.src.domain.models.trip import Trip
from backend.src.domain.models.trip_stop import TripStop
from backend.src.domain.models.activity import Activity
from backend.src.domain.models.trip_activity import TripActivity
from backend.src.domain.enums.activity_category import ActivityCategory
from backend.src.domain.rules.trip_activity_rules import (
    ActivityCityMismatchError,
    ActivityOutsideStopDatesError,
)
from backend.src.infrastructure.database.connection import init_db, Base, engine
from backend.src.services.trip_service import TripService
from backend.src.services.city_service import CityService
from backend.src.services.trip_stop_service import TripStopService
from backend.src.services.activity_service import ActivityService
from backend.src.services.trip_activity_service import TripActivityService


class TestTripActivityDomainBehavior(unittest.TestCase):
    """Behavioral unit test suite for TripActivity entity and domain rules."""

    def test_valid_trip_activity_creation(self):
        act_catalog = Activity(id=1, name="Amber Fort", city_id=10, cost=500.0)
        ta = TripActivity(
            id=100,
            trip_id=1,
            stop_id=5,
            activity_id=1,
            scheduled_date=date(2026, 9, 2),
            start_time="09:00",
            end_time="12:00",
            cost=500.0,
            activity=act_catalog
        )
        self.assertEqual(ta.activity.name, "Amber Fort")
        self.assertEqual(ta.cost, 500.0)
        self.assertEqual(ta.start_time, "09:00")

    def test_activity_city_mismatch_fails(self):
        self.trip_service = TripService()
        self.city_service = CityService()
        self.stop_service = TripStopService(self.trip_service, self.city_service)
        self.act_service = ActivityService(self.city_service)
        self.service = TripActivityService(self.trip_service, self.city_service, self.stop_service, self.act_service)

        trip = self.trip_service.create_trip(owner_id=1, name="Jaipur Trip")
        city_j = self.city_service.create_city("Jaipur", "India")
        city_u = self.city_service.create_city("Udaipur", "India")

        stop = self.stop_service.add_stop(trip.id, city_j.id, 1)
        act = self.act_service.create_activity("Lake Pichola Boat", city_u.id)

        # Attempting to add Udaipur activity onto Jaipur stop must raise error
        with self.assertRaises(ActivityCityMismatchError):
            self.service.add_activity_to_stop(
                trip_id=trip.id,
                stop_id=stop.id,
                activity_id=act.id,
                requesting_user_id=1
            )


class TestTripActivityServiceBehavior(unittest.TestCase):
    """Integration unit test suite for TripActivityService operations."""

    def setUp(self):
        init_db()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        self.trip_service = TripService()
        self.city_service = CityService()
        self.stop_service = TripStopService(self.trip_service, self.city_service)
        self.activity_service = ActivityService(self.city_service)
        self.trip_act_service = TripActivityService(
            self.trip_service, self.city_service, self.stop_service, self.activity_service
        )

        self.jaipur = self.city_service.create_city(name="Jaipur", country="India")
        self.act1 = self.activity_service.create_activity("Amber Fort", self.jaipur.id, cost=500.0)
        self.act2 = self.activity_service.create_activity("Hawa Mahal", self.jaipur.id, cost=200.0)

        self.trip = self.trip_service.create_trip(
            owner_id=1,
            name="Jaipur Weekend",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 5)
        )
        self.stop_jaipur = self.stop_service.add_stop(
            self.trip.id, self.jaipur.id, 1,
            start_date=date(2026, 9, 1), end_date=date(2026, 9, 5)
        )

    def test_add_multiple_activities_to_one_stop(self):
        ta1 = self.trip_act_service.add_activity_to_stop(
            self.trip.id, self.stop_jaipur.id, self.act1.id, 1, scheduled_date=date(2026, 9, 2), start_time="09:00"
        )
        ta2 = self.trip_act_service.add_activity_to_stop(
            self.trip.id, self.stop_jaipur.id, self.act2.id, 1, scheduled_date=date(2026, 9, 2), start_time="14:00"
        )

        trip = self.trip_service.get_trip(self.trip.id, 1)
        stop = trip.stops[0]
        self.assertEqual(len(stop.activities), 2)
        self.assertEqual(stop.activities[0].activity.name, "Amber Fort")
        self.assertEqual(stop.activities[1].activity.name, "Hawa Mahal")

    def test_update_activity_cost_and_time(self):
        ta = self.trip_act_service.add_activity_to_stop(
            self.trip.id, self.stop_jaipur.id, self.act1.id, 1
        )
        updated = self.trip_act_service.update_trip_activity(
            self.trip.id, self.stop_jaipur.id, ta.id, 1,
            start_time="10:30", cost=600.0, notes="Booked fast track ticket"
        )
        self.assertEqual(updated.start_time, "10:30")
        self.assertEqual(updated.cost, 600.0)
        self.assertEqual(updated.notes, "Booked fast track ticket")

    def test_remove_activity_from_stop(self):
        ta = self.trip_act_service.add_activity_to_stop(
            self.trip.id, self.stop_jaipur.id, self.act1.id, 1
        )
        self.trip_act_service.remove_activity_from_stop(self.trip.id, self.stop_jaipur.id, ta.id, 1)
        trip = self.trip_service.get_trip(self.trip.id, 1)
        self.assertEqual(len(trip.stops[0].activities), 0)


if __name__ == '__main__':
    unittest.main()
