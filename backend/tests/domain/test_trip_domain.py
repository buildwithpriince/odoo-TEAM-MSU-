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
from backend.src.services.trip_service import TripService
from backend.src.api.schemas.trip_schemas import TripResponse


class TestTripDomainBehavior(unittest.TestCase):
    """Comprehensive behavioral unit test suite for Trip domain model and rules."""

    def test_valid_trip_creation(self):
        trip = Trip(
            id=1,
            name="Rajasthan Cultural Tour",
            description="Exploring Jaipur and Udaipur",
            owner_id=42,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 7),
            target_budget=45000.0,
            currency_code="INR",
            cover_image="https://example.com/jaipur.jpg",
            travel_vibe="Cultural Explorer"
        )
        self.assertEqual(trip.name, "Rajasthan Cultural Tour")
        self.assertEqual(trip.owner_id, 42)
        self.assertEqual(trip.target_budget, 45000.0)
        self.assertEqual(trip.state, TripStatus.DRAFT)
        self.assertEqual(trip.duration_days, 7)

    def test_required_name_validation(self):
        with self.assertRaises(ValueError):
            Trip(name="", owner_id=1)

        with self.assertRaises(ValueError):
            Trip(name="   ", owner_id=1)

    def test_valid_date_range(self):
        trip = Trip(
            name="North India Tour",
            owner_id=1,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 10)
        )
        self.assertEqual(trip.duration_days, 10)

    def test_same_day_trip_duration(self):
        trip = Trip(
            name="Day Trip to Agra",
            owner_id=1,
            start_date=date(2026, 10, 5),
            end_date=date(2026, 10, 5)
        )
        self.assertEqual(trip.duration_days, 1)

    def test_invalid_date_range_fails(self):
        with self.assertRaises(InvalidTripDatesError):
            Trip(
                name="Backwards Time Trip",
                owner_id=1,
                start_date=date(2026, 9, 10),
                end_date=date(2026, 9, 1)
            )

    def test_zero_budget_succeeds(self):
        trip = Trip(name="Backpacking Trip", owner_id=1, target_budget=0.0)
        self.assertEqual(trip.target_budget, 0.0)

    def test_positive_budget_succeeds(self):
        trip = Trip(name="Luxury Trip", owner_id=1, target_budget=150000.0)
        self.assertEqual(trip.target_budget, 150000.0)

    def test_negative_target_budget_fails(self):
        with self.assertRaises(InvalidTripBudgetError):
            Trip(
                name="Negative Budget Trip",
                owner_id=1,
                target_budget=-500.0
            )

    def test_update_dates_revalidates(self):
        trip = Trip(
            name="Flexible Trip",
            owner_id=1,
            start_date=date(2026, 8, 1),
            end_date=date(2026, 8, 5)
        )
        self.assertEqual(trip.duration_days, 5)

        # Valid date update
        trip.update_dates(date(2026, 8, 1), date(2026, 8, 10))
        self.assertEqual(trip.duration_days, 10)

        # Invalid date update fails
        with self.assertRaises(InvalidTripDatesError):
            trip.update_dates(date(2026, 8, 15), date(2026, 8, 10))

    def test_update_budget_revalidates(self):
        trip = Trip(name="Budget Trip", owner_id=1, target_budget=1000.0)
        trip.update_budget(2500.0)
        self.assertEqual(trip.target_budget, 2500.0)

        with self.assertRaises(InvalidTripBudgetError):
            trip.update_budget(-1.0)


class TestTripServiceBehavior(unittest.TestCase):
    """Behavioral unit test suite for TripService and ownership enforcement."""

    def setUp(self):
        self.service = TripService()

    def test_create_and_retrieve_trip(self):
        trip = self.service.create_trip(
            owner_id=10,
            name="Himalayan Trek",
            description="Manali to Leh",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 10),
            target_budget=30000.0
        )
        self.assertEqual(trip.id, 1)

        fetched = self.service.get_trip(trip_id=1, requesting_user_id=10)
        self.assertEqual(fetched.name, "Himalayan Trek")
        self.assertEqual(fetched.owner_id, 10)

    def test_trip_ownership_enforcement(self):
        trip = self.service.create_trip(
            owner_id=100,
            name="Private Trip User 100",
            target_budget=15000.0
        )

        # Owner access succeeds
        self.assertEqual(self.service.get_trip(trip.id, requesting_user_id=100).name, "Private Trip User 100")

        # Non-owner access fails with TripOwnershipError
        with self.assertRaises(TripOwnershipError):
            self.service.get_trip(trip.id, requesting_user_id=999)

        with self.assertRaises(TripOwnershipError):
            self.service.update_trip(trip.id, requesting_user_id=999, name="Hacked Name")

        with self.assertRaises(TripOwnershipError):
            self.service.delete_trip(trip.id, requesting_user_id=999)

    def test_list_user_trips_filtering(self):
        self.service.create_trip(owner_id=1, name="User 1 Trip A")
        self.service.create_trip(owner_id=1, name="User 1 Trip B")
        self.service.create_trip(owner_id=2, name="User 2 Trip A")

        user1_trips = self.service.list_user_trips(owner_id=1)
        user2_trips = self.service.list_user_trips(owner_id=2)

        self.assertEqual(len(user1_trips), 2)
        self.assertEqual(len(user2_trips), 1)
        self.assertEqual(user2_trips[0].name, "User 2 Trip A")

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
        self.assertEqual(response_dto.id, 7)
        self.assertEqual(response_dto.name, "Kerala Backwaters")
        self.assertEqual(response_dto.owner_id, 50)
        self.assertEqual(response_dto.start_date, "2026-11-01")
        self.assertEqual(response_dto.end_date, "2026-11-05")
        self.assertEqual(response_dto.duration_days, 5)
        self.assertEqual(response_dto.state, "planned")
        self.assertEqual(response_dto.cover_image, "https://example.com/kerala.jpg")


if __name__ == '__main__':
    unittest.main()
