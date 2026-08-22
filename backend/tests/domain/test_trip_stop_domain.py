# -*- coding: utf-8 -*-
from datetime import date
import unittest

from backend.src.domain.models.city import City
from backend.src.domain.models.trip import Trip
from backend.src.domain.models.trip_stop import TripStop
from backend.src.domain.rules.trip_stop_rules import (
    InvalidStopSequenceError,
    InvalidStopDatesError,
    StopOutsideTripDatesError,
)
from backend.src.services.trip_service import TripService
from backend.src.services.city_service import CityService
from backend.src.services.trip_stop_service import TripStopService
from backend.src.api.schemas.trip_stop_schemas import TripStopResponse


class TestTripStopDomainBehavior(unittest.TestCase):
    """Behavioral unit test suite for TripStop entity and date boundary rules."""

    def test_valid_trip_stop_creation(self):
        city = City(id=10, name="Jaipur", country="India")
        stop = TripStop(
            id=1,
            trip_id=100,
            city_id=10,
            sequence=1,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 4),
            city=city,
            notes="Visiting Hawa Mahal and Amber Fort"
        )
        self.assertEqual(stop.trip_id, 100)
        self.assertEqual(stop.city_id, 10)
        self.assertEqual(stop.sequence, 1)
        self.assertEqual(stop.duration_days, 4)
        self.assertEqual(stop.city.name, "Jaipur")

    def test_same_day_stop(self):
        stop = TripStop(
            trip_id=1,
            city_id=2,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 1)
        )
        self.assertEqual(stop.duration_days, 1)

    def test_invalid_sequence_rejected(self):
        with self.assertRaises(InvalidStopSequenceError):
            TripStop(trip_id=1, city_id=1, sequence=0)

    def test_invalid_date_range_rejected(self):
        with self.assertRaises(InvalidStopDatesError):
            TripStop(
                trip_id=1,
                city_id=1,
                start_date=date(2026, 9, 10),
                end_date=date(2026, 9, 5)
            )

    def test_stop_outside_trip_start_date_fails(self):
        trip = Trip(
            id=1,
            name="Rajasthan Tour",
            owner_id=1,
            start_date=date(2026, 9, 5),
            end_date=date(2026, 9, 15)
        )
        stop = TripStop(
            id=1,
            trip_id=1,
            city_id=1,
            start_date=date(2026, 9, 1),  # Before trip start date (Sept 5)
            end_date=date(2026, 9, 7)
        )
        with self.assertRaises(StopOutsideTripDatesError):
            trip.add_stop(stop)

    def test_stop_outside_trip_end_date_fails(self):
        trip = Trip(
            id=1,
            name="Rajasthan Tour",
            owner_id=1,
            start_date=date(2026, 9, 5),
            end_date=date(2026, 9, 15)
        )
        stop = TripStop(
            id=1,
            trip_id=1,
            city_id=1,
            start_date=date(2026, 9, 10),
            end_date=date(2026, 9, 20)  # After trip end date (Sept 15)
        )
        with self.assertRaises(StopOutsideTripDatesError):
            trip.add_stop(stop)


class TestTripStopIntegrationAndReordering(unittest.TestCase):
    """Behavioral unit test suite for TripStopService, Trip integration, and deterministic reordering."""

    def setUp(self):
        self.trip_service = TripService()
        self.city_service = CityService()
        self.stop_service = TripStopService(self.trip_service, self.city_service)

        # Provision test cities
        self.city_jaipur = self.city_service.create_city(name="Jaipur", country="India")
        self.city_jodhpur = self.city_service.create_city(name="Jodhpur", country="India")
        self.city_udaipur = self.city_service.create_city(name="Udaipur", country="India")

        # Provision test trip (Sept 1 to Sept 20)
        self.trip = self.trip_service.create_trip(
            owner_id=5,
            name="Royal Rajasthan",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 20)
        )

    def test_add_multiple_stops_preserves_deterministic_sequence(self):
        stop1 = self.stop_service.add_stop(
            trip_id=self.trip.id,
            city_id=self.city_jaipur.id,
            requesting_user_id=5,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 5)
        )
        stop2 = self.stop_service.add_stop(
            trip_id=self.trip.id,
            city_id=self.city_jodhpur.id,
            requesting_user_id=5,
            start_date=date(2026, 9, 6),
            end_date=date(2026, 9, 10)
        )
        stop3 = self.stop_service.add_stop(
            trip_id=self.trip.id,
            city_id=self.city_udaipur.id,
            requesting_user_id=5,
            start_date=date(2026, 9, 11),
            end_date=date(2026, 9, 15)
        )

        self.assertEqual(len(self.trip.stops), 3)
        self.assertEqual(stop1.sequence, 1)
        self.assertEqual(stop2.sequence, 2)
        self.assertEqual(stop3.sequence, 3)

    def test_reorder_stops_last_to_first(self):
        stop1 = self.stop_service.add_stop(self.trip.id, self.city_jaipur.id, 5)
        stop2 = self.stop_service.add_stop(self.trip.id, self.city_jodhpur.id, 5)
        stop3 = self.stop_service.add_stop(self.trip.id, self.city_udaipur.id, 5)

        # Move stop3 (Udaipur) to position 1 -> [stop3, stop1, stop2]
        reordered = self.stop_service.reorder_stops(
            trip_id=self.trip.id,
            requesting_user_id=5,
            ordered_stop_ids=[stop3.id, stop1.id, stop2.id]
        )

        self.assertEqual(reordered[0].id, stop3.id)
        self.assertEqual(reordered[0].sequence, 1)
        self.assertEqual(reordered[1].id, stop1.id)
        self.assertEqual(reordered[1].sequence, 2)
        self.assertEqual(reordered[2].id, stop2.id)
        self.assertEqual(reordered[2].sequence, 3)

    def test_remove_middle_stop_resequences(self):
        stop1 = self.stop_service.add_stop(self.trip.id, self.city_jaipur.id, 5)
        stop2 = self.stop_service.add_stop(self.trip.id, self.city_jodhpur.id, 5)
        stop3 = self.stop_service.add_stop(self.trip.id, self.city_udaipur.id, 5)

        # Remove stop2 (middle)
        self.stop_service.remove_stop(self.trip.id, stop2.id, 5)

        self.assertEqual(len(self.trip.stops), 2)
        self.assertEqual(self.trip.stops[0].id, stop1.id)
        self.assertEqual(self.trip.stops[0].sequence, 1)
        self.assertEqual(self.trip.stops[1].id, stop3.id)
        self.assertEqual(self.trip.stops[1].sequence, 2)

    def test_same_city_in_multiple_trips(self):
        trip2 = self.trip_service.create_trip(owner_id=10, name="Second Trip")

        stop_t1 = self.stop_service.add_stop(self.trip.id, self.city_jaipur.id, 5)
        stop_t2 = self.stop_service.add_stop(trip2.id, self.city_jaipur.id, 10)

        self.assertEqual(stop_t1.city_id, self.city_jaipur.id)
        self.assertEqual(stop_t2.city_id, self.city_jaipur.id)
        self.assertNotEqual(stop_t1.trip_id, stop_t2.trip_id)

    def test_stop_dto_translation(self):
        stop = self.stop_service.add_stop(
            trip_id=self.trip.id,
            city_id=self.city_jaipur.id,
            requesting_user_id=5,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 3),
            notes="Fort tour"
        )
        dto = TripStopResponse.from_domain(stop)

        self.assertEqual(dto.trip_id, self.trip.id)
        self.assertEqual(dto.city_id, self.city_jaipur.id)
        self.assertEqual(dto.sequence, 1)
        self.assertEqual(dto.start_date, "2026-09-01")
        self.assertEqual(dto.end_date, "2026-09-03")
        self.assertEqual(dto.duration_days, 3)
        self.assertIsNotNone(dto.city)
        self.assertEqual(dto.city.name, "Jaipur")


if __name__ == '__main__':
    unittest.main()
