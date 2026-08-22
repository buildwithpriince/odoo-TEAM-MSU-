# -*- coding: utf-8 -*-
from datetime import date
import unittest

from backend.src.infrastructure.database.connection import init_db, Base, engine
from backend.src.services.trip_service import TripService
from backend.src.services.city_service import CityService
from backend.src.services.trip_stop_service import TripStopService
from backend.src.services.activity_service import ActivityService
from backend.src.services.trip_activity_service import TripActivityService
from backend.src.services.itinerary_service import ItineraryService


class TestItineraryServiceBehavior(unittest.TestCase):
    """Behavioral unit test suite for server-projected day-wise itineraries."""

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
        self.itinerary_service = ItineraryService(self.trip_service)

        self.jaipur = self.city_service.create_city(name="Jaipur", country="India")
        self.udaipur = self.city_service.create_city(name="Udaipur", country="India")

        self.act_jaipur1 = self.activity_service.create_activity("Amber Fort", self.jaipur.id, cost=500.0)
        self.act_jaipur2 = self.activity_service.create_activity("Hawa Mahal", self.jaipur.id, cost=200.0)

        # Trip: Sept 1 to Sept 5 = 5 Days
        self.trip = self.trip_service.create_trip(
            owner_id=1,
            name="Rajasthan Circuit",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 5)
        )

        self.stop1 = self.stop_service.add_stop(self.trip.id, self.jaipur.id, 1, start_date=date(2026, 9, 1), end_date=date(2026, 9, 3))
        self.stop2 = self.stop_service.add_stop(self.trip.id, self.udaipur.id, 1, start_date=date(2026, 9, 4), end_date=date(2026, 9, 5))

    def test_day_count_and_sequential_day_numbers(self):
        itinerary = self.itinerary_service.get_itinerary(self.trip.id, requesting_user_id=1)
        self.assertEqual(len(itinerary.days), 5)
        self.assertEqual([d.dayNumber for d in itinerary.days], [1, 2, 3, 4, 5])
        self.assertEqual([d.date for d in itinerary.days], [
            "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05"
        ])

    def test_city_associated_with_matching_day_dates(self):
        itinerary = self.itinerary_service.get_itinerary(self.trip.id, requesting_user_id=1)
        self.assertEqual(itinerary.days[0].city.name, "Jaipur")
        self.assertEqual(itinerary.days[1].city.name, "Jaipur")
        self.assertEqual(itinerary.days[2].city.name, "Jaipur")
        self.assertEqual(itinerary.days[3].city.name, "Udaipur")
        self.assertEqual(itinerary.days[4].city.name, "Udaipur")

    def test_activity_assigned_to_matching_scheduled_date_chronologically(self):
        # Add Amber Fort at 14:00 and Hawa Mahal at 09:00 on Sept 2 (Day 2)
        self.trip_act_service.add_activity_to_stop(
            self.trip.id, self.stop1.id, self.act_jaipur1.id, 1,
            scheduled_date=date(2026, 9, 2), start_time="14:00"
        )
        self.trip_act_service.add_activity_to_stop(
            self.trip.id, self.stop1.id, self.act_jaipur2.id, 1,
            scheduled_date=date(2026, 9, 2), start_time="09:00"
        )

        itinerary = self.itinerary_service.get_itinerary(self.trip.id, requesting_user_id=1)
        day2 = itinerary.days[1]

        self.assertEqual(len(day2.activities), 2)
        # Should be sorted chronologically by start_time (09:00 before 14:00)
        self.assertEqual(day2.activities[0].title, "Hawa Mahal")
        self.assertEqual(day2.activities[1].title, "Amber Fort")
        self.assertEqual(day2.daily_total_cost, 700.0)


if __name__ == '__main__':
    unittest.main()
