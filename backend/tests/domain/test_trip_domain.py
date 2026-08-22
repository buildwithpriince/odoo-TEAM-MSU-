# -*- coding: utf-8 -*-
from datetime import date
import unittest

from backend.src.domain.models.trip import Trip
from backend.src.domain.enums.trip_status import TripStatus
from backend.src.domain.rules.trip_rules import (
    InvalidTripDatesError,
    InvalidTripBudgetError,
    TripOwnershipError,
)
from backend.src.infrastructure.database.connection import init_db, Base, engine
from backend.src.services.trip_service import TripService
from backend.src.api.schemas.trip_schemas import TripResponse


class TestTripDomainBehavior(unittest.TestCase):
    """Behavioral unit test suite for Trip entity, rules, and invariants."""

    def test_valid_trip_creation(self):
        trip = Trip(
            id=1,
            name="Rajasthan Cultural Tour",
            description="Exploring Jaipur & Udaipur",
            owner_id=10,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 10),
            target_budget=25000.0,
            currency_code="INR",
            state=TripStatus.PLANNED,
            cover_image="https://example.com/jaipur.jpg",
            travel_vibe="Culture & Heritage"
        )
        self.assertEqual(trip.name, "Rajasthan Cultural Tour")
        self.assertEqual(trip.owner_id, 10)
        self.assertEqual(trip.duration_days, 10)
        self.assertEqual(trip.target_budget, 25000.0)
        self.assertEqual(trip.state, TripStatus.PLANNED)

    def test_empty_name_fails(self):
        with self.assertRaises(ValueError):
            Trip(name="", owner_id=1)

        with self.assertRaises(ValueError):
            Trip(name="   ", owner_id=1)

    def test_end_date_before_start_date_fails(self):
        with self.assertRaises(InvalidTripDatesError):
            Trip(
                name="Invalid Dates Trip",
                owner_id=1,
                start_date=date(2026, 9, 10),
                end_date=date(2026, 9, 1)
            )

    def test_same_start_and_end_date_valid_one_day_trip(self):
        trip = Trip(
            name="Day Trip",
            owner_id=1,
            start_date=date(2026, 9, 5),
            end_date=date(2026, 9, 5)
        )
        self.assertEqual(trip.duration_days, 1)

    def test_negative_target_budget_fails(self):
        with self.assertRaises(InvalidTripBudgetError):
            Trip(
                name="Negative Budget Trip",
                owner_id=1,
                target_budget=-100.0
            )

    def test_zero_target_budget_valid(self):
        trip = Trip(
            name="Free Backpacking",
            owner_id=1,
            target_budget=0.0
        )
        self.assertEqual(trip.target_budget, 0.0)

    def test_update_dates_validates_invariants(self):
        trip = Trip(
            name="Flexible Trip",
            owner_id=1,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 5)
        )
        trip.update_dates(date(2026, 9, 2), date(2026, 9, 8))
        self.assertEqual(trip.duration_days, 7)

        with self.assertRaises(InvalidTripDatesError):
            trip.update_dates(date(2026, 9, 10), date(2026, 9, 5))

    def test_update_budget_validates_invariants(self):
        trip = Trip(
            name="Budget Trip",
            owner_id=1,
            target_budget=10000.0
        )
        trip.update_budget(15000.0)
        self.assertEqual(trip.target_budget, 15000.0)

        with self.assertRaises(InvalidTripBudgetError):
            trip.update_budget(-50.0)


class TestTripServiceBehavior(unittest.TestCase):
    """Behavioral unit test suite for TripService operations."""

    def setUp(self):
        init_db()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        self.service = TripService()

    def test_create_and_retrieve_trip(self):
        created = self.service.create_trip(
            owner_id=100,
            name="Goa Beach Vacation",
            start_date=date(2026, 10, 1),
            end_date=date(2026, 10, 5),
            target_budget=30000.0
        )
        self.assertIsNotNone(created.id)

        retrieved = self.service.get_trip(created.id, requesting_user_id=100)
        self.assertEqual(retrieved.name, "Goa Beach Vacation")
        self.assertEqual(retrieved.owner_id, 100)

    def test_trip_ownership_enforcement(self):
        trip = self.service.create_trip(
            owner_id=100,
            name="User 100 Private Trip"
        )
        with self.assertRaises(TripOwnershipError):
            self.service.get_trip(trip.id, requesting_user_id=200)

        with self.assertRaises(TripOwnershipError):
            self.service.update_trip(trip.id, requesting_user_id=200, name="Hacked Name")

        with self.assertRaises(TripOwnershipError):
            self.service.delete_trip(trip.id, requesting_user_id=200)

    def test_list_user_trips_filtering(self):
        self.service.create_trip(owner_id=1, name="Trip 1 User 1")
        self.service.create_trip(owner_id=1, name="Trip 2 User 1")
        self.service.create_trip(owner_id=2, name="Trip 1 User 2")

        user1_trips = self.service.list_user_trips(1)
        user2_trips = self.service.list_user_trips(2)

        self.assertEqual(len(user1_trips), 2)
        self.assertEqual(len(user2_trips), 1)

    def test_api_schema_translation(self):
        trip = Trip(
            id=7,
            name="Kerala Backwaters",
            description="Relaxing house boat tour",
            owner_id=50,
            start_date=date(2026, 11, 1),
            end_date=date(2026, 11, 5),
            target_budget=20000.0,
            currency_code="INR",
            state=TripStatus.PLANNED,
            cover_image="https://example.com/kerala.jpg",
            travel_vibe="Relaxation"
        )
        response_dto = TripResponse.from_domain(trip)
        self.assertEqual(response_dto.id, "7")
        self.assertEqual(response_dto.name, "Kerala Backwaters")
        self.assertEqual(response_dto.owner_id, 50)
        self.assertEqual(response_dto.start_date, "2026-11-01")
        self.assertEqual(response_dto.end_date, "2026-11-05")
        self.assertEqual(response_dto.duration_days, 5)
        self.assertEqual(response_dto.status, "upcoming")
        self.assertEqual(response_dto.coverImage, "https://example.com/kerala.jpg")


if __name__ == '__main__':
    unittest.main()
