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
    TripStopMismatchError,
    ActivityOutsideStopDatesError,
    InvalidTripActivityCostError,
)
from backend.src.services.trip_service import TripService
from backend.src.services.city_service import CityService
from backend.src.services.trip_stop_service import TripStopService
from backend.src.services.activity_service import ActivityService
from backend.src.services.trip_activity_service import TripActivityService
from backend.src.api.schemas.trip_activity_schemas import TripActivityResponse


class TestTripActivityDomainBehavior(unittest.TestCase):
    """Behavioral unit test suite for TripActivity entity and critical consistency rules."""

    def setUp(self):
        self.jaipur = City(id=1, name="Jaipur", country="India")
        self.srinagar = City(id=2, name="Srinagar", country="India")

        self.amber_fort = Activity(
            id=10,
            name="Amber Fort Tour",
            city_id=self.jaipur.id,
            category=ActivityCategory.SIGHTSEEING,
            cost=500.0
        )
        self.shikara = Activity(
            id=20,
            name="Shikara Ride",
            city_id=self.srinagar.id,
            category=ActivityCategory.LEISURE,
            cost=800.0
        )

        self.trip_a = Trip(id=100, name="Rajasthan Explorer", owner_id=5, start_date=date(2026, 9, 1), end_date=date(2026, 9, 10))
        self.stop_jaipur = TripStop(id=1000, trip_id=self.trip_a.id, city_id=self.jaipur.id, start_date=date(2026, 9, 1), end_date=date(2026, 9, 5), city=self.jaipur)
        self.trip_a.add_stop(self.stop_jaipur)

    def test_same_city_activity_passes(self):
        trip_act = TripActivity(
            id=1,
            trip_id=self.trip_a.id,
            stop_id=self.stop_jaipur.id,
            activity_id=self.amber_fort.id,
            scheduled_date=date(2026, 9, 2),
            start_time="10:00",
            cost=500.0,
            activity=self.amber_fort
        )
        self.stop_jaipur.add_activity(trip_act)
        self.assertEqual(len(self.stop_jaipur.activities), 1)
        self.assertEqual(self.stop_jaipur.activities[0].activity.name, "Amber Fort Tour")

    def test_wrong_city_activity_rejected(self):
        """CRITICAL TEST: Activity from Srinagar cannot be added to Jaipur stop."""
        wrong_city_act = TripActivity(
            id=2,
            trip_id=self.trip_a.id,
            stop_id=self.stop_jaipur.id,
            activity_id=self.shikara.id,
            scheduled_date=date(2026, 9, 2),
            activity=self.shikara
        )
        with self.assertRaises(ActivityCityMismatchError):
            self.stop_jaipur.add_activity(wrong_city_act)

    def test_wrong_trip_stop_mismatch_rejected(self):
        """CRITICAL TEST: TripActivity trip_id must match TripStop trip_id."""
        trip_b = Trip(id=200, name="Trip B", owner_id=5)
        stop_b = TripStop(id=2000, trip_id=trip_b.id, city_id=self.jaipur.id)

        mismatched_act = TripActivity(
            id=3,
            trip_id=self.trip_a.id,  # Trip A
            stop_id=stop_b.id,       # Stop B (Trip B)
            activity_id=self.amber_fort.id,
            activity=self.amber_fort
        )
        with self.assertRaises(TripStopMismatchError):
            stop_b.add_activity(mismatched_act)

    def test_activity_date_inside_stop_dates_passes(self):
        act = TripActivity(
            id=4,
            trip_id=self.trip_a.id,
            stop_id=self.stop_jaipur.id,
            activity_id=self.amber_fort.id,
            scheduled_date=date(2026, 9, 3),  # Between Sept 1 and Sept 5
            activity=self.amber_fort
        )
        self.stop_jaipur.add_activity(act)

    def test_activity_date_outside_stop_dates_fails(self):
        act = TripActivity(
            id=5,
            trip_id=self.trip_a.id,
            stop_id=self.stop_jaipur.id,
            activity_id=self.amber_fort.id,
            scheduled_date=date(2026, 9, 8),  # Stop ends Sept 5
            activity=self.amber_fort
        )
        with self.assertRaises(ActivityOutsideStopDatesError):
            self.stop_jaipur.add_activity(act)

    def test_negative_trip_activity_cost_fails(self):
        with self.assertRaises(InvalidTripActivityCostError):
            TripActivity(
                trip_id=1,
                stop_id=1,
                activity_id=1,
                cost=-50.0
            )


class TestTripActivityServiceBehavior(unittest.TestCase):
    """Behavioral unit test suite for TripActivityService operations."""

    def setUp(self):
        self.trip_service = TripService()
        self.city_service = CityService()
        self.stop_service = TripStopService(self.trip_service, self.city_service)
        self.activity_service = ActivityService(self.city_service)
        self.trip_act_service = TripActivityService(
            self.trip_service, self.city_service, self.stop_service, self.activity_service
        )

        self.jaipur = self.city_service.create_city(name="Jaipur", country="India")
        self.udaipur = self.city_service.create_city(name="Udaipur", country="India")

        self.act_jaipur1 = self.activity_service.create_activity("Fort Tour", self.jaipur.id, cost=500.0)
        self.act_jaipur2 = self.activity_service.create_activity("Palace Tour", self.jaipur.id, cost=300.0)
        self.act_udaipur = self.activity_service.create_activity("Boat Ride", self.udaipur.id, cost=400.0)

        self.trip = self.trip_service.create_trip(
            owner_id=10,
            name="Rajasthan Circuit",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 15)
        )
        self.stop_jaipur = self.stop_service.add_stop(
            self.trip.id, self.jaipur.id, 10, start_date=date(2026, 9, 1), end_date=date(2026, 9, 5)
        )
        self.stop_udaipur = self.stop_service.add_stop(
            self.trip.id, self.udaipur.id, 10, start_date=date(2026, 9, 6), end_date=date(2026, 9, 10)
        )

    def test_add_multiple_activities_to_one_stop(self):
        ta1 = self.trip_act_service.add_activity_to_stop(
            trip_id=self.trip.id,
            stop_id=self.stop_jaipur.id,
            activity_id=self.act_jaipur1.id,
            requesting_user_id=10,
            scheduled_date=date(2026, 9, 2),
            cost_override=450.0  # Discounted cost override
        )
        ta2 = self.trip_act_service.add_activity_to_stop(
            trip_id=self.trip.id,
            stop_id=self.stop_jaipur.id,
            activity_id=self.act_jaipur2.id,
            requesting_user_id=10,
            scheduled_date=date(2026, 9, 3)
        )

        self.assertEqual(len(self.stop_jaipur.activities), 2)
        self.assertEqual(ta1.cost, 450.0)  # Overridden cost
        self.assertEqual(ta2.cost, 300.0)  # Catalog default cost

    def test_wrong_city_activity_rejected_by_service(self):
        with self.assertRaises(ActivityCityMismatchError):
            self.trip_act_service.add_activity_to_stop(
                trip_id=self.trip.id,
                stop_id=self.stop_jaipur.id,
                activity_id=self.act_udaipur.id,  # Udaipur activity on Jaipur stop
                requesting_user_id=10
            )

    def test_same_activity_reused_in_different_trips(self):
        trip2 = self.trip_service.create_trip(owner_id=20, name="Second Trip")
        stop2 = self.stop_service.add_stop(trip2.id, self.jaipur.id, 20)

        ta_t1 = self.trip_act_service.add_activity_to_stop(
            trip_id=self.trip.id, stop_id=self.stop_jaipur.id, activity_id=self.act_jaipur1.id, requesting_user_id=10
        )
        ta_t2 = self.trip_act_service.add_activity_to_stop(
            trip_id=trip2.id, stop_id=stop2.id, activity_id=self.act_jaipur1.id, requesting_user_id=20
        )

        self.assertEqual(ta_t1.activity_id, self.act_jaipur1.id)
        self.assertEqual(ta_t2.activity_id, self.act_jaipur1.id)
        self.assertNotEqual(ta_t1.trip_id, ta_t2.trip_id)

    def test_trip_activity_dto_serialization(self):
        ta = self.trip_act_service.add_activity_to_stop(
            trip_id=self.trip.id,
            stop_id=self.stop_jaipur.id,
            activity_id=self.act_jaipur1.id,
            requesting_user_id=10,
            scheduled_date=date(2026, 9, 2),
            start_time="09:30",
            end_time="12:30",
            notes="Camera pass required"
        )
        dto = TripActivityResponse.from_domain(ta)

        self.assertEqual(dto.trip_id, self.trip.id)
        self.assertEqual(dto.stop_id, self.stop_jaipur.id)
        self.assertEqual(dto.activity_id, self.act_jaipur1.id)
        self.assertEqual(dto.scheduled_date, "2026-09-02")
        self.assertEqual(dto.start_time, "09:30")
        self.assertEqual(dto.end_time, "12:30")
        self.assertEqual(dto.notes, "Camera pass required")
        self.assertIsNotNone(dto.activity)
        self.assertEqual(dto.activity.name, "Fort Tour")


if __name__ == '__main__':
    unittest.main()
