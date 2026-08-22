# -*- coding: utf-8 -*-
from datetime import date
import unittest

from backend.src.domain.models.city import City
from backend.src.domain.models.trip import Trip
from backend.src.domain.models.trip_stop import TripStop
from backend.src.domain.rules.trip_stop_rules import (
    InvalidStopDatesError,
    StopOutsideTripDatesError,
)
from backend.src.infrastructure.database.connection import init_db, Base, engine
from backend.src.services.trip_service import TripService
from backend.src.services.city_service import CityService
from backend.src.services.trip_stop_service import TripStopService
from backend.src.api.schemas.trip_stop_schemas import TripStopResponse


class TestTripStopDomainBehavior(unittest.TestCase):
    """Behavioral unit test suite for TripStop entity and domain validation rules."""

    def test_valid_trip_stop_creation(self):
        city = City(id=1, name="Jaipur", country="India")
        stop = TripStop(
            id=10,
            trip_id=1,
            city_id=1,
            sequence=1,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 4),
            city=city,
            notes="Stay near Hawa Mahal"
        )
        self.assertEqual(stop.city.name, "Jaipur")
        self.assertEqual(stop.duration_days, 4)

    def test_stop_end_date_before_start_date_fails(self):
        with self.assertRaises(InvalidStopDatesError):
            TripStop(
                trip_id=1,
                city_id=1,
                start_date=date(2026, 9, 5),
                end_date=date(2026, 9, 1)
            )

    def test_stop_outside_trip_dates_fails(self):
        trip = Trip(
            id=1,
            name="Rajasthan Trip",
            owner_id=1,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 10)
        )
        city = City(id=1, name="Jaipur", country="India")
        invalid_stop = TripStop(
            trip_id=1,
            city_id=1,
            start_date=date(2026, 8, 25),  # Before trip start
            end_date=date(2026, 9, 3),
            city=city
        )
        with self.assertRaises(StopOutsideTripDatesError):
            trip.add_stop(invalid_stop)


class TestTripStopIntegrationAndReordering(unittest.TestCase):
    """Integration unit test suite for TripStop sequence ordering and reordering."""

    def setUp(self):
        init_db()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        self.trip_service = TripService()
        self.city_service = CityService()
        self.stop_service = TripStopService(self.trip_service, self.city_service)

        self.jaipur = self.city_service.create_city(name="Jaipur", country="India")
        self.jodhpur = self.city_service.create_city(name="Jodhpur", country="India")
        self.udaipur = self.city_service.create_city(name="Udaipur", country="India")

        self.trip = self.trip_service.create_trip(
            owner_id=1,
            name="Rajasthan Tour",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 15)
        )

    def test_add_multiple_stops_preserves_deterministic_sequence(self):
        s1 = self.stop_service.add_stop(self.trip.id, self.jaipur.id, 1, start_date=date(2026, 9, 1), end_date=date(2026, 9, 5))
        s2 = self.stop_service.add_stop(self.trip.id, self.jodhpur.id, 1, start_date=date(2026, 9, 6), end_date=date(2026, 9, 10))
        s3 = self.stop_service.add_stop(self.trip.id, self.udaipur.id, 1, start_date=date(2026, 9, 11), end_date=date(2026, 9, 15))

        trip = self.trip_service.get_trip(self.trip.id, 1)
        self.assertEqual(len(trip.stops), 3)
        self.assertEqual([s.sequence for s in trip.stops], [1, 2, 3])
        self.assertEqual([s.city.name for s in trip.stops], ["Jaipur", "Jodhpur", "Udaipur"])

    def test_reorder_stops_last_to_first(self):
        s1 = self.stop_service.add_stop(self.trip.id, self.jaipur.id, 1)
        s2 = self.stop_service.add_stop(self.trip.id, self.jodhpur.id, 1)
        s3 = self.stop_service.add_stop(self.trip.id, self.udaipur.id, 1)

        # Reorder to [Udaipur, Jaipur, Jodhpur]
        reordered = self.stop_service.reorder_stops(self.trip.id, [s3.id, s1.id, s2.id], requesting_user_id=1)
        self.assertEqual([s.sequence for s in reordered], [1, 2, 3])
        self.assertEqual([s.city.name for s in reordered], ["Udaipur", "Jaipur", "Jodhpur"])

    def test_remove_middle_stop_resequences(self):
        s1 = self.stop_service.add_stop(self.trip.id, self.jaipur.id, 1)
        s2 = self.stop_service.add_stop(self.trip.id, self.jodhpur.id, 1)
        s3 = self.stop_service.add_stop(self.trip.id, self.udaipur.id, 1)

        self.stop_service.remove_stop(self.trip.id, s2.id, requesting_user_id=1)
        trip = self.trip_service.get_trip(self.trip.id, 1)
        self.assertEqual(len(trip.stops), 2)
        self.assertEqual([s.sequence for s in trip.stops], [1, 2])
        self.assertEqual([s.city.name for s in trip.stops], ["Jaipur", "Udaipur"])

    def test_same_city_in_multiple_trips(self):
        trip2 = self.trip_service.create_trip(owner_id=2, name="Another Trip")
        s_trip1 = self.stop_service.add_stop(self.trip.id, self.jaipur.id, 1)
        s_trip2 = self.stop_service.add_stop(trip2.id, self.jaipur.id, 2)

        self.assertEqual(s_trip1.city_id, self.jaipur.id)
        self.assertEqual(s_trip2.city_id, self.jaipur.id)
        self.assertNotEqual(s_trip1.trip_id, s_trip2.trip_id)

    def test_stop_dto_translation(self):
        stop = TripStop(
            id=5,
            trip_id=1,
            city_id=self.jaipur.id,
            sequence=1,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 4),
            city=self.jaipur,
            notes="Near Pink City"
        )
        dto = TripStopResponse.from_domain(stop)
        self.assertEqual(dto.id, "5")
        self.assertEqual(dto.cityName, "Jaipur")
        self.assertEqual(dto.country, "India")
        self.assertEqual(dto.arrivalDate, "2026-09-01")
        self.assertEqual(dto.departureDate, "2026-09-04")
        self.assertEqual(dto.notes, "Near Pink City")


if __name__ == '__main__':
    unittest.main()
